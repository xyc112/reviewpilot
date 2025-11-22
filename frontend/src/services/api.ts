import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

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
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials: { username: string; password: string }) =>
        api.post('/auth/login', credentials),
    register: (userData: { username: string; password: string; role?: string }) =>
        api.post('/auth/register', userData),
};

export const courseAPI = {
    getCourses: () => api.get('/courses'),
    getCourse: (id: number) => api.get(`/courses/${id}`),
    createCourse: (courseData: Partial<Course>) => api.post('/courses', courseData),
    updateCourse: (id: number, courseData: Partial<Course>) =>
        api.put(`/courses/${id}`, courseData),
    deleteCourse: (id: number) => api.delete(`/courses/${id}`),
};

export const graphAPI = {
    getNodes: (courseId: number) => api.get(`/graphs/${courseId}/nodes`),
    getNode: (courseId: number, nodeId: string) =>
        api.get(`/graphs/${courseId}/nodes/${nodeId}`),
    createNode: (courseId: number, nodeData: Partial<Node>) =>
        api.post(`/graphs/${courseId}/nodes`, nodeData),
    updateNode: (courseId: number, nodeId: string, nodeData: Partial<Node>) =>
        api.put(`/graphs/${courseId}/nodes/${nodeId}`, nodeData),
    deleteNode: (courseId: number, nodeId: string) =>
        api.delete(`/graphs/${courseId}/nodes/${nodeId}`),
    getRelations: (courseId: number, params?: any) =>
        api.get(`/graphs/${courseId}/relations`, { params }),
    createRelation: (courseId: number, relationData: Partial<Relation>) =>
        api.post(`/graphs/${courseId}/relations`, relationData),
    updateRelation: (courseId: number, relationId: string, relationData: Partial<Relation>) =>
        api.put(`/graphs/${courseId}/relations/${relationId}`, relationData),
    deleteRelation: (courseId: number, relationId: string) =>
        api.delete(`/graphs/${courseId}/relations/${relationId}`),
};

export const noteAPI = {
    getNotes: (courseId: number) => api.get(`/courses/${courseId}/notes`),
    getNote: (courseId: number, noteId: string) =>
        api.get(`/courses/${courseId}/notes/${noteId}`),
    createNote: (courseId: number, noteData: Partial<Note>) =>
        api.post(`/courses/${courseId}/notes`, noteData),
    updateNote: (courseId: number, noteId: string, noteData: Partial<Note>) =>
        api.put(`/courses/${courseId}/notes/${noteId}`, noteData),
    deleteNote: (courseId: number, noteId: string) =>
        api.delete(`/courses/${courseId}/notes/${noteId}`),
};

export const quizAPI = {
    getQuizzes: (courseId: number) => api.get(`/courses/${courseId}/quizzes`),
    getQuiz: (courseId: number, quizId: string) =>
        api.get(`/courses/${courseId}/quizzes/${quizId}`),
    createQuiz: (courseId: number, quizData: Partial<Quiz>) =>
        api.post(`/courses/${courseId}/quizzes`, quizData),
    updateQuiz: (courseId: number, quizId: string, quizData: Partial<Quiz>) =>
        api.put(`/courses/${courseId}/quizzes/${quizId}`, quizData),
    deleteQuiz: (courseId: number, quizId: string) =>
        api.delete(`/courses/${courseId}/quizzes/${quizId}`),
    submitAttempt: (courseId: number, quizId: string, answers: any) =>
        api.post(`/courses/${courseId}/quizzes/${quizId}/attempts`, { answers }),
};

export default api;