import axios from 'axios';
import { Course, Node, Relation, Note, Quiz, OverallStats, CourseProgress, UserCourse, Post, Comment, Question, WrongQuestion, ReviewPlan } from '../types';

// 移除硬编码的 baseURL，使用相对路径让Vite代理工作
const api = axios.create();

// 请求拦截器，自动添加token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器，处理错误
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 处理认证错误
        if (error.response?.status === 401 || error.response?.status === 403) {
            // 清除本地存储
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // 只在非登录/注册页面时跳转
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials: { username: string; password: string }) =>
        api.post('/api/auth/login', credentials),
    register: (userData: { username: string; password: string; role?: string }) =>
        api.post('/api/auth/register', userData),
};

export const courseAPI = {
    getCourses: () => api.get('/api/courses'),
    getCourse: (id: number) => api.get(`/api/courses/${id}`),
    createCourse: (courseData: Partial<Course>) => api.post('/api/courses', courseData),
    updateCourse: (id: number, courseData: Partial<Course>) =>
        api.put(`/api/courses/${id}`, courseData),
    deleteCourse: (id: number) => api.delete(`/api/courses/${id}`),
};

export const graphAPI = {
    getNodes: (courseId: number) => api.get(`/api/graphs/${courseId}/nodes`),
    getNode: (courseId: number, nodeId: string) =>
        api.get(`/api/graphs/${courseId}/nodes/${nodeId}`),
    createNode: (courseId: number, nodeData: Partial<Node>) =>
        api.post(`/api/graphs/${courseId}/nodes`, nodeData),
    updateNode: (courseId: number, nodeId: string, nodeData: Partial<Node>) =>
        api.put(`/api/graphs/${courseId}/nodes/${nodeId}`, nodeData),
    deleteNode: (courseId: number, nodeId: string) =>
        api.delete(`/api/graphs/${courseId}/nodes/${nodeId}`),
    getRelations: (courseId: number, params?: any) =>
        api.get(`/api/graphs/${courseId}/relations`, { params }),
    createRelation: (courseId: number, relationData: Partial<Relation>) =>
        api.post(`/api/graphs/${courseId}/relations`, relationData),
    updateRelation: (courseId: number, relationId: string, relationData: Partial<Relation>) =>
        api.put(`/api/graphs/${courseId}/relations/${relationId}`, relationData),
    deleteRelation: (courseId: number, relationId: string) =>
        api.delete(`/api/graphs/${courseId}/relations/${relationId}`),
};

export const noteAPI = {
    getNotes: (courseId: number) => api.get(`/api/courses/${courseId}/notes`),
    getNote: (courseId: number, noteId: string) =>
        api.get(`/api/courses/${courseId}/notes/${noteId}`),
    createNote: (courseId: number, noteData: Partial<Note>) =>
        api.post(`/api/courses/${courseId}/notes`, noteData),
    updateNote: (courseId: number, noteId: string, noteData: Partial<Note>) =>
        api.put(`/api/courses/${courseId}/notes/${noteId}`, noteData),
    deleteNote: (courseId: number, noteId: string) =>
        api.delete(`/api/courses/${courseId}/notes/${noteId}`),
};

export const quizAPI = {
    getQuizzes: (courseId: number) => api.get(`/api/courses/${courseId}/quizzes`),
    getQuiz: (courseId: number, quizId: string) =>
        api.get(`/api/courses/${courseId}/quizzes/${quizId}`),
    createQuiz: (courseId: number, quizData: Partial<Quiz>) =>
        api.post(`/api/courses/${courseId}/quizzes`, quizData),
    updateQuiz: (courseId: number, quizId: string, quizData: Partial<Quiz>) =>
        api.put(`/api/courses/${courseId}/quizzes/${quizId}`, quizData),
    deleteQuiz: (courseId: number, quizId: string) =>
        api.delete(`/api/courses/${courseId}/quizzes/${quizId}`),
    submitAttempt: (courseId: number, quizId: string, answers: any) =>
        api.post(`/api/courses/${courseId}/quizzes/${quizId}/attempts`, { answers }),
};

export const progressAPI = {
    getOverallStats: () => api.get<OverallStats>('/api/progress/overall'),
    getAllCourseProgress: () => api.get<CourseProgress[]>('/api/progress/courses'),
    getCourseProgress: (courseId: number) => api.get<CourseProgress>(`/api/progress/courses/${courseId}`),
};

export const userCourseAPI = {
    getUserCourses: () => api.get<UserCourse[]>('/api/user-courses'),
    addCourse: (courseId: number) => api.post(`/api/user-courses/${courseId}`),
    removeCourse: (courseId: number) => api.delete(`/api/user-courses/${courseId}`),
    setCurrentStudying: (courseId: number) => api.put(`/api/user-courses/${courseId}/current-studying`),
    unsetCurrentStudying: () => api.delete('/api/user-courses/current-studying'),
    getCurrentStudying: () => api.get<{ courseId: number | null }>('/api/user-courses/current-studying'),
};

export const postAPI = {
    getPosts: (courseId: number) => api.get<Post[]>(`/api/courses/${courseId}/posts`),
    getPost: (courseId: number, postId: number) => api.get<Post>(`/api/courses/${courseId}/posts/${postId}`),
    createPost: (courseId: number, postData: Partial<Post>) => api.post<Post>(`/api/courses/${courseId}/posts`, postData),
    updatePost: (courseId: number, postId: number, postData: Partial<Post>) => api.put<Post>(`/api/courses/${courseId}/posts/${postId}`, postData),
    deletePost: (courseId: number, postId: number) => api.delete(`/api/courses/${courseId}/posts/${postId}`),
};

export const commentAPI = {
    getComments: (courseId: number, postId: number) => api.get<Comment[]>(`/api/courses/${courseId}/posts/${postId}/comments`),
    getComment: (courseId: number, postId: number, commentId: number) => api.get<Comment>(`/api/courses/${courseId}/posts/${postId}/comments/${commentId}`),
    createComment: (courseId: number, postId: number, commentData: Partial<Comment>) => api.post<Comment>(`/api/courses/${courseId}/posts/${postId}/comments`, commentData),
    updateComment: (courseId: number, postId: number, commentId: number, commentData: Partial<Comment>) => api.put<Comment>(`/api/courses/${courseId}/posts/${postId}/comments/${commentId}`, commentData),
    deleteComment: (courseId: number, postId: number, commentId: number) => api.delete(`/api/courses/${courseId}/posts/${postId}/comments/${commentId}`),
};

export const wrongQuestionAPI = {
    getWrongQuestions: (courseId: number, mastered?: boolean) => {
        const params = mastered !== undefined ? { mastered } : {};
        return api.get<WrongQuestion[]>(`/api/courses/${courseId}/wrong-questions`, { params });
    },
    addWrongQuestion: (courseId: number, questionId: number, userAnswer: number[]) =>
        api.post<WrongQuestion>(`/api/courses/${courseId}/wrong-questions`, { questionId, userAnswer }),
    markAsMastered: (courseId: number, wrongQuestionId: number) =>
        api.put<WrongQuestion>(`/api/courses/${courseId}/wrong-questions/${wrongQuestionId}/mastered`),
    removeWrongQuestion: (courseId: number, wrongQuestionId: number) =>
        api.delete(`/api/courses/${courseId}/wrong-questions/${wrongQuestionId}`),
    practiceWrongQuestion: (courseId: number, wrongQuestionId: number) =>
        api.post<WrongQuestion>(`/api/courses/${courseId}/wrong-questions/${wrongQuestionId}/practice`),
    getStats: (courseId: number) => api.get<{ total: number; mastered: number; notMastered: number }>(`/api/courses/${courseId}/wrong-questions/stats`),
};

export const reviewPlanAPI = {
    getPlans: () => api.get<ReviewPlan[]>('/api/review-plans'),
    getPlansByDateRange: (startDate: string, endDate: string) =>
        api.get<ReviewPlan[]>('/api/review-plans/date-range', { params: { startDate, endDate } }),
    getPlansByDate: (date: string) => api.get<ReviewPlan[]>(`/api/review-plans/date/${date}`),
    getPlan: (id: number) => api.get<ReviewPlan>(`/api/review-plans/${id}`),
    createPlan: (planData: Partial<ReviewPlan>) => api.post<ReviewPlan>('/api/review-plans', planData),
    updatePlan: (id: number, planData: Partial<ReviewPlan>) => api.put<ReviewPlan>(`/api/review-plans/${id}`, planData),
    deletePlan: (id: number) => api.delete(`/api/review-plans/${id}`),
};

export default api;