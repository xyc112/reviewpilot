import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI, userCourseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { Book, Plus, Search, X, Edit, Trash2, BookOpen, Star } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { SkeletonGrid } from '../components/Skeleton';
import { SearchHighlight } from '../components/SearchHighlight';
import '../styles/CourseUI.css';
import '../styles/Course.css';

const CourseList: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; courseId: number | null }>({
        isOpen: false,
        courseId: null,
    });
    const { isAdmin } = useAuth();
    const { currentStudyingCourse, selectedCourseIds, refreshUserCourses } = useCourse();
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

    const handleAddToStudyList = async (course: Course) => {
        try {
            await userCourseAPI.addCourse(course.id);
            success(`已将 "${course.title}" 添加到学习列表`);
            await refreshUserCourses();
        } catch (err: any) {
            const errorMsg = '添加到学习列表失败: ' + (err.response?.data?.message || '未知错误');
            showError(errorMsg);
        }
    };

    const handleRemoveFromStudyList = async (course: Course) => {
        try {
            await userCourseAPI.removeCourse(course.id);
            success(`已将 "${course.title}" 从学习列表移除`);
            await refreshUserCourses();
        } catch (err: any) {
            const errorMsg = '移除课程失败: ' + (err.response?.data?.message || '未知错误');
            showError(errorMsg);
        }
    };

    const handleSetCurrentStudying = async (course: Course) => {
        try {
            await userCourseAPI.setCurrentStudying(course.id);
            success(`已将 "${course.title}" 设置为当前学习课程`);
            await refreshUserCourses();
        } catch (err: any) {
            const errorMsg = '设置当前学习课程失败: ' + (err.response?.data?.message || '未知错误');
            showError(errorMsg);
        }
    };

    const handleEndStudying = async (course: Course) => {
        try {
            await userCourseAPI.unsetCurrentStudying();
            success(`已结束学习 "${course.title}"`);
            await refreshUserCourses();
        } catch (err: any) {
            const errorMsg = '结束学习失败: ' + (err.response?.data?.message || '未知错误');
            showError(errorMsg);
        }
    };
    
    // 判断课程状态：0-未添加到学习，1-已添加未开始，2-正在学习
    const getCourseState = (course: Course): number => {
        if (currentStudyingCourse?.id === course.id) {
            return 2; // 正在学习
        } else if (selectedCourseIds.has(course.id)) {
            return 1; // 已添加到学习列表但未开始
        }
        return 0; // 未添加到学习
    };

    const handleDeleteCourse = (courseId: number) => {
        setDeleteConfirm({ isOpen: true, courseId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.courseId) return;
        try {
            await courseAPI.deleteCourse(deleteConfirm.courseId);
            success('课程删除成功');
            // 删除课程后刷新用户课程列表
            await refreshUserCourses();
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

            // 标签过滤
            const matchesTags = selectedTags.size === 0 || 
                course.tags.some(tag => selectedTags.has(tag));

            return matchesSearch && matchesTags;
        });
    }, [courses, searchQuery, selectedTags]);

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
        setSelectedTags(new Set());
    };

    const hasActiveFilters = searchQuery || selectedTags.size > 0;

    if (loading) return (
        <div className="container">
            <SkeletonGrid count={6} />
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-message">{error}</div>
        </div>
    );

    return (
        <div className="container">
            {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <Link to="/courses/new" className="btn btn-primary">
                        <Plus size={18} />
                        创建新课程
                    </Link>
                </div>
            )}

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
                    <div className="input-icon-wrapper">
                        <Search size={20} className="input-icon" />
                        <div className="input-icon-divider"></div>
                    </div>
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
                    <span className="search-shortcut-hint" title="快捷键">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    </span>
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
                <div className="courses-list">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="course-list-item">
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        <h3 className="course-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                                            <SearchHighlight text={course.title} searchQuery={searchQuery} />
                                        </h3>
                                        <span className={getLevelClass(course.level)}>
                                            {getLevelText(course.level)}
                                        </span>
                                        {currentStudyingCourse?.id === course.id && (
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.25rem 0.5rem',
                                                background: '#fef3c7',
                                                color: '#92400e',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                            }}>
                                                <Star size={12} />
                                                正在学习
                                            </span>
                                        )}
                                    </div>
                                    {course.description && (
                                        <p className="course-description" style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#78716c' }}>
                                            <SearchHighlight 
                                                text={course.description} 
                                                searchQuery={searchQuery} 
                                            />
                                        </p>
                                    )}
                                    {course.tags.length > 0 && (
                                        <div className="course-tags" style={{ marginBottom: 0 }}>
                                            {course.tags.map(tag => (
                                                <span key={tag} className="tag">
                                                    <SearchHighlight text={tag} searchQuery={searchQuery} />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                {(() => {
                                    const state = getCourseState(course);
                                    switch (state) {
                                        case 0: // 未添加到学习
                                            return (
                                                <button
                                                    onClick={() => handleAddToStudyList(course)}
                                                    className="btn btn-secondary"
                                                    title="添加到学习列表"
                                                >
                                                    <BookOpen size={16} />
                                                    添加到学习
                                                </button>
                                            );
                                        case 1: // 已添加未开始学习
                                            return (
                                                <>
                                                    <button
                                                        onClick={() => handleSetCurrentStudying(course)}
                                                        className="btn btn-primary"
                                                        title="开始学习此课程"
                                                    >
                                                        <Star size={16} />
                                                        开始学习
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveFromStudyList(course)}
                                                        className="btn btn-outline btn-small"
                                                        title="从学习列表移除"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            );
                                        case 2: // 正在学习
                                            return (
                                                <button
                                                    onClick={() => handleEndStudying(course)}
                                                    className="btn btn-secondary"
                                                    title="结束当前学习"
                                                >
                                                    <Star size={16} />
                                                    结束学习
                                                </button>
                                            );
                                        default:
                                            return null;
                                    }
                                })()}
                                {isAdmin && (
                                    <>
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
                                    </>
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