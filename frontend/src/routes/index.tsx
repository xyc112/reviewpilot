import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, Layout, LoadingSpinner } from "../components";
import { ROUTES } from "./routes";

// 导出路由常量供其他模块使用
export { ROUTES };

// 页面组件懒加载
const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const CourseList = lazy(() => import("../pages/CourseList"));
const CourseDetail = lazy(() => import("../pages/CourseDetail"));
const CourseOverview = lazy(() => import("../pages/CourseOverview"));
const CreateCourse = lazy(() => import("../pages/CreateCourse"));
const EditCourse = lazy(() => import("../pages/EditCourse"));
const Community = lazy(() => import("../pages/Community"));
const NoteList = lazy(() => import("../pages/NoteList"));
const NoteDetail = lazy(() => import("../pages/NoteDetail"));
const NoteEdit = lazy(() => import("../pages/NoteEdit"));
const NoteCreate = lazy(() => import("../pages/NoteCreate"));
const QuizList = lazy(() => import("../pages/QuizList"));
const QuizDetail = lazy(() => import("../pages/QuizDetail"));
const CreateQuiz = lazy(() => import("../pages/CreateQuiz"));
const EditQuiz = lazy(() => import("../pages/EditQuiz"));
const GraphView = lazy(() => import("../pages/GraphView"));
const ProgressPage = lazy(() => import("../pages/ProgressPage"));
const WrongQuestionBook = lazy(() => import("../pages/WrongQuestionBook"));
const ReviewPlan = lazy(() => import("../pages/ReviewPlan"));

// 懒加载包装组件
const LazyWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 公开：落地页 */}
      <Route
        path={ROUTES.LANDING}
        element={
          <LazyWrapper>
            <Landing />
          </LazyWrapper>
        }
      />
      <Route
        path={ROUTES.LOGIN}
        element={
          <LazyWrapper>
            <Login />
          </LazyWrapper>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <LazyWrapper>
            <Register />
          </LazyWrapper>
        }
      />

      {/* 受保护的应用路由（/app） */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.COURSES} replace />} />
        <Route
          path="courses"
          element={
            <LazyWrapper>
              <CourseList />
            </LazyWrapper>
          }
        />
        <Route
          path="courses/:id"
          element={
            <LazyWrapper>
              <CourseDetail />
            </LazyWrapper>
          }
        />
        <Route
          path="courses/:id/overview"
          element={
            <LazyWrapper>
              <CourseOverview />
            </LazyWrapper>
          }
        />
        <Route
          path="courses/new"
          element={
            <LazyWrapper>
              <CreateCourse />
            </LazyWrapper>
          }
        />
        <Route
          path="courses/edit/:id"
          element={
            <LazyWrapper>
              <EditCourse />
            </LazyWrapper>
          }
        />
        <Route
          path="courses/:courseId/community"
          element={
            <LazyWrapper>
              <Community />
            </LazyWrapper>
          }
        />
        <Route
          path="wrong-questions"
          element={
            <LazyWrapper>
              <WrongQuestionBook />
            </LazyWrapper>
          }
        />
        <Route
          path="progress"
          element={
            <LazyWrapper>
              <ProgressPage />
            </LazyWrapper>
          }
        />
        <Route
          path="graph"
          element={
            <LazyWrapper>
              <GraphView />
            </LazyWrapper>
          }
        />
        <Route
          path="notes"
          element={
            <LazyWrapper>
              <NoteList />
            </LazyWrapper>
          }
        />
        <Route
          path="notes/new"
          element={
            <LazyWrapper>
              <NoteCreate />
            </LazyWrapper>
          }
        />
        <Route
          path="notes/:noteId"
          element={
            <LazyWrapper>
              <NoteDetail />
            </LazyWrapper>
          }
        />
        <Route
          path="notes/:noteId/edit"
          element={
            <LazyWrapper>
              <NoteEdit />
            </LazyWrapper>
          }
        />
        <Route
          path="quizzes"
          element={
            <LazyWrapper>
              <QuizList />
            </LazyWrapper>
          }
        />
        <Route
          path="quizzes/new"
          element={
            <LazyWrapper>
              <CreateQuiz />
            </LazyWrapper>
          }
        />
        <Route
          path="quizzes/edit/:quizId"
          element={
            <LazyWrapper>
              <EditQuiz />
            </LazyWrapper>
          }
        />
        <Route
          path="quizzes/:quizId"
          element={
            <LazyWrapper>
              <QuizDetail />
            </LazyWrapper>
          }
        />
        <Route
          path="review-plan"
          element={
            <LazyWrapper>
              <ReviewPlan />
            </LazyWrapper>
          }
        />
      </Route>

      {/* 404 重定向到落地页 */}
      <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
    </Routes>
  );
};
