import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, Layout, LoadingSpinner } from "@/shared/components";
import { ROUTES } from "@/shared/config/routes";

export { ROUTES };

const Landing = lazy(() => import("@/features/landing/Landing"));
const Login = lazy(() => import("@/features/auth/Login"));
const Register = lazy(() => import("@/features/auth/Register"));
const CourseList = lazy(() => import("@/features/course/CourseList"));
const CourseDetail = lazy(() => import("@/features/course/CourseDetail"));
const CourseFiles = lazy(() => import("@/features/course/CourseFiles"));
const CourseOverview = lazy(() => import("@/features/course/CourseOverview"));
const CreateCourse = lazy(() => import("@/features/course/CreateCourse"));
const EditCourse = lazy(() => import("@/features/course/EditCourse"));
const Community = lazy(() => import("@/features/community/Community"));
const CreatePost = lazy(() => import("@/features/community/CreatePost"));
const NoteList = lazy(() => import("@/features/notes/NoteList"));
const NoteDetail = lazy(() => import("@/features/notes/NoteDetail"));
const NoteEdit = lazy(() => import("@/features/notes/NoteEdit"));
const NoteCreate = lazy(() => import("@/features/notes/NoteCreate"));
const QuizList = lazy(() => import("@/features/quizzes/QuizList"));
const QuizDetail = lazy(() => import("@/features/quizzes/QuizDetail"));
const CreateQuiz = lazy(() => import("@/features/quizzes/CreateQuiz"));
const EditQuiz = lazy(() => import("@/features/quizzes/EditQuiz"));
const GraphView = lazy(() => import("@/features/learning/GraphView"));
const ProgressPage = lazy(() => import("@/features/learning/ProgressPage"));
const WrongQuestionBook = lazy(
  () => import("@/features/learning/WrongQuestionBook"),
);
const ReviewPlan = lazy(() => import("@/features/learning/ReviewPlan"));
const Profile = lazy(() => import("@/features/profile/Profile"));

const LazyWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

export const AppRoutes = () => {
  return (
    <Routes>
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
          path="profile"
          element={
            <LazyWrapper>
              <Profile />
            </LazyWrapper>
          }
        />
        <Route
          path="courses"
          element={
            <LazyWrapper>
              <CourseList />
            </LazyWrapper>
          }
        />
        <Route
          path="courses/:id/files"
          element={
            <LazyWrapper>
              <CourseFiles />
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
          path="courses/:courseId/community/new"
          element={
            <LazyWrapper>
              <CreatePost />
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
      <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
    </Routes>
  );
};
