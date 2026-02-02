/**
 * 路由路径常量
 */
export const ROUTES = {
  // 认证相关
  LOGIN: "/login",
  REGISTER: "/register",

  // 课程相关
  HOME: "/",
  COURSES: "/courses",
  COURSE_DETAIL: (id: number) => `/courses/${String(id)}`,
  COURSE_OVERVIEW: (id: number) => `/courses/${String(id)}/overview`,
  CREATE_COURSE: "/courses/new",
  EDIT_COURSE: (id: number) => `/courses/edit/${String(id)}`,
  COURSE_COMMUNITY: (courseId: number) =>
    `/courses/${String(courseId)}/community`,

  // 笔记相关
  NOTES: "/notes",
  NOTE_DETAIL: (noteId: string) => `/notes/${noteId}`,
  NOTE_EDIT: (noteId: string) => `/notes/${noteId}/edit`,
  CREATE_NOTE: "/notes/new",

  // 测验相关
  QUIZZES: "/quizzes",
  QUIZ_DETAIL: (quizId: string) => `/quizzes/${quizId}`,
  CREATE_QUIZ: "/quizzes/new",
  EDIT_QUIZ: (quizId: string) => `/quizzes/edit/${quizId}`,

  // 其他功能
  GRAPH: "/graph",
  PROGRESS: "/progress",
  WRONG_QUESTIONS: "/wrong-questions",
  REVIEW_PLAN: "/review-plan",
} as const;
