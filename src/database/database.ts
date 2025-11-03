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
const DATABASE_VERSION = 2;

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
 * 添加剂表结构（链接猫粮与主数据，保留本地备用字段）
 */
const CREATE_ADDITIVES_TABLE = `
  CREATE TABLE IF NOT EXISTS cat_food_additives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foodId TEXT NOT NULL,
    additiveId INTEGER, -- 对应 additives_master.id（可为空以兼容旧数据）
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (foodId) REFERENCES cat_food_collect(id) ON DELETE CASCADE,
    FOREIGN KEY (additiveId) REFERENCES additives_master(id)
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
 * 添加剂主数据表结构（与后端 API 字段对齐）
 */
const CREATE_ADDITIVES_MASTER_TABLE = `
  CREATE TABLE IF NOT EXISTS additives_master (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    en_name TEXT,
    type TEXT,
    applicable_range TEXT,
    raw_json TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
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
  // 添加剂主数据索引
  'CREATE INDEX IF NOT EXISTS idx_additives_master_name ON additives_master(name);',
  // 添加剂表索引
  'CREATE INDEX IF NOT EXISTS idx_additives_foodId ON cat_food_additives(foodId);',
  'CREATE INDEX IF NOT EXISTS idx_additives_category ON cat_food_additives(category);',
  'CREATE INDEX IF NOT EXISTS idx_additives_additiveId ON cat_food_additives(additiveId);',
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

    // 创建添加剂主数据表（与后端对齐）
    await db.execAsync(CREATE_ADDITIVES_MASTER_TABLE);
    console.log('✅ 添加剂主数据表已创建');
    
    // 创建添加剂表（链接表）
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

    // 读取当前版本
    const verRow = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM db_version LIMIT 1'
    );
    let currentVersion = verRow?.version ?? 0;

    // 辅助：确保 cat_food_additives.additiveId 列存在（处理历史库无版本记录的情况）
    const ensureAdditiveIdColumn = async () => {
      const cols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(cat_food_additives)');
      const hasCol = Array.isArray(cols) && cols.some(c => c.name === 'additiveId');
      if (!hasCol) {
        try {
          await db.execAsync('ALTER TABLE cat_food_additives ADD COLUMN additiveId INTEGER');
          await db.execAsync('CREATE INDEX IF NOT EXISTS idx_additives_additiveId ON cat_food_additives(additiveId)');
          console.log('✅ 已为历史数据库补充 additiveId 列及索引');
        } catch (e) {
          console.warn('⚠️ 添加 additiveId 列失败或已存在:', e);
        }
      }
    };

    // 初始安装或历史库（无版本记录）
    if (currentVersion === 0) {
      // 历史库可能缺少 additiveId，先自检修复
      await ensureAdditiveIdColumn();
      // 设置为最新版本
      await db.execAsync('DELETE FROM db_version');
      await db.execAsync(`INSERT INTO db_version (version) VALUES (${DATABASE_VERSION})`);
      currentVersion = DATABASE_VERSION;
      console.log('✅ 初始化/修复历史数据库并设置版本为:', DATABASE_VERSION);
    }

    // 迁移到 v2：添加 cat_food_additives.additiveId 列和索引
    if (currentVersion < 2) {
      await ensureAdditiveIdColumn();
      await db.execAsync('DELETE FROM db_version');
      await db.execAsync('INSERT INTO db_version (version) VALUES (2)');
      currentVersion = 2;
      console.log('✅ 数据库已迁移到版本 2');
    }

    console.log('✅ 数据库版本:', currentVersion);
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
