import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Settings, PlusCircle, LogOut, User, LayoutDashboard } from 'lucide-react';
import '../../styles/Auth.css';
import '../../styles/CourseUI.css';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout-container">

            {/* Navbar */}
            <header className="navbar-card">
                <div className="brand">
                    <Link to="/" className="brand">
                        <LayoutDashboard size={24} strokeWidth={1.5} />
                        <span>ReviewPilot</span>
                    </Link>
                </div>

                <nav className="nav-center">
                    <Link to="/courses"
                          className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>
                        <BookOpen size={18} strokeWidth={1.5} />
                        <span>课程</span>
                    </Link>

                    {user?.role === 'ADMIN' && (
                        <Link to="/admin"
                              className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                            <Settings size={18} strokeWidth={1.5} />
                            <span>管理</span>
                        </Link>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                        <Link to="/courses/new" className="nav-item">
                            <PlusCircle size={18} strokeWidth={1.5} />
                            <span>创建课程</span>
                        </Link>
                    )}
                </nav>

                <div className="nav-right">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                        <User size={16} strokeWidth={1.5} />
                        <span className="user-name">{user?.username}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} strokeWidth={1.5} />
                        <span>退出</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-wrapper">
                <div className="main-inner">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default Layout;