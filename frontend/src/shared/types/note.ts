/**
 * 笔记相关类型定义
 */
export interface Note {
  id: string;
  courseId: number;
  title: string;
  content: string;
  summary?: string;
  authorId: number;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt?: string;
}
