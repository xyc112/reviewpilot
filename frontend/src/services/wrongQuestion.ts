import api from "./apiClient";
import { WrongQuestion } from "../types";

export const wrongQuestionAPI = {
  getWrongQuestions: (courseId: number, mastered?: boolean) => {
    const params = mastered !== undefined ? { mastered } : {};
    return api.get<WrongQuestion[]>(
      `/api/courses/${courseId}/wrong-questions`,
      { params },
    );
  },
  addWrongQuestion: (
    courseId: number,
    questionId: number,
    userAnswer: number[],
  ) =>
    api.post<WrongQuestion>(`/api/courses/${courseId}/wrong-questions`, {
      questionId,
      userAnswer,
    }),
  markAsMastered: (courseId: number, wrongQuestionId: number) =>
    api.put<WrongQuestion>(
      `/api/courses/${courseId}/wrong-questions/${wrongQuestionId}/mastered`,
    ),
  removeWrongQuestion: (courseId: number, wrongQuestionId: number) =>
    api.delete(`/api/courses/${courseId}/wrong-questions/${wrongQuestionId}`),
  practiceWrongQuestion: (courseId: number, wrongQuestionId: number) =>
    api.post<WrongQuestion>(
      `/api/courses/${courseId}/wrong-questions/${wrongQuestionId}/practice`,
    ),
  getStats: (courseId: number) =>
    api.get<{ total: number; mastered: number; notMastered: number }>(
      `/api/courses/${courseId}/wrong-questions/stats`,
    ),
};
