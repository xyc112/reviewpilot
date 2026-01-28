import api from "./apiClient";
import { Note } from "../types";

export const noteAPI = {
  getNotes: (courseId: number) => api.get<Note[]>(`/api/courses/${courseId}/notes`),
  getNote: (courseId: number, noteId: string) =>
    api.get<Note>(`/api/courses/${courseId}/notes/${noteId}`),
  createNote: (courseId: number, noteData: Partial<Note>) =>
    api.post<Note>(`/api/courses/${courseId}/notes`, noteData),
  updateNote: (courseId: number, noteId: string, noteData: Partial<Note>) =>
    api.put<Note>(`/api/courses/${courseId}/notes/${noteId}`, noteData),
  deleteNote: (courseId: number, noteId: string) =>
    api.delete(`/api/courses/${courseId}/notes/${noteId}`),
};
