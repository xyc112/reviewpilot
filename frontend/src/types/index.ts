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
    type: string
    description: string
    masteryLevel: 'weak' | 'medium' | 'strong'
    masteryScore: number
    questionCount: number
}

export interface KnowledgeGraph {
    nodes: KnowledgePoint[]
    edges: Array<{
        id: string
        source: string
        target: string
        type: string
        strength: string
    }>
}

export interface QuizQuestion {
    questionId: number
    questionText: string
    questionType: string
    options: Array<{ key: string; value: string }>
    explanation: string
    points: number
}

export interface UserNote {
    noteId: number
    content: string
    attachments: Array<{
        id: number
        fileName: string
        fileUrl: string
        fileSize: number
    }>
    lastModified: string
}

export interface LearningProgress {
    totalPoints: number
    completedPoints: number
    masteredPoints: number
    progressPercentage: number
    estimatedCompletionTime: string
}