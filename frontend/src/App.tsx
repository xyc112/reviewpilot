import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import GraphView from './pages/GraphView';
import NoteList from './pages/NoteList';
import QuizList from './pages/QuizList';
import ProtectedRoute from './components/common/ProtectedRoute';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import QuizDetail from './pages/QuizDetail';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ToastProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<CourseList />} />
                        <Route path="courses" element={<CourseList />} />
                        <Route path="courses/:id" element={<CourseDetail />} />
                        <Route path="courses/:id/graph" element={<GraphView />} />
                        <Route path="courses/:id/notes" element={<NoteList />} />
                        <Route path="courses/:id/quizzes" element={<QuizList />} />
                        // 在 Routes 部分添加新路由
                        <Route path="courses/new" element={<CreateCourse />} />
                        <Route path="courses/edit/:id" element={<EditCourse />} />
                        <Route path="courses/:id/quizzes/new" element={<CreateQuiz />} />
                        <Route path="courses/:id/quizzes/edit/:quizId" element={<EditQuiz />} />
                        <Route path="courses/:courseId/quizzes/:quizId" element={<QuizDetail />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
            </ToastProvider>
        </AuthProvider>
    );
};

export default App;