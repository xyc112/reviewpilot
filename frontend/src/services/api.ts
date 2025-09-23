import axios from 'axios'
import type {
    Course,
    KnowledgeGraph,
    KnowledgePoint,
    UserScore,
    UserNote,
    Question,
    QuizAttempt,
    QuizResult,
    CreateCourseRequest,
    CreateKnowledgePointRequest,
    GetKnowledgeGraphParams,
    GetRandomQuestionsParams
} from '@/types/api'

const API_BASE_URL = '/api'

// 创建axios实例
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        console.log(`发起请求: ${config.method?.toUpperCase()} ${config.url}`)
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        console.error('API请求错误:', error)
        const errorResponse = {
            error: error.message || '网络错误',
            status: error.response?.status,
            path: error.config?.url
        }
        return Promise.reject(errorResponse)
    }
)

// 课程相关API
export const courseService = {
    async getCourses(): Promise<Course[]> {
        const response = await api.get<Course[]>('/courses')
        return response.data
    },

    async getCourse(courseId: number): Promise<Course> {
        const response = await api.get<Course>(`/courses/${courseId}`)
        return response.data
    },

    async createCourse(course: CreateCourseRequest): Promise<Course> {
        const response = await api.post<Course>('/courses', course)
        return response.data
    }
}

// 知识图谱相关API
export const knowledgeGraphService = {
    async getKnowledgeGraph(params: GetKnowledgeGraphParams): Promise<KnowledgeGraph> {
        const { courseId, userId = 1 } = params
        const response = await api.get<KnowledgeGraph>(
            `/courses/${courseId}/knowledge-graph`,
            { params: { userId } }
        )
        return response.data
    },

    async createKnowledgePoint(
        courseId: number,
        point: CreateKnowledgePointRequest
    ): Promise<KnowledgePoint> {
        const response = await api.post<KnowledgePoint>(
            `/courses/${courseId}/knowledge-points`,
            point
        )
        return response.data
    }
}

// 用户数据相关API
export const userService = {
    async getWeakPoints(courseId: number, userId: number = 1): Promise<KnowledgePoint[]> {
        const response = await api.get<KnowledgePoint[]>(
            '/user/weak-points',
            { params: { courseId, userId } }
        )
        return response.data
    }
}

// 笔记管理相关API
export const noteService = {
    async getUserNote(pointId: number, userId: number = 1): Promise<UserNote> {
        const response = await api.get<UserNote>(
            `/user/knowledge-points/${pointId}/user-note`,
            { params: { userId } }
        )
        return response.data
    },

    async saveUserNote(pointId: number, note: UserNote, userId: number = 1): Promise<void> {
        await api.put(
            `/user/knowledge-points/${pointId}/user-note`,
            note,
            { params: { userId } }
        )
    }
}

// 测验管理相关API
export const quizService = {
    async getRandomQuestions(params: GetRandomQuestionsParams): Promise<Question[]> {
        const { pointId, count = 5, userId = 1 } = params
        const response = await api.get<Question[]>(
            '/quiz/questions/random',
            { params: { pointId, count, userId } }
        )
        return response.data
    },

    async submitQuiz(attempt: QuizAttempt, userId: number = 1): Promise<QuizResult> {
        const response = await api.post<QuizResult>(
            '/quiz/attempt',
            attempt,
            { params: { userId } }
        )
        return response.data
    }
}

export { api }