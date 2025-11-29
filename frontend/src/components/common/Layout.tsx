import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';
import '../../styles/CourseUI.css'; // ⬅ 确保包含 layout-container 样式



const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        // ⬅⬅⬅ 新增 layout-container：全局虚化背景层
        <div className="layout-container">

            {/* 顶部导航：保持白色悬浮风 */}
            <header className="navbar-card">
                <div className="brand">
                    <Link to="/" className="brand">学习辅助系统</Link>
                </div>

                <nav className="nav-center">
                    <Link to="/courses"
                          className={`nav-item ${location.pathname === '/courses' ? 'active' : ''}`}>
                        课程
                    </Link>

                    {user?.role === 'ADMIN' && (
                        <Link to="/admin"
                              className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                            管理
                        </Link>
                    )}
                    
                    {user?.role === 'ADMIN' && (
                        <Link to="/courses/new" className="nav-item">
                            + 创建课程
                        </Link>
                    )}
                </nav>

                <div className="nav-right">
                    <span className="user-name">你好，{user?.username}</span>
                    <button className="logout-btn" onClick={handleLogout}>退出</button>
                </div>
            </header>

            {/* 主内容区：白色卡片容器层 */}
            <main className="main-wrapper">
                <div className="main-inner">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default Layout;