export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
    timestamp: string
}

export interface User {
    userId: number
    username: string
    realName: string
    email: string
    studentId?: string
}

export interface Course {
    courseId: number
    courseName: string
    syllabus: string
    credit: number
    teacher: string
    semester: string
}

export interface KnowledgePoint {
    id: string
    name: string
    type: 'knowledgePoint'
    description: string
    masteryLevel: 'weak' | 'medium' | 'strong'
    masteryScore: number
    questionCount: number
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    estimatedStudyTime: number
}

export interface KnowledgeRelation {
    id: string
    source: string
    target: string
    type: 'PREREQUISITE' | 'INCLUDE' | 'RELATED'
    strength: 'weak' | 'medium' | 'strong'
}

export interface KnowledgeGraphData {
    nodes: KnowledgePoint[]
    edges: KnowledgeRelation[]
}

export interface LearningProgress {
    totalPoints: number
    completedPoints: number
    masteredPoints: number
    progressPercentage: number
    estimatedCompletionTime: string
    recentActivity: Array<{
        date: string
        studyTime: number
        completedPoints: number
    }>
}

export interface QuizQuestion {
    questionId: number
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    pointId: number
}

export interface Note {
    noteId: number
    pointId: number
    content: string
    attachments: Attachment[]
    createdAt: string
    updatedAt: string
}

export interface Attachment {
    fileId: number
    fileName: string
    fileUrl: string
    fileSize: number
    mimeType: string
}