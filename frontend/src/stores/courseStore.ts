import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Course } from "../types";
import { userCourseAPI, courseAPI } from "../services";
import { useAuthStore } from "./authStore";

interface CourseState {
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  clearSelectedCourse: () => void;
  currentStudyingCourse: Course | null;
  selectedCourses: Course[];
  selectedCourseIds: Set<number>;
  refreshUserCourses: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  selectedCourse: null,
  currentStudyingCourse: null,
  selectedCourses: [] as Course[],
  selectedCourseIds: new Set<number>(),
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedCourse: (course: Course | null) => {
        set({ selectedCourse: course });
      },

      clearSelectedCourse: () => {
        set({ selectedCourse: null });
      },

      refreshUserCourses: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
          return;
        }

        try {
          const [userCoursesRes, coursesRes] = await Promise.all([
            userCourseAPI.getUserCourses(),
            courseAPI.getCourses(),
          ]);

          const userCourses = userCoursesRes.data;
          const allCourses = coursesRes.data;
          const coursesMap = new Map(allCourses.map((c) => [c.id, c]));

          // 构建选择的课程列表
          const selected: Course[] = [];
          const selectedIds = new Set<number>();
          let currentStudying: Course | null = null;

          userCourses.forEach((uc) => {
            const course = coursesMap.get(uc.courseId);
            if (course) {
              selected.push(course);
              selectedIds.add(uc.courseId);
              if (uc.isCurrentStudying) {
                currentStudying = course;
              }
            }
          });

          set({
            selectedCourses: selected,
            selectedCourseIds: selectedIds,
            currentStudyingCourse: currentStudying,
          });
        } catch (err) {
          console.error("Failed to fetch user courses:", err);
        }
      },

      reset: () => {
        set(initialState);
        localStorage.removeItem("selectedCourse");
      },
    }),
    {
      name: "course-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCourse: state.selectedCourse,
      }),
    },
  ),
);

// 监听用户状态变化，自动刷新课程数据
useAuthStore.subscribe(
  (state) => state.user,
  (user) => {
    if (!user) {
      // 用户已登出，重置课程状态
      useCourseStore.getState().reset();
    } else {
      // 用户已登录，刷新用户课程
      useCourseStore.getState().refreshUserCourses();
    }
  },
);
