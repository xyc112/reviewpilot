import api from "./apiClient";
import { OverallStats, CourseProgress } from "../types";

export const progressAPI = {
  getOverallStats: () => api.get<OverallStats>("/api/progress/overall"),
  getAllCourseProgress: () =>
    api.get<CourseProgress[]>("/api/progress/courses"),
  getCourseProgress: (courseId: number) =>
    api.get<CourseProgress>(`/api/progress/courses/${courseId}`),
};
