import api from "./apiClient";
import type { UserCourse } from "../types";

export const userCourseAPI = {
  getUserCourses: () => api.get<UserCourse[]>("/api/user-courses"),
  addCourse: (courseId: number) => api.post(`/api/user-courses/${String(courseId)}`),
  removeCourse: (courseId: number) =>
    api.delete(`/api/user-courses/${String(courseId)}`),
  setCurrentStudying: (courseId: number) =>
    api.put(`/api/user-courses/${String(courseId)}/current-studying`),
  unsetCurrentStudying: () => api.delete("/api/user-courses/current-studying"),
  getCurrentStudying: () =>
    api.get<{ courseId: number | null }>("/api/user-courses/current-studying"),
};
