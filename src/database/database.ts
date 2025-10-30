/**
 * SQLite 数据库配置和初始化
 * 
 * 这个文件负责：
 * 1. 打开/创建数据库
 * 2. 创建表结构
 * 3. 提供数据库实例
 */

//TODO: 优化本地数据库容量问题（当缓存使用而不能超过一定限额时，只记录到总数据库的映射）

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
 * 添加剂表结构
 */
const CREATE_ADDITIVES_TABLE = `
  CREATE TABLE IF NOT EXISTS cat_food_additives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foodId TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (foodId) REFERENCES cat_food_collect(id) ON DELETE CASCADE
  );
`;

/**
 * 营养成分表结构
 */
const CREATE_NUTRITION_TABLE = `
  CREATE TABLE IF NOT EXISTS cat_food_nutrition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foodId TEXT NOT NULL,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    percentage REAL,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (foodId) REFERENCES cat_food_collect(id) ON DELETE CASCADE
  );
`;

/**
 * 高赞评论表结构
 */
const CREATE_COMMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS cat_food_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foodId TEXT NOT NULL,
    userName TEXT NOT NULL,
    userAvatar TEXT,
    content TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    rating REAL,
    commentTime INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (foodId) REFERENCES cat_food_collect(id) ON DELETE CASCADE
  );
`;

/**
 * 创建索引以提高查询性能
 */
const CREATE_INDEXES = [
  // 收藏表索引
  'CREATE INDEX IF NOT EXISTS idx_collect_time ON cat_food_collect(collectTime DESC);',
  'CREATE INDEX IF NOT EXISTS idx_name ON cat_food_collect(name);',
  'CREATE INDEX IF NOT EXISTS idx_tag1 ON cat_food_collect(tag1);',
  'CREATE INDEX IF NOT EXISTS idx_tag2 ON cat_food_collect(tag2);',
  // 添加剂表索引
  'CREATE INDEX IF NOT EXISTS idx_additives_foodId ON cat_food_additives(foodId);',
  'CREATE INDEX IF NOT EXISTS idx_additives_category ON cat_food_additives(category);',
  // 营养成分表索引
  'CREATE INDEX IF NOT EXISTS idx_nutrition_foodId ON cat_food_nutrition(foodId);',
  // 评论表索引
  'CREATE INDEX IF NOT EXISTS idx_comments_foodId ON cat_food_comments(foodId);',
  'CREATE INDEX IF NOT EXISTS idx_comments_likes ON cat_food_comments(likes DESC);',
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
    
    // 创建添加剂表
    await db.execAsync(CREATE_ADDITIVES_TABLE);
    console.log('✅ 添加剂表已创建');
    
    // 创建营养成分表
    await db.execAsync(CREATE_NUTRITION_TABLE);
    console.log('✅ 营养成分表已创建');
    
    // 创建评论表
    await db.execAsync(CREATE_COMMENTS_TABLE);
    console.log('✅ 评论表已创建');
    
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
