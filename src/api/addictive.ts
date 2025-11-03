// 搜索添加剂以及营养物质
// 使用实例：
// import { searchAdditive, searchIngredient } from '@/src/api/additive';
/*** 
async function onSearchIngredient() {
  try {
    const res = await searchIngredient('鸡肉粉'); // 中文将被自动 URL 编码
    console.log(res.additive.name, res.query);
  } catch (e: any) {
    Alert.alert('请求失败', e?.message ?? '网络错误');
  }
}

async function onSearchAdditive() {
  try {
    const res = await searchAdditive('维生素E');
    console.log(res.additive.type, res.additive.en_name);
  } catch (e: any) {
    Alert.alert('请求失败', e?.message ?? '网络错误');
  }
}
***/


// 公共类型
export interface Additive {
  /** 添加剂适用范围 */
  applicable_range: string;
  /** 添加剂英文名 */
  en_name: string;
  /** id */
  id: number;
  /** 添加剂名称 */
  name: string;
  /** 添加剂类型 */
  type: string;
  [property: string]: any;
}

export interface SearchResponse {
  /** 命中的添加剂（后端返回字段为 additive） */
  additive: Additive;
  /** 搜索字段（中文需 URL 编码） */
  query: string;
  [property: string]: any;
}

const BASE_URL = 'http://82.157.255.92';
const DEFAULT_TIMEOUT = 10000; // 10s

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
}

async function requestJson<T>(url: string, timeout = DEFAULT_TIMEOUT): Promise<T> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal, redirect: 'follow' as RequestRedirect });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    // 优先按 JSON 解析，若后端返回 text(JSON 字符串)则手动 parse
    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      // 非 JSON 返回时抛错，便于上层处理
      throw new Error('Unexpected non-JSON response: ' + text);
    }
  } finally {
    clearTimeout(to);
  }
}

/**
 * 搜索添加剂
 * 优先用 name 参数，请求 400 时回退到 keyword 参数
 */
export async function searchAdditive(q: string): Promise<SearchResponse> {
  // 尝试 name
  let url = buildUrl('/additive/search-additive/', { name: q });
  try {
    return await requestJson<SearchResponse>(url);
  } catch (e: any) {
    if (String(e?.message || '').includes('HTTP 400')) {
      // 回退 keyword
      url = buildUrl('/additive/search-additive/', { keyword: q });
      return await requestJson<SearchResponse>(url);
    }
    throw e;
  }
}

/**
 * 搜索营养成分/原料
 * 优先用 name 参数，请求 400 时回退到 keyword 参数
 */
export async function searchIngredient(q: string): Promise<SearchResponse> {
  // 尝试 name
  let url = buildUrl('/additive/search-ingredient/', { name: q });
  try {
    return await requestJson<SearchResponse>(url);
  } catch (e: any) {
    if (String(e?.message || '').includes('HTTP 400')) {
      // 回退 keyword
      url = buildUrl('/additive/search-ingredient/', { keyword: q });
      return await requestJson<SearchResponse>(url);
    }
    throw e;
  }
}

