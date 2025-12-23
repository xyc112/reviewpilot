import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from './ThemeProvider';
import { LogOut, User, LayoutDashboard, Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import '../../styles/Auth.css';
import '../../styles/CourseUI.css';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="main-content-area">
                {/* Top Navbar */}
                <header className="navbar-card">
                    <div className="brand">
                        <LayoutDashboard size={24} strokeWidth={1.5} />
                        <span>ReviewPilot</span>
                    </div>

                    <div className="nav-right">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                            <User size={16} strokeWidth={1.5} />
                            <span className="user-name">{user?.username}</span>
                        </div>
                        <button
                            className="theme-toggle-btn"
                            onClick={toggleTheme}
                            title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
                            aria-label="切换主题"
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
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
        </div>
    );
};

export default Layout;