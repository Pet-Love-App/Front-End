#!/usr/bin/env node

/**
 * Lottie 动画文件压缩脚本
 *
 * 使用方法：
 * node scripts/optimize-lottie.js
 */

const fs = require('fs');
const path = require('path');

const ANIMATIONS_DIR = path.join(__dirname, '../assets/animations');

/**
 * 压缩 Lottie JSON 文件
 * @param {string} filePath 文件路径
 * @returns {Promise<{originalSize: number, compressedSize: number, ratio: number}>}
 */
function compressLottieFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      // 读取原始文件
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const originalSize = Buffer.byteLength(originalContent, 'utf8');

      // 解析 JSON
      const json = JSON.parse(originalContent);

      // 移除不必要的属性
      function cleanObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;

        // 移除这些不必要的属性
        const removeKeys = ['nm', 'mn', 'hd', 'ddd', 'sr', 'ind'];
        removeKeys.forEach((key) => delete obj[key]);

        // 递归处理数组和对象
        Object.keys(obj).forEach((key) => {
          if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map(cleanObject);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = cleanObject(obj[key]);
          }
          // 移除空数组和空对象
          if (Array.isArray(obj[key]) && obj[key].length === 0) {
            delete obj[key];
          }
          if (
            typeof obj[key] === 'object' &&
            obj[key] !== null &&
            Object.keys(obj[key]).length === 0
          ) {
            delete obj[key];
          }
        });

        return obj;
      }

      // 清理 JSON
      const cleanedJson = cleanObject(json);

      // 压缩：移除空格和换行
      const compressedContent = JSON.stringify(cleanedJson);
      const compressedSize = Buffer.byteLength(compressedContent, 'utf8');

      // 保存压缩后的文件
      fs.writeFileSync(filePath, compressedContent, 'utf8');

      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

      resolve({
        originalSize,
        compressedSize,
        ratio: parseFloat(ratio),
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 开始压缩 Lottie 动画文件...\n');

  try {
    const files = fs.readdirSync(ANIMATIONS_DIR).filter((file) => file.endsWith('.json'));

    if (files.length === 0) {
      console.log('❌ 没有找到 Lottie JSON 文件');
      return;
    }

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    for (const file of files) {
      const filePath = path.join(ANIMATIONS_DIR, file);
      console.log(`处理: ${file}`);

      try {
        const result = await compressLottieFile(filePath);
        totalOriginalSize += result.originalSize;
        totalCompressedSize += result.compressedSize;

        console.log(
          `  ✅ ${formatSize(result.originalSize)} → ${formatSize(result.compressedSize)} (减少 ${result.ratio}%)\n`
        );
      } catch (error) {
        console.log(`  ❌ 压缩失败: ${error.message}\n`);
      }
    }

    console.log('='.repeat(50));
    console.log('📊 压缩总结:');
    console.log(`  原始大小: ${formatSize(totalOriginalSize)}`);
    console.log(`  压缩后: ${formatSize(totalCompressedSize)}`);
    console.log(
      `  总共减少: ${formatSize(totalOriginalSize - totalCompressedSize)} (${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(2)}%)`
    );
    console.log('='.repeat(50));
    console.log('\n✨ 压缩完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 运行
main();
