import axios from 'axios'
import type {
    Course, KnowledgePoint, KnowledgeGraph,
    UserScore, UserNote, Question, QuizAttempt, QuizResult
} from '@/types/api'

const API_BASE_URL = '/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const courseService = {
    // 获取所有课程
    getCourses(): Promise<Course[]> {
        return api.get('/courses').then(res => res.data)
    },

    // 获取课程详情
    getCourse(courseId: number): Promise<Course> {
        return api.get(`/courses/${courseId}`).then(res => res.data)
    },

    // 创建课程
    createCourse(course: Omit<Course, 'courseId'>): Promise<Course> {
        return api.post('/courses', course).then(res => res.data)
    }
}

export const knowledgeGraphService = {
    // 获取知识图谱
    getKnowledgeGraph(courseId: number, userId: number = 1): Promise<KnowledgeGraph> {
        return api.get(`/courses/${courseId}/knowledge-graph?userId=${userId}`).then(res => res.data)
    },

    // 创建知识点
    createKnowledgePoint(courseId: number, point: Omit<KnowledgePoint, 'pointId'>): Promise<KnowledgePoint> {
        return api.post(`/courses/${courseId}/knowledge-points`, point).then(res => res.data)
    },

    // 创建知识点关系
    createKnowledgeRelation(sourcePointId: number, targetPointId: number, relationType: string) {
        return api.post('/knowledge-relations', {
            sourcePoint: { pointId: sourcePointId },
            targetPoint: { pointId: targetPointId },
            relationType
        })
    }
}

export const userService = {
    // 批量导入成绩
    importScores(scores: any[]): Promise<void> {
        return api.post('/user/scores/batch', scores)
    },

    // 获取用户成绩
    getUserScores(courseId: number, userId: number = 1): Promise<UserScore[]> {
        return api.get(`/user/scores?courseId=${courseId}&userId=${userId}`).then(res => res.data)
    },

    // 获取薄弱知识点
    getWeakPoints(courseId: number, userId: number = 1): Promise<KnowledgePoint[]> {
        return api.get(`/user/weak-points?courseId=${courseId}&userId=${userId}`).then(res => res.data)
    }
}

export const noteService = {
    // 获取用户笔记
    getUserNote(pointId: number, userId: number = 1): Promise<UserNote> {
        return api.get(`/user/knowledge-points/${pointId}/user-note?userId=${userId}`).then(res => res.data)
    },

    // 创建/更新笔记
    saveUserNote(pointId: number, note: UserNote, userId: number = 1): Promise<void> {
        return api.put(`/user/knowledge-points/${pointId}/user-note?userId=${userId}`, note)
    }
}

export const quizService = {
    // 获取随机题目
    getRandomQuestions(pointId: number, count: number = 5, userId: number = 1): Promise<Question[]> {
        return api.get(`/quiz/questions/random?pointId=${pointId}&count=${count}&userId=${userId}`).then(res => res.data)
    },

    // 提交测验答案
    submitQuiz(attempt: QuizAttempt, userId: number = 1): Promise<QuizResult> {
        return api.post(`/quiz/attempt?userId=${userId}`, attempt).then(res => res.data)
    },

    // 获取测验历史
    getQuizHistory(pointId?: number, userId: number = 1): Promise<any[]> {
        const params = pointId ? `pointId=${pointId}&userId=${userId}` : `userId=${userId}`
        return api.get(`/quiz/attempts/history?${params}`).then(res => res.data)
    }
}