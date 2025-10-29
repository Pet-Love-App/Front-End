/**
 * SQLite 数据库配置和初始化
 * 
 * 这个文件负责：
 * 1. 打开/创建数据库
 * 2. 创建表结构
 * 3. 提供数据库实例
 */

import * as SQLite from 'expo-sqlite';

// 数据库名称
const DATABASE_NAME = 'petlove.db';

// 数据库版本（用于迁移管理）
const DATABASE_VERSION = 1;

/**
 * 猫粮收藏表结构
 */
const CREATE_COLLECT_TABLE = `
  CREATE TABLE IF NOT EXISTS cat_food_collect (
    id TEXT PRIMARY KEY NOT NULL,
    tag1 TEXT NOT NULL,
    tag2 TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    collectCount INTEGER NOT NULL DEFAULT 0,
    collectTime INTEGER,
    imageUrl TEXT,
    brand TEXT,
    price REAL,
    rating REAL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`;

/**
 * 创建索引以提高查询性能
 */
const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_collect_time ON cat_food_collect(collectTime DESC);',
  'CREATE INDEX IF NOT EXISTS idx_name ON cat_food_collect(name);',
  'CREATE INDEX IF NOT EXISTS idx_tag1 ON cat_food_collect(tag1);',
  'CREATE INDEX IF NOT EXISTS idx_tag2 ON cat_food_collect(tag2);',
];

/**
 * 数据库实例
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * 获取数据库实例
 * 如果数据库未初始化，则先初始化
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // 打开数据库
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    
    console.log('✅ 数据库已打开:', DATABASE_NAME);
    
    // 初始化表结构
    await initDatabase(dbInstance);
    
    return dbInstance;
  } catch (error) {
    console.error('❌ 打开数据库失败:', error);
    throw error;
  }
}

/**
 * 初始化数据库表结构
 */
async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // 创建收藏表
    await db.execAsync(CREATE_COLLECT_TABLE);
    console.log('✅ 收藏表已创建');
    
    // 创建索引
    for (const indexSql of CREATE_INDEXES) {
      await db.execAsync(indexSql);
    }
    console.log('✅ 索引已创建');
    
    // 保存数据库版本（使用 INSERT OR IGNORE 避免重复插入）
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY
      );
    `);
    
    // 使用 INSERT OR IGNORE 避免重复插入错误
    await db.execAsync(`
      INSERT OR IGNORE INTO db_version (version) VALUES (${DATABASE_VERSION});
    `);
    
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM db_version LIMIT 1'
    );
    
    if (result) {
      console.log('✅ 数据库版本:', result.version);
    }
    
    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 初始化数据库失败:', error);
    throw error;
  }
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log('✅ 数据库已关闭');
  }
}

/**
 * 清空收藏表（慎用！）
 */
export async function clearCollectTable(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM cat_food_collect');
  console.log('✅ 收藏表已清空');
}

/**
 * 删除数据库（慎用！）
 */
export async function deleteDatabase(): Promise<void> {
  try {
    await closeDatabase();
    await SQLite.deleteDatabaseAsync(DATABASE_NAME);
    console.log('✅ 数据库已删除');
  } catch (error) {
    console.error('❌ 删除数据库失败:', error);
    throw error;
  }
}

/**
 * 获取数据库统计信息
 */
export async function getDatabaseStats() {
  const db = await getDatabase();
  
  const collectCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cat_food_collect'
  );
  
  return {
    collectCount: collectCount?.count || 0,
    databaseName: DATABASE_NAME,
    version: DATABASE_VERSION,
  };
}
