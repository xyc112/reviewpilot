import api from "./apiClient";
import { UserCourse } from "../types";

export const userCourseAPI = {
  getUserCourses: () => api.get<UserCourse[]>("/api/user-courses"),
  addCourse: (courseId: number) => api.post(`/api/user-courses/${courseId}`),
  removeCourse: (courseId: number) =>
    api.delete(`/api/user-courses/${courseId}`),
  setCurrentStudying: (courseId: number) =>
    api.put(`/api/user-courses/${courseId}/current-studying`),
  unsetCurrentStudying: () => api.delete("/api/user-courses/current-studying"),
  getCurrentStudying: () =>
    api.get<{ courseId: number | null }>("/api/user-courses/current-studying"),
};
