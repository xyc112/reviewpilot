import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Network, FileText, ClipboardList } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedCourse, clearSelectedCourse } = useCourse();
    const { isAdmin } = useAuth();

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
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>导航</h2>
                {selectedCourse && (
                    <div className="selected-course-info">
                        <div className="selected-course-title">{selectedCourse.title}</div>
                        <button
                            className="clear-course-btn"
                            onClick={clearSelectedCourse}
                            title="取消选择课程"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
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
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                            {disabled && <span className="disabled-hint">（需选择课程）</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;

