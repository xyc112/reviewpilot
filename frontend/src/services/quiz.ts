import api from "./apiClient";
import { Quiz, QuizAttempt } from "../types";

export const quizAPI = {
  getQuizzes: (courseId: number) =>
    api.get<Quiz[]>(`/api/courses/${courseId}/quizzes`),
  getQuiz: (courseId: number, quizId: string) =>
    api.get<Quiz>(`/api/courses/${courseId}/quizzes/${quizId}`),
  createQuiz: (courseId: number, quizData: Partial<Quiz>) =>
    api.post<Quiz>(`/api/courses/${courseId}/quizzes`, quizData),
  updateQuiz: (courseId: number, quizId: string, quizData: Partial<Quiz>) =>
    api.put<Quiz>(`/api/courses/${courseId}/quizzes/${quizId}`, quizData),
  deleteQuiz: (courseId: number, quizId: string) =>
    api.delete(`/api/courses/${courseId}/quizzes/${quizId}`),
  submitAttempt: (courseId: number, quizId: string, answers: any) =>
    api.post<QuizAttempt>(
      `/api/courses/${courseId}/quizzes/${quizId}/attempts`,
      {
        answers,
      },
    ),
};
