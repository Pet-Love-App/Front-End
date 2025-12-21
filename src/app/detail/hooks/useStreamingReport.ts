/**
 * useStreamingReport Hook
 *
 * 处理 AI 报告的流式生成
 * 支持实时显示、取消请求、错误处理
 */

import { useCallback, useRef, useState } from 'react';

import { API_BASE_URL } from '@/src/config/env';
import { useUserStore } from '@/src/store/userStore';
import { logger } from '@/src/utils/logger';

// ==================== 类型定义 ====================

/** 流式状态 */
export interface StreamingState {
  /** 当前流式内容 */
  content: string;
  /** 是否正在流式传输 */
  isStreaming: boolean;
  /** 是否已完成 */
  isComplete: boolean;
  /** 错误信息 */
  error: string | null;
  /** 进度估算 (0-100) */
  progress: number;
}

/** Hook 返回值 */
export interface UseStreamingReportReturn {
  /** 流式状态 */
  state: StreamingState;
  /** 开始流式生成 */
  startStreaming: (catfoodId: number, ingredients: string) => Promise<void>;
  /** 停止流式传输 */
  stopStreaming: () => void;
  /** 重置状态 */
  reset: () => void;
}

// ==================== 常量 ====================

const INITIAL_STATE: StreamingState = {
  content: '',
  isStreaming: false,
  isComplete: false,
  error: null,
  progress: 0,
};

// 估计的总字符数（用于进度计算）
const ESTIMATED_TOTAL_CHARS = 1500;

// ==================== Hook 实现 ====================

export function useStreamingReport(): UseStreamingReportReturn {
  const [state, setState] = useState<StreamingState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentRef = useRef<string>('');

  /**
   * 开始流式生成
   */
  const startStreaming = useCallback(async (catfoodId: number, ingredients: string) => {
    // 重置状态
    contentRef.current = '';
    setState({
      content: '',
      isStreaming: true,
      isComplete: false,
      error: null,
      progress: 0,
    });

    // 创建 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 获取 token
      const token = useUserStore.getState().accessToken;
      if (!token) {
        throw new Error('未登录');
      }

      logger.info('开始流式生成 AI 报告', { catfoodId });

      // 发起流式请求
      const response = await fetch(`${API_BASE_URL}/api/ai/${catfoodId}/stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ingredients }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 获取 ReadableStream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();

      // 读取流
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // 流正常结束
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            isComplete: true,
            progress: 100,
          }));
          logger.info('流式生成完成', { catfoodId });
          break;
        }

        // 解码数据
        const chunk = decoder.decode(value, { stream: true });

        // 解析 SSE 格式
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // 去掉 "data: " 前缀

            if (data === '[DONE]') {
              // 流结束标记
              setState((prev) => ({
                ...prev,
                isStreaming: false,
                isComplete: true,
                progress: 100,
              }));
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.content) {
                // 追加内容
                contentRef.current += parsed.content;

                // 计算进度
                const progress = Math.min(
                  (contentRef.current.length / ESTIMATED_TOTAL_CHARS) * 100,
                  95
                );

                setState((prev) => ({
                  ...prev,
                  content: contentRef.current,
                  progress,
                }));
              }

              if (parsed.error) {
                // If we throw here, it is caught by the inner catch (parseError)
                // We need to rethrow or handle it.
                // But wait, the inner catch is for JSON.parse errors or logic errors inside try block.
                // If we throw here, it goes to catch (parseError).
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              // If it was our thrown error, we should probably rethrow it to the outer catch?
              // Or handle it here.
              // The current code swallows it if it's an Error object, unless we check.

              if (parseError instanceof Error && parseError.message && !parseError.message.includes('JSON')) {
                // It might be the error we threw above.
                // But wait, if JSON.parse fails, it throws SyntaxError.
                // If we throw Error(parsed.error), it is an Error.

                // The issue is that the catch block below:
                // if (data && data !== '[DONE]' && !data.startsWith('{'))
                // This logic is for when JSON.parse fails (non-JSON data).

                // If we throw an error inside the try block, it is caught here.
                // And then ignored because of the if condition (data starts with '{' for json).

                // So the error is swallowed.

                // We should rethrow if it is a "real" error we want to propagate.
                throw parseError;
              }

              // 忽略非 JSON 数据
              if (data && data !== '[DONE]' && !data.startsWith('{')) {
                contentRef.current += data;
                setState((prev) => ({
                  ...prev,
                  content: contentRef.current,
                }));
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // 用户主动取消
          logger.info('用户取消流式生成');
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: null,
          }));
        } else {
          // 其他错误
          logger.error('流式生成失败', error);
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: error.message || '生成报告失败',
          }));
        }
      }
    }
  }, []);

  /**
   * 停止流式传输
   */
  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    contentRef.current = '';
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    startStreaming,
    stopStreaming,
    reset,
  };
}
