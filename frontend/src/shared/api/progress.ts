import api from "./apiClient";
import type { OverallStats, CourseProgress } from "@/shared/types";

export const progressAPI = {
  getOverallStats: () => api.get<OverallStats>("/api/progress/overall"),
  getAllCourseProgress: () =>
    api.get<CourseProgress[]>("/api/progress/courses"),
  getCourseProgress: (courseId: number) =>
    api.get<CourseProgress>(`/api/progress/courses/${String(courseId)}`),
};
