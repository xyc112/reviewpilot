/**
 * 用户相关类型定义
 */
export interface User {
  id: number;
  username: string;
  role: "USER" | "ADMIN";
  token: string;
}
