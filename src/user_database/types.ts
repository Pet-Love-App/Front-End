//用于定义User类型
export type User = {
  id: string;
  username: string;
  avatar: string;    // 远程 URL 或本地 file:// 路径
  pets: string[]; // 宠物信息列表
  updatedAt: number; // 时间戳，用于同步策略
};