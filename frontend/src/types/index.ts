export interface User {
    id: number;        // 添加这行
    username: string;
    role: 'USER' | 'ADMIN';
    token: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    tags: string[];
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    authorId: number;
    createdAt: string;
}

export interface Node {
    id?: string;        // 服务器生成，创建时可选
    label: string;      // 必填字段
    type?: string;      // 可选字段
    description?: string; // 可选字段
    meta?: Record<string, any>; // 可选字段
}

export interface Relation {
    id?: string;        // 服务器生成，创建时可选
    from: string;       // 必填字段
    to: string;         // 必填字段
    type: string;       // 必填字段
    directed?: boolean; // 可选字段
    weight?: number;    // 可选字段
    meta?: Record<string, any>; // 可选字段
}
export interface Note {
    id: string;
    courseId: number;
    title: string;
    content: string;
    summary?: string; // 笔记摘要，用于列表预览
    authorId: number;
    visibility: 'public' | 'private';
    createdAt: string;
    updatedAt?: string;
}

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
    type: 'single' | 'multiple' | 'truefalse';
    question: string;
    options?: string[];
    answer?: number[];
    explanation?: string; // 题目解析
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
    questionEntityId?: number; // Question实体的ID，用于错题本
    correct: boolean;
    score: number;
}

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

export interface UserCourse {
    courseId: number;
    courseTitle: string | null;
    isCurrentStudying: boolean;
    addedAt: string;
    studyingStartedAt: string | null;
}

export interface Post {
    id: number;
    courseId: number;
    authorId: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: number;
    postId: number;
    authorId: number;
    content: string;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface Question {
    id: number;
    quizId: string;
    courseId: number;
    originalId: string;
    type: 'single' | 'multiple' | 'truefalse';
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
    question?: Question; // 关联的题目信息
}