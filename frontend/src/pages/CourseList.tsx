import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { Book, Plus, Search, Filter, X, Edit, Trash2, Check } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import '../styles/CourseUI.css';
import '../styles/Course.css';

const CourseList: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; courseId: number | null }>({
        isOpen: false,
        courseId: null,
    });
    const { isAdmin } = useAuth();
    const { selectedCourse, setSelectedCourse } = useCourse();
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getCourses();
            setCourses(response.data);
        } catch (err: any) {
            setError('获取课程列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = (course: Course) => {
        setSelectedCourse(course);
        success(`已选择课程: ${course.title}`);
    };

    const handleDeleteCourse = (courseId: number) => {
        setDeleteConfirm({ isOpen: true, courseId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.courseId) return;
        try {
            await courseAPI.deleteCourse(deleteConfirm.courseId);
            success('课程删除成功');
            // 如果删除的是当前选中的课程，清除选择
            if (selectedCourse?.id === deleteConfirm.courseId) {
                setSelectedCourse(null);
            }
            fetchCourses();
        } catch (err: any) {
            const errorMsg = '删除课程失败: ' + (err.response?.data?.message || '未知错误');
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setDeleteConfirm({ isOpen: false, courseId: null });
        }
    };

    const getLevelText = (level: string) => {
        const levels: Record<string, string> = {
            'BEGINNER': '初级',
            'INTERMEDIATE': '中级',
            'ADVANCED': '高级'
        };
        return levels[level] || level;
    };

    const getLevelClass = (level: string) => {
        return `level-badge level-${level.toLowerCase()}`;
    };

    // 获取所有唯一的标签
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        courses.forEach(course => {
            course.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [courses]);

    // 过滤课程
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // 搜索过滤
            const matchesSearch = !searchQuery || 
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            // 难度过滤
            const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

            // 标签过滤
            const matchesTags = selectedTags.size === 0 || 
                course.tags.some(tag => selectedTags.has(tag));

            return matchesSearch && matchesLevel && matchesTags;
        });
    }, [courses, searchQuery, selectedLevel, selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tag)) {
                newSet.delete(tag);
            } else {
                newSet.add(tag);
            }
            return newSet;
        });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedLevel('all');
        setSelectedTags(new Set());
    };

    const hasActiveFilters = searchQuery || selectedLevel !== 'all' || selectedTags.size > 0;

    if (loading) return (
        <div className="container">
            <div className="loading">加载中...</div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-message">{error}</div>
        </div>
    );

    return (
        <div className="container">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>课程列表</h1>
                        <p className="text-stone-500 mt-2">选择课程以访问知识图谱、笔记和测验</p>
                        {selectedCourse && (
                            <div className="selected-course-badge">
                                <Check size={16} />
                                <span>当前选择: {selectedCourse.title}</span>
                            </div>
                        )}
                    </div>
                    {isAdmin && (
                        <Link to="/courses/new" className="btn btn-primary">
                            <Plus size={18} />
                            创建新课程
                        </Link>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="删除课程"
                message="确定要删除这个课程吗？此操作不可撤销，将删除课程及其所有相关内容。"
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, courseId: null })}
            />

            {/* 搜索和过滤栏 */}
            <div className="search-filter-bar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="搜索课程标题、描述或标签..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="search-clear"
                            aria-label="清除搜索"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">全部难度</option>
                        <option value="BEGINNER">初级</option>
                        <option value="INTERMEDIATE">中级</option>
                        <option value="ADVANCED">高级</option>
                    </select>
                </div>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn btn-outline btn-small">
                        <X size={16} />
                        清除筛选
                    </button>
                )}
            </div>

            {/* 标签过滤 */}
            {allTags.length > 0 && (
                <div className="tags-filter">
                    <span className="tags-filter-label">标签：</span>
                    <div className="tags-filter-list">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`tag-filter-btn ${selectedTags.has(tag) ? 'active' : ''}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 结果统计 */}
            {hasActiveFilters && (
                <div className="filter-results-info">
                    找到 {filteredCourses.length} 个课程（共 {courses.length} 个）
                </div>
            )}

            {courses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Book size={48} strokeWidth={1} />
                    </div>
                    <h3>暂无课程</h3>
                    <p>还没有创建任何课程，{isAdmin ? '立即创建第一个课程吧！' : '请等待管理员创建课程。'}</p>
                    {isAdmin && (
                        <Link to="/courses/new" className="btn btn-primary">
                            创建新课程
                        </Link>
                    )}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Search size={48} strokeWidth={1} />
                    </div>
                    <h3>未找到匹配的课程</h3>
                    <p>尝试调整搜索条件或筛选器</p>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="btn btn-primary">
                            清除所有筛选
                        </button>
                    )}
                </div>
            ) : (
                <div className="courses-grid">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="course-card">
                            <div className="course-card-header">
                                <h3 className="course-title">{course.title}</h3>
                                <span className={getLevelClass(course.level)}>
                                    {getLevelText(course.level)}
                                </span>
                            </div>
                            <p className="course-description">{course.description || '暂无描述'}</p>

                            {course.tags.length > 0 && (
                                <div className="course-tags">
                                    {course.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}

                            <div className="course-actions">
                                <button
                                    onClick={() => handleSelectCourse(course)}
                                    className={`btn ${selectedCourse?.id === course.id ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    <Check size={16} />
                                    {selectedCourse?.id === course.id ? '已选择' : '选择课程'}
                                </button>
                                {isAdmin && (
                                    <div className="course-admin-actions">
                                        <button
                                            onClick={() => navigate(`/courses/edit/${course.id}`)}
                                            className="btn btn-outline btn-small"
                                            title="编辑课程"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="btn btn-danger btn-small"
                                            title="删除课程"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseList;