// 统一类型定义
export interface Course {
    courseId: number
    courseName: string
    syllabus: string
}

export interface KnowledgePoint {
    pointId: number
    pointName: string
    description: string
    masteryLevel?: 'weak' | 'medium' | 'proficient'
    masteryScore?: number
}

export interface KnowledgeNode {
    id: string
    name: string
    type: 'knowledgePoint'
    description: string
    masteryLevel: 'weak' | 'medium' | 'proficient'
    masteryScore: number
}

export interface KnowledgeEdge {
    id: string
    source: string
    target: string
    type: 'PREREQUISITE' | 'CONTAINS' | 'RELATED'
}

export interface KnowledgeGraph {
    nodes: KnowledgeNode[]
    edges: KnowledgeEdge[]
}

export interface UserScore {
    scoreId: number
    scoreValue: number
    examDate: string
    user: { userId: number }
    knowledgePoint: { pointId: number }
}

export interface UserNote {
    noteId?: number
    content: string
    attachments: string
}

export interface Question {
    questionId: number
    questionText: string
    options: string[]
    correctAnswer: string
}

export interface QuizAnswer {
    questionId: number
    selectedAnswer: string
}

export interface QuizAttempt {
    pointId: number
    answers: QuizAnswer[]
}

export interface QuizResult {
    totalScore: number
    correctCount: number
    totalQuestions: number
    details: Array<{
        questionId: number
        isCorrect: boolean
        correctAnswer: string
        selectedAnswer: string
    }>
}

// API 请求/响应相关类型
export interface ApiResponse<T> {
    data: T
    message?: string
    success: boolean
}

export interface ErrorResponse {
    error: string
    timestamp?: string
    path?: string
    status?: number
}

// 请求参数类型
export interface GetKnowledgeGraphParams {
    courseId: number
    userId?: number
}

export interface GetRandomQuestionsParams {
    pointId: number
    count?: number
    userId?: number
}

export interface CreateCourseRequest {
    courseName: string
    syllabus: string
}

export interface CreateKnowledgePointRequest {
    pointName: string
    description: string
}

export interface CreateKnowledgeRelationRequest {
    sourcePoint: { pointId: number }
    targetPoint: { pointId: number }
    relationType: string
}