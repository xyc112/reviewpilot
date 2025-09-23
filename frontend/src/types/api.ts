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