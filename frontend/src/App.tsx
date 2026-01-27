import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import GraphView from "./pages/GraphView";
import NoteList from "./pages/NoteList";
import NoteDetail from "./pages/NoteDetail";
import NoteEdit from "./pages/NoteEdit";
import NoteCreate from "./pages/NoteCreate";
import QuizList from "./pages/QuizList";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";
import QuizDetail from "./pages/QuizDetail";
import ProgressPage from "./pages/ProgressPage";
import Community from "./pages/Community";
import WrongQuestionBook from "./pages/WrongQuestionBook";
import CourseOverview from "./pages/CourseOverview";
import ReviewPlan from "./pages/ReviewPlan";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CourseList />} />
                  <Route path="courses" element={<CourseList />} />
                  <Route path="courses/:id" element={<CourseDetail />} />
                  <Route
                    path="courses/:id/overview"
                    element={<CourseOverview />}
                  />
                  <Route path="courses/new" element={<CreateCourse />} />
                  <Route path="courses/edit/:id" element={<EditCourse />} />
                  <Route
                    path="courses/:courseId/community"
                    element={<Community />}
                  />
                  <Route
                    path="wrong-questions"
                    element={<WrongQuestionBook />}
                  />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="graph" element={<GraphView />} />
                  <Route path="notes" element={<NoteList />} />
                  <Route path="notes/new" element={<NoteCreate />} />
                  <Route path="notes/:noteId" element={<NoteDetail />} />
                  <Route path="notes/:noteId/edit" element={<NoteEdit />} />
                  <Route path="quizzes" element={<QuizList />} />
                  <Route path="quizzes/new" element={<CreateQuiz />} />
                  <Route path="quizzes/edit/:quizId" element={<EditQuiz />} />
                  <Route path="quizzes/:quizId" element={<QuizDetail />} />
                  <Route path="review-plan" element={<ReviewPlan />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
