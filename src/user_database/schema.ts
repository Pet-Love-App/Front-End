import * as SQLite from 'expo-sqlite';

let db: any = null;

export function getDb(): any {
    if (!db) {
        // 不同版本可能只导出 openDatabase 或 openDatabaseSync，运行时选择可用的
        const opener = (SQLite as any).openDatabase || (SQLite as any).openDatabaseSync;
        if (!opener) {
            throw new Error(
                'expo-sqlite: openDatabase not found. 请确保已安装 expo-sqlite (`npx expo install expo-sqlite`)'
            );
        }
        db = opener.call(SQLite, 'userdb.db');
    }
    return db;
}

export async function initUserDb(): Promise<void> {
    const database = getDb();
    return new Promise((resolve, reject) => {
        database.transaction(
            (tx: any) => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY NOT NULL,
                        username TEXT NOT NULL,
                        avatar TEXT NOT NULL,
                        pets TEXT NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );`
                );
            },
            (err: any) => reject(err),
            () => resolve()
        );
    });
}