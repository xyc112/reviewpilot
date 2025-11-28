import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout">

            <header className="topbar">
                <div className="nav-left">
                    <Link to="/" className="brand">
                        学习辅助系统
                    </Link>
                </div>

                <nav className="nav-center">
                    <Link to="/courses" className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>课程</Link>
                    {user?.role === 'ADMIN' &&
                        <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>管理</Link>
                    }
                </nav>

                <div className="nav-right">
                    <span className="user-info">你好，{user?.username}</span>
                    <button className="logout-btn" onClick={handleLogout}>
                        退出
                    </button>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
