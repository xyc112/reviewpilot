/**
 * 知识图谱相关类型定义
 */
export interface Node {
  id?: string;
  label: string;
  type?: string;
  description?: string;
  meta?: Record<string, unknown>;
}

export interface Relation {
  id?: string;
  from: string;
  to: string;
  type: string;
  directed?: boolean;
  weight?: number;
  meta?: Record<string, unknown>;
}
