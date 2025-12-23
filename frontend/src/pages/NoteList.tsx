import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Note } from '../types';
import { noteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { Search, X, Plus } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';

const NoteList: React.FC = () => {
    const navigate = useNavigate();
    const { selectedCourse } = useCourse();

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; noteId: string | null }>({
        isOpen: false,
        noteId: null,
    });

    const { user, isAdmin } = useAuth();
    const { success, error: showError } = useToast();

    useEffect(() => {
        if (!selectedCourse) {
            navigate('/courses');
            return;
        }
        fetchNotes();
    }, [selectedCourse, navigate]);

    const fetchNotes = async () => {
        if (!selectedCourse) return;
        try {
            setLoading(true);
            const response = await noteAPI.getNotes(selectedCourse.id);
            setNotes(response.data);
        } catch (err: any) {
            setError('获取笔记列表失败: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteNote = async (noteId: string) => {
        setDeleteConfirm({ isOpen: true, noteId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.noteId) return;
        if (!selectedCourse) return;
        try {
            await noteAPI.deleteNote(selectedCourse.id, deleteConfirm.noteId);
            success('笔记删除成功');
            fetchNotes();
        } catch (err: any) {
            const errorMsg = '删除笔记失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setDeleteConfirm({ isOpen: false, noteId: null });
        }
    };



    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // 过滤笔记
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            // 搜索过滤
            const matchesSearch = !searchQuery || 
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase());

            // 可见性过滤
            const matchesVisibility = visibilityFilter === 'all' || note.visibility === visibilityFilter;

            return matchesSearch && matchesVisibility;
        });
    }, [notes, searchQuery, visibilityFilter]);

    if (!selectedCourse) {
        return (
            <div className="container">
                <div className="error-message">请先选择一个课程</div>
                <button onClick={() => navigate('/courses')} className="btn btn-primary">
                    前往课程列表
                </button>
            </div>
        );
    }

    if (loading) return <div className="loading">加载笔记列表中...</div>;

    return (
        <div className="notes-view">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>课程笔记</h1>
                        <p className="text-stone-500 mt-2">{selectedCourse?.title} - 管理和查看您的学习笔记</p>
                    </div>
                    {selectedCourse && (
                        <div className="header-actions">
                            <Link
                                to="/notes/new"
                                className="btn btn-primary"
                            >
                                <Plus size={18} />
                                创建笔记
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="error">{error}</div>}

            {/* 搜索和过滤栏 */}
            <div className="search-filter-bar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="搜索笔记标题或内容..."
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
                    <select
                        value={visibilityFilter}
                        onChange={(e) => setVisibilityFilter(e.target.value as 'all' | 'public' | 'private')}
                        className="filter-select"
                    >
                        <option value="all">全部可见性</option>
                        <option value="public">公开</option>
                        <option value="private">私有</option>
                    </select>
                </div>

                {(searchQuery || visibilityFilter !== 'all') && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setVisibilityFilter('all');
                        }}
                        className="btn btn-outline btn-small"
                    >
                        <X size={16} />
                        清除筛选
                    </button>
                )}
            </div>

            {/* 确认删除对话框 */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="删除笔记"
                message="确定要删除这条笔记吗？此操作无法撤销。"
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, noteId: null })}
            />

            <div className="notes-container">
                {notes.length === 0 ? (
                    <div className="empty-state">
                        <p>暂无笔记</p>
                        <p>点击"创建笔记"按钮开始记录你的学习心得</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="empty-state">
                        <p>未找到匹配的笔记</p>
                        <p>尝试调整搜索条件或筛选器</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setVisibilityFilter('all');
                            }}
                            className="btn btn-primary"
                        >
                            清除所有筛选
                        </button>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {filteredNotes.map((note) => (
                            <Link
                                key={note.id}
                                to={`/notes/${note.id}`}
                                className="note-card"
                            >
                                <div className="note-card-header">
                                    <h3>{note.title}</h3>
                                    <span className={`visibility-badge ${note.visibility}`}>
                                        {note.visibility === 'public' ? '公开' : '私有'}
                                    </span>
                                </div>
                                <div className="note-card-content">
                                    {note.content.length > 150
                                        ? note.content.substring(0, 150) + '...'
                                        : note.content}
                                </div>
                                <div className="note-card-footer">
                                    <span className="note-date">
                                        {formatDate(note.createdAt)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteList;