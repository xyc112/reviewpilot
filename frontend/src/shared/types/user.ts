/**
 * 用户相关类型定义
 */
export interface User {
  id: number;
  username: string;
  role: "USER" | "ADMIN";
  token: string;
  nickname?: string | null;
  bio?: string | null;
  hasAvatar?: boolean;
}

/**
 * 个人信息（从 /api/users/me 获取）
 */
export interface UserProfile {
  id: number;
  username: string;
  role: string;
  nickname: string | null;
  bio: string | null;
  hasAvatar: boolean;
}
