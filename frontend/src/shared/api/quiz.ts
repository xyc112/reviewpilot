import api from "./apiClient";
import type { Quiz, QuizAttempt } from "@/shared/types";

export const quizAPI = {
  getQuizzes: (courseId: number) =>
    api.get<Quiz[]>(`/api/courses/${String(courseId)}/quizzes`),
  getQuiz: (courseId: number, quizId: string) =>
    api.get<Quiz>(`/api/courses/${String(courseId)}/quizzes/${quizId}`),
  createQuiz: (courseId: number, quizData: Partial<Quiz>) =>
    api.post<Quiz>(`/api/courses/${String(courseId)}/quizzes`, quizData),
  updateQuiz: (courseId: number, quizId: string, quizData: Partial<Quiz>) =>
    api.put<Quiz>(
      `/api/courses/${String(courseId)}/quizzes/${quizId}`,
      quizData,
    ),
  deleteQuiz: (courseId: number, quizId: string) =>
    api.delete(`/api/courses/${String(courseId)}/quizzes/${quizId}`),
  submitAttempt: (
    courseId: number,
    quizId: string,
    answers: Record<string, unknown>,
  ) =>
    api.post<QuizAttempt>(
      `/api/courses/${String(courseId)}/quizzes/${quizId}/attempts`,
      {
        answers,
      },
    ),
};
