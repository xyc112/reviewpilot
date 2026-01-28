/**
 * 社区相关类型定义
 */
export interface Post {
  id: number;
  courseId: number;
  authorId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorUsername?: string;
}

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  authorUsername?: string;
}
