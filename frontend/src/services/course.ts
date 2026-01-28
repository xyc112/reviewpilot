import api from "./apiClient";
import { Course } from "../types";

export const courseAPI = {
  getCourses: () => api.get<Course[]>("/api/courses"),
  getCourse: (id: number) => api.get<Course>(`/api/courses/${id}`),
  createCourse: (courseData: Partial<Course>) =>
    api.post<Course>("/api/courses", courseData),
  updateCourse: (id: number, courseData: Partial<Course>) =>
    api.put<Course>(`/api/courses/${id}`, courseData),
  deleteCourse: (id: number) => api.delete(`/api/courses/${id}`),
};
