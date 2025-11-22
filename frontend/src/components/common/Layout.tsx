import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app">
            <header className="header">
                <nav className="nav">
                    <div className="nav-brand">
                        <Link to="/">学习辅助系统</Link>
                    </div>
                    <div className="nav-links">
                        <Link to="/courses">课程</Link>
                        {user?.role === 'ADMIN' && (
                            <Link to="/admin">管理</Link>
                        )}
                    </div>
                    <div className="nav-user">
                        <span>欢迎, {user?.username}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            退出
                        </button>
                    </div>
                </nav>
            </header>

            <main className="main">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;