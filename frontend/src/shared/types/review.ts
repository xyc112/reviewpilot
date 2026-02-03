/**
 * 复习计划相关类型定义
 */
export interface ReviewPlan {
  id: number;
  userId: number;
  planDate: string;
  title: string;
  description?: string;
  type: "plan" | "exam";
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}
