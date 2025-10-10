import axios from "axios";
import { ApiResponse } from "@/types/api";

const API_BASE_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>("/auth/login", {
      username,
      password,
    }),
  register: (userData: any) =>
    api.post<ApiResponse>("/auth/register", userData),
  refresh: () => api.post<ApiResponse<{ token: string }>>("/auth/refresh"),
};

export const courseAPI = {
  getCourses: (params?: any) =>
    api.get<ApiResponse<any>>("/courses", { params }),
  getCourse: (courseId: number) =>
    api.get<ApiResponse<any>>(`/courses/${courseId}`),
  createCourse: (courseData: any) =>
    api.post<ApiResponse>("/courses", courseData),
  enroll: (courseId: number) =>
    api.post<ApiResponse>(`/courses/${courseId}/enroll`),
};

export const knowledgeGraphAPI = {
  getGraph: (courseId: number) =>
    api.get<ApiResponse<any>>(`/courses/${courseId}/knowledge-graph`),
  createPoint: (courseId: number, pointData: any) =>
    api.post<ApiResponse>(`/courses/${courseId}/knowledge-points`, pointData),
  updatePoint: (pointId: number, pointData: any) =>
    api.put<ApiResponse>(`/knowledge-points/${pointId}`, pointData),
  deletePoint: (pointId: number) =>
    api.delete<ApiResponse>(`/knowledge-points/${pointId}`),
  createRelation: (relationData: any) =>
    api.post<ApiResponse>("/knowledge-relations", relationData),
};

export const userAPI = {
  getScores: (params?: any) =>
    api.get<ApiResponse<any>>("/user/scores", { params }),
  batchImportScores: (scores: any[]) =>
    api.post<ApiResponse>("/user/scores/batch", scores),
  getLearningProgress: (courseId: number) =>
    api.get<ApiResponse<any>>("/user/learning-progress", {
      params: { courseId },
    }),
  getWeakPoints: (courseId: number) =>
    api.get<ApiResponse<any>>("/user/weak-points", { params: { courseId } }),
};

export const notesAPI = {
  getNote: (pointId: number) =>
    api.get<ApiResponse<any>>(`/user/knowledge-points/${pointId}/user-note`),
  updateNote: (pointId: number, noteData: any) =>
    api.put<ApiResponse>(
      `/user/knowledge-points/${pointId}/user-note`,
      noteData,
    ),
  deleteAttachment: (noteId: number, attachmentId: number) =>
    api.delete<ApiResponse>(
      `/user-notes/${noteId}/attachments/${attachmentId}`,
    ),
};

export const quizAPI = {
  getRandomQuestions: (params?: any) =>
    api.get<ApiResponse<any>>("/quiz/questions/random", { params }),
  submitAttempt: (attemptData: any) =>
    api.post<ApiResponse>("/quiz/attempt", attemptData),
  getAttemptHistory: (params?: any) =>
    api.get<ApiResponse<any>>("/quiz/attempts/history", { params }),
  getWrongQuestions: (courseId: number) =>
    api.get<ApiResponse<any>>("/quiz/wrong-questions", {
      params: { courseId },
    }),
};

export const analyticsAPI = {
  getLearningStats: (courseId: number) =>
    api.get<ApiResponse<any>>("/analytics/learning-stats", {
      params: { courseId },
    }),
};
