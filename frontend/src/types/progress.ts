/**
 * 学习进度相关类型定义
 */
export interface OverallStats {
  totalCourses: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number | null;
  totalNotes: number;
  completionRate: number; // 百分比
}

export interface CourseProgress {
  courseId: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number | null;
  noteCount: number;
  completionRate: number; // 百分比
  quizProgressList: QuizProgress[];
}

export interface QuizProgress {
  quizId: string;
  score: number | null;
  totalScore: number | null;
  completedAt: string;
}
