export interface User {
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
    authorId: number;
    visibility: 'public' | 'private';
    createdAt: string;
    updatedAt?: string;
}

export interface Quiz {
    id: string;
    courseId: number;
    title: string;
    questions: Question[];
    authorId: number;
    createdAt: string;
}

export interface Question {
    id: string;
    type: 'single' | 'multiple' | 'short';
    question: string;
    options?: string[];
    answer?: number[];
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
    correct: boolean;
    score: number;
}