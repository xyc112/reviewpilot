import api from "./apiClient";
import type { Course } from "../types";

export const courseAPI = {
  getCourses: () => api.get<Course[]>("/api/courses"),
  getCourse: (id: number) => api.get<Course>(`/api/courses/${String(id)}`),
  createCourse: (courseData: Partial<Course>) =>
    api.post<Course>("/api/courses", courseData),
  updateCourse: (id: number, courseData: Partial<Course>) =>
    api.put<Course>(`/api/courses/${String(id)}`, courseData),
  deleteCourse: (id: number) => api.delete(`/api/courses/${String(id)}`),
};
