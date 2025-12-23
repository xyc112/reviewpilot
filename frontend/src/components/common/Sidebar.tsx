import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Network, FileText, ClipboardList, Menu, X } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedCourse, clearSelectedCourse } = useCourse();
    const { isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 移动端：点击外部区域关闭菜单
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest('.sidebar') && !target.closest('.mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    // 路由变化时关闭移动端菜单
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const menuItems = [
        {
            id: 'courses',
            label: '课程',
            icon: BookOpen,
            path: '/courses',
            requiresCourse: false,
        },
        {
            id: 'graph',
            label: '知识图谱',
            icon: Network,
            path: '/graph',
            requiresCourse: true,
        },
        {
            id: 'notes',
            label: '笔记',
            icon: FileText,
            path: '/notes',
            requiresCourse: true,
        },
        {
            id: 'quizzes',
            label: '测验',
            icon: ClipboardList,
            path: '/quizzes',
            requiresCourse: true,
        },
    ];

    const handleMenuClick = (item: typeof menuItems[0], e: React.MouseEvent) => {
        if (item.requiresCourse && !selectedCourse) {
            e.preventDefault();
            // 如果没有选中课程，先导航到课程列表
            navigate('/courses');
        }
    };

    const isActive = (path: string) => {
        if (path === '/courses') {
            return location.pathname === '/courses' || location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* 移动端菜单按钮 */}
            <button
                className="mobile-menu-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
                aria-expanded={isMobileMenuOpen}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* 移动端遮罩层 */}
            {isMobileMenuOpen && <div className="sidebar-overlay" />}

            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} aria-label="主导航">
                <div className="sidebar-header">
                    <h2>导航</h2>
                    {selectedCourse && (
                        <div className="selected-course-info">
                            <div className="selected-course-title" title={selectedCourse.title}>
                                {selectedCourse.title}
                            </div>
                            <button
                                className="clear-course-btn"
                                onClick={clearSelectedCourse}
                                title="取消选择课程"
                                aria-label="取消选择课程"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav" role="navigation" aria-label="主菜单">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const disabled = item.requiresCourse && !selectedCourse;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={(e) => handleMenuClick(item, e)}
                                className={`sidebar-item ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                                title={disabled ? '请先选择一个课程' : item.label}
                                aria-current={active ? 'page' : undefined}
                                aria-disabled={disabled}
                            >
                                <Icon size={20} aria-hidden="true" />
                                <span>{item.label}</span>
                                {disabled && <span className="disabled-hint">（需选择课程）</span>}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;

