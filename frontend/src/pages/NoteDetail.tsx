import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Note } from '../types';
import { noteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { useTheme } from '../components/common/ThemeProvider';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import '../styles/Course.css';

const NoteDetail: React.FC = () => {
    const { noteId } = useParams<{ noteId: string }>();
    const navigate = useNavigate();
    const { selectedCourse, currentStudyingCourse } = useCourse();
    const course = selectedCourse || currentStudyingCourse;
    const { user, isAdmin } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { success, error: showError } = useToast();

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        if (!course) {
            navigate('/courses');
            return;
        }
        if (noteId) {
            fetchNote();
        }
    }, [course, noteId, navigate]);

    const fetchNote = async () => {
        if (!course || !noteId) return;
        try {
            setLoading(true);
            const response = await noteAPI.getNote(course.id, noteId);
            setNote(response.data);
        } catch (err: any) {
            const errorMsg = '获取笔记失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!note) return;
        if (!course) return;
        try {
            await noteAPI.deleteNote(course.id, note.id);
            success('笔记删除成功');
            navigate('/notes');
        } catch (err: any) {
            const errorMsg = '删除笔记失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setDeleteConfirm(false);
        }
    };

    const canEdit = () => {
        return isAdmin || note?.authorId === user?.id;
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

    if (!course) {
        return (
            <div className="container">
                <div className="error-message">请先选择一个课程</div>
                <button onClick={() => navigate('/courses')} className="btn btn-primary">
                    前往课程列表
                </button>
            </div>
        );
    }

    if (loading) return <div className="loading">加载笔记中...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!note) return <div className="error-message">笔记不存在</div>;

    return (
        <div className="container">
            <ConfirmDialog
                isOpen={deleteConfirm}
                title="删除笔记"
                message="确定要删除这条笔记吗？此操作无法撤销。"
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(false)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/notes" className="btn btn-outline">
                    <ArrowLeft size={18} />
                    返回笔记列表
                </Link>
                {canEdit() && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link
                            to={`/notes/${noteId}/edit`}
                            className="btn btn-primary"
                        >
                                <Edit size={18} />
                                编辑笔记
                            </Link>
                            <button
                                onClick={() => setDeleteConfirm(true)}
                                className="btn btn-danger"
                            >
                                <Trash2 size={18} />
                                删除笔记
                            </button>
                    </div>
                )}
            </div>

            <div className="note-detail-page">
                <div className="note-detail-header">
                    <h1 style={{ color: isDark ? '#f9fafb' : '#1e293b' }}>{note.title}</h1>
                    <div className="note-meta">
                        <span className={`visibility-badge ${note.visibility}`}>
                            {note.visibility === 'public' ? '公开' : '私有'}
                        </span>
                        <span>创建于: {formatDate(note.createdAt)}</span>
                        {note.updatedAt && (
                            <span>更新于: {formatDate(note.updatedAt)}</span>
                        )}
                    </div>
                </div>

                <div className="note-detail-content">
                    <MarkdownRenderer content={note.content} />
                </div>
            </div>
        </div>
    );
};

export default NoteDetail;

