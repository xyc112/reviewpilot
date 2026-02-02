import api from "./apiClient";
import type { WrongQuestion } from "../types";

export const wrongQuestionAPI = {
  getWrongQuestions: (courseId: number, mastered?: boolean) => {
    const params = mastered !== undefined ? { mastered } : {};
    return api.get<WrongQuestion[]>(
      `/api/courses/${String(courseId)}/wrong-questions`,
      { params },
    );
  },
  addWrongQuestion: (
    courseId: number,
    questionId: number,
    userAnswer: number[],
  ) =>
    api.post<WrongQuestion>(`/api/courses/${String(courseId)}/wrong-questions`, {
      questionId,
      userAnswer,
    }),
  markAsMastered: (courseId: number, wrongQuestionId: number) =>
    api.put<WrongQuestion>(
      `/api/courses/${String(courseId)}/wrong-questions/${String(wrongQuestionId)}/mastered`,
    ),
  removeWrongQuestion: (courseId: number, wrongQuestionId: number) =>
    api.delete(`/api/courses/${String(courseId)}/wrong-questions/${String(wrongQuestionId)}`),
  practiceWrongQuestion: (courseId: number, wrongQuestionId: number) =>
    api.post<WrongQuestion>(
      `/api/courses/${String(courseId)}/wrong-questions/${String(wrongQuestionId)}/practice`,
    ),
  getStats: (courseId: number) =>
    api.get<{ total: number; mastered: number; notMastered: number }>(
      `/api/courses/${String(courseId)}/wrong-questions/stats`,
    ),
};
