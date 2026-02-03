/**
 * 页面组件统一导出
 * 按功能模块分组
 */

// 公开页
export { default as Landing } from "./Landing";

// 认证相关
export { default as Login } from "./Login";
export { default as Register } from "./Register";

// 课程相关
export { default as CourseList } from "./CourseList";
export { default as CourseDetail } from "./CourseDetail";
export { default as CourseOverview } from "./CourseOverview";
export { default as CreateCourse } from "./CreateCourse";
export { default as EditCourse } from "./EditCourse";
export { default as Community } from "./Community";

// 笔记相关
export { default as NoteList } from "./NoteList";
export { default as NoteDetail } from "./NoteDetail";
export { default as NoteCreate } from "./NoteCreate";
export { default as NoteEdit } from "./NoteEdit";

// 测验相关
export { default as QuizList } from "./QuizList";
export { default as QuizDetail } from "./QuizDetail";
export { default as CreateQuiz } from "./CreateQuiz";
export { default as EditQuiz } from "./EditQuiz";

// 学习工具相关
export { default as GraphView } from "./GraphView";
export { default as ProgressPage } from "./ProgressPage";
export { default as WrongQuestionBook } from "./WrongQuestionBook";
export { default as ReviewPlan } from "./ReviewPlan";
