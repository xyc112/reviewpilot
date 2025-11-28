// QuizTypes.ets

// 问题类型枚举
export enum QuestionType {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER"
}

// 问题选项接口
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

// 问题接口
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

// 测验基础信息
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId: number;
  questions: Question[];
  timeLimit?: number; // 分钟
  attemptsAllowed: number;
  passingScore: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 测验尝试记录
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: number;
  answers: QuizAnswer[];
  score: number;
  totalPoints: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
  timeSpent: number; // 秒
}

// 答案接口
export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

// 创建/更新测验请求
export interface CreateQuizRequest {
  title: string;
  description?: string;
  questions: Question[];
  timeLimit?: number;
  attemptsAllowed: number;
  passingScore: number;
  isPublished?: boolean;
}

export interface UpdateQuizRequest extends CreateQuizRequest {}

// 答案请求项接口
export interface AnswerRequestItem {
  questionId: string;
  answer: string | string[];
}

// 提交测验尝试请求
export interface SubmitAttemptRequest {
  answers: AnswerRequestItem[];
}

// 测验尝试结果
export interface AttemptResult {
  attemptId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  answers: QuizAnswer[];
  timeSpent: number;
}

// ========== 统一的响应类型体系 ==========

export interface BaseApiResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  message: string;
}

export interface QuizListResponse extends BaseApiResponse {
  data?: Quiz[];
  total?: number;
}

export interface QuizDetailResponse extends BaseApiResponse {
  data?: Quiz;
}

export interface QuizOperationResponse extends BaseApiResponse {
  data?: Quiz;
}

export interface AttemptResponse extends BaseApiResponse {
  data?: AttemptResult;
}

export interface AttemptListResponse extends BaseApiResponse {
  data?: QuizAttempt[];
  total?: number;
}

// 错误响应接口
export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

// ========== 后端实体对应的接口 ==========

// 后端Quiz实体对应的接口
export interface BackendQuizRequest {
  id?: string; // 创建时可以为空，后端会生成
  courseId: number; // 必须提供
  title: string;
  questions: BackendQuestion[];
  authorId?: number; // 创建时可以由后端设置
  createdAt?: string; // 创建时可以为空
  updatedAt?: string; // 创建时可以为空
}

// 后端Question实体对应的接口
export interface BackendQuestion {
  id: string;
  type: string; // single|multiple|short
  question: string;
  options: string[]; // 选项文本列表
  answer: number[]; // 正确答案索引列表（0-based）
}