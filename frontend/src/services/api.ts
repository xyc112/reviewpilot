import axios from 'axios';

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

export default api;