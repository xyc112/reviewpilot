import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './components/common/ThemeProvider';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import GraphView from './pages/GraphView';
import NoteList from './pages/NoteList';
import NoteDetail from './pages/NoteDetail';
import NoteEdit from './pages/NoteEdit';
import NoteCreate from './pages/NoteCreate';
import QuizList from './pages/QuizList';
import ProtectedRoute from './components/common/ProtectedRoute';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import QuizDetail from './pages/QuizDetail';

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
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<CourseList />} />
                        <Route path="courses" element={<CourseList />} />
                        <Route path="courses/new" element={<CreateCourse />} />
                        <Route path="courses/edit/:id" element={<EditCourse />} />
                        <Route path="graph" element={<GraphView />} />
                        <Route path="notes" element={<NoteList />} />
                        <Route path="notes/new" element={<NoteCreate />} />
                        <Route path="notes/:noteId" element={<NoteDetail />} />
                        <Route path="notes/:noteId/edit" element={<NoteEdit />} />
                        <Route path="quizzes" element={<QuizList />} />
                        <Route path="quizzes/new" element={<CreateQuiz />} />
                        <Route path="quizzes/edit/:quizId" element={<EditQuiz />} />
                        <Route path="quizzes/:quizId" element={<QuizDetail />} />
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