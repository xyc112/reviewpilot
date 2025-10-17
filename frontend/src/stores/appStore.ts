import { create } from "zustand";
import { Course } from "@/utils/types.ts";

interface AppState {
  currentCourse: Course | null;
  courses: Course[];
  loading: boolean;
  setCurrentCourse: (course: Course) => void;
  setCourses: (courses: Course[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentCourse: null,
  courses: [],
  loading: false,
  setCurrentCourse: (course) => set({ currentCourse: course }),
  setCourses: (courses) => set({ courses }),
  setLoading: (loading) => set({ loading }),
}));
