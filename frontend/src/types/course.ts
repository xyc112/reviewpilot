/**
 * 课程相关类型定义
 */
export interface Course {
  id: number;
  title: string;
  description: string;
  tags: string[];
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  authorId: number;
  createdAt: string;
}

export interface UserCourse {
  courseId: number;
  courseTitle: string | null;
  isCurrentStudying: boolean;
  addedAt: string;
  studyingStartedAt: string | null;
}
