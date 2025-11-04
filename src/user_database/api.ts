// 与后端交互的 fetch/PUT接口
// ps这里的API接口暂时为杜撰的

import type { User } from './types';

const API_BASE = 'http://82.157.255.92:3000/api/v1'; // 杜撰的 API 前缀

function adaptFromApi(json: any): User {
  return {
    id: String(json.id),
    username: String(json.username ?? ''),
    avatar: String(json.avatar ?? ''),
    pets: Array.isArray(json.pets) ? json.pets.map(String) : [],
    updatedAt: Number(json.updatedAt ?? Date.now()),
  };
}

export async function fetchUserRemote(id: string): Promise<User | null> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchUserRemote failed: ${res.status}`);
  const data = await res.json();
  return adaptFromApi(data);
}

export async function upsertUserRemote(user: User): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(user.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(`upsertUserRemote failed: ${res.status}`);
  const data = await res.json();
  return adaptFromApi(data);
}