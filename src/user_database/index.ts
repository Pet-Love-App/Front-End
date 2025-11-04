// 本地增删改查（主要是getUserById，upsertUser，removeUser）
import { getDb, initUserDb } from './schema';
import type { User } from './types';

export { initUserDb };
export type { User };

export async function getUserById(id: string): Promise<User | null> {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.readTransaction(
      (tx: any) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?',
          [id],
          (_t: any, rs: any) => {
            if (rs.rows.length > 0) {
              const row = rs.rows.item(0) as any;
              const user: User = {
                id: row.id,
                username: row.username,
                avatar: row.avatar,
                pets: JSON.parse(row.pets || '[]'),
                updatedAt: row.updatedAt ?? 0,
              };
              resolve(user);
            } else {
              resolve(null);
            }
          },
          (_t: any, err: any) => {
            reject(err);
            return true;
          }
        );
      },
      (err: any) => reject(err)
    );
  });
}

export async function upsertUser(input: Omit<User, 'updatedAt'> & { updatedAt?: number }): Promise<void> {
  const db = getDb();
  const now = input.updatedAt ?? Date.now();
  const petsJson = JSON.stringify(input.pets ?? []);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: any) => {
        tx.executeSql(
          'UPDATE users SET username=?, avatar=?, pets=?, updatedAt=? WHERE id=?',
          [input.username, input.avatar, petsJson, now, input.id],
          (_t: any, rs: any) => {
            if (rs.rowsAffected === 0) {
              // insert
              tx.executeSql(
                'INSERT INTO users (id, username, avatar, pets, updatedAt) VALUES (?,?,?,?,?)',
                [input.id, input.username, input.avatar, petsJson, now]
              );
            }
          }
        );
      },
      (err: any) => reject(err),
      () => resolve()
    );
  });
}

export async function removeUser(id: string): Promise<void> {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: any) => {
        tx.executeSql('DELETE FROM users WHERE id=?', [id]);
      },
      (err: any) => reject(err),
      () => resolve()
    );
  });
}