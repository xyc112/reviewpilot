/**
 * 测验相关类型定义
 */
export interface Quiz {
  id: string;
  courseId: number;
  title: string;
  questions: QuizQuestion[];
  authorId: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: "single" | "multiple" | "truefalse";
  question: string;
  options?: string[];
  answer?: number[];
  explanation?: string;
}

export interface QuizAttempt {
  quizId: string;
  userId: number;
  score: number;
  total: number;
  results: AttemptResult[];
  submittedAt: string;
}

export interface AttemptResult {
  questionId: string;
  questionEntityId?: number;
  correct: boolean;
  score: number;
}

export interface Question {
  id: number;
  quizId: string;
  courseId: number;
  originalId: string;
  type: "single" | "multiple" | "truefalse";
  question: string;
  options: string[];
  answer?: number[];
  explanation?: string;
  orderIndex: number;
  createdAt: string;
}

export interface WrongQuestion {
  id: number;
  userId: number;
  courseId: number;
  questionId: number;
  quizId: string;
  userAnswer: number[];
  mastered: boolean;
  addedAt: string;
  lastPracticedAt: string | null;
  practiceCount: number;
  question?: Question;
}
