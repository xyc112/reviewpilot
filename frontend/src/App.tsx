import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import GraphView from './pages/GraphView';
import NoteList from './pages/NoteList';
import QuizList from './pages/QuizList';
import ProtectedRoute from './components/common/ProtectedRoute';

const App: React.FC = () => {
    return (
        <AuthProvider>
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
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;