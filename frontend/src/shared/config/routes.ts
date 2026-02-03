/**
 * 路由路径常量
 * 落地页与认证为公开路径，应用主体在 /app 下
 */
export const ROUTES = {
  // 公开：落地页与认证
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // 应用首页（登录后默认进入）
  HOME: "/app",
  COURSES: "/app/courses",
  COURSE_DETAIL: (id: number) => `/app/courses/${String(id)}`,
  COURSE_OVERVIEW: (id: number) => `/app/courses/${String(id)}/overview`,
  CREATE_COURSE: "/app/courses/new",
  EDIT_COURSE: (id: number) => `/app/courses/edit/${String(id)}`,
  COURSE_COMMUNITY: (courseId: number) =>
    `/app/courses/${String(courseId)}/community`,

  // 笔记相关
  NOTES: "/app/notes",
  NOTE_DETAIL: (noteId: string) => `/app/notes/${noteId}`,
  NOTE_EDIT: (noteId: string) => `/app/notes/${noteId}/edit`,
  CREATE_NOTE: "/app/notes/new",

  // 测验相关
  QUIZZES: "/app/quizzes",
  QUIZ_DETAIL: (quizId: string) => `/app/quizzes/${quizId}`,
  CREATE_QUIZ: "/app/quizzes/new",
  EDIT_QUIZ: (quizId: string) => `/app/quizzes/edit/${quizId}`,

  // 其他功能
  GRAPH: "/app/graph",
  PROGRESS: "/app/progress",
  WRONG_QUESTIONS: "/app/wrong-questions",
  REVIEW_PLAN: "/app/review-plan",
} as const;
