/**
 * 笔记相关类型定义
 */
export interface Note {
  id: string;
  courseId: number;
  title: string;
  content: string;
  summary?: string; // 笔记摘要，用于列表预览
  authorId: number;
  visibility: "public" | "private";
  createdAt: string;
  updatedAt?: string;
}
