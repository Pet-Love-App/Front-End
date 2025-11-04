// 本地/远端的同步策略
// （smartSync，push/sync helpers）

import { fetchUserRemote, upsertUserRemote } from './api';
import { getUserById, upsertUser } from './index';
import type { User } from './types';

// 从服务端拉取并落地到本地（后端为准）
export async function syncUserFromServer(userId: string): Promise<User | null> {
  const remote = await fetchUserRemote(userId);
  if (!remote) return null;
  await upsertUser(remote);
  return remote;
}

// 将本地用户推送到服务端（简单覆盖）
export async function pushUserToServer(user: User): Promise<User> {
  const merged = await upsertUserRemote(user);
  await upsertUser(merged);
  return merged;
}

// 简单的“谁更新晚谁覆盖”策略
export async function smartSync(userId: string): Promise<User | null> {
  const local = await getUserById(userId);
  const remote = await fetchUserRemote(userId);
  if (!remote && local) {
    await pushUserToServer({ ...local, updatedAt: Date.now() });
    return local;
  }
  if (!remote && !local) return null;

  if (local && remote) {
    if ((remote.updatedAt ?? 0) >= (local.updatedAt ?? 0)) {
      await upsertUser(remote);
      return remote;
    } else {
      await pushUserToServer(local);
      return local;
    }
  }
  if (remote && !local) {
    await upsertUser(remote);
    return remote;
  }
  return local ?? null;
}