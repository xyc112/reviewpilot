/**
 * 知识图谱相关类型定义
 */
export interface Node {
  id?: string; // 服务器生成，创建时可选
  label: string; // 必填字段
  type?: string; // 可选字段
  description?: string; // 可选字段
  meta?: Record<string, unknown>; // 可选字段
}

export interface Relation {
  id?: string; // 服务器生成，创建时可选
  from: string; // 必填字段
  to: string; // 必填字段
  type: string; // 必填字段
  directed?: boolean; // 可选字段
  weight?: number; // 可选字段
  meta?: Record<string, unknown>; // 可选字段
}
