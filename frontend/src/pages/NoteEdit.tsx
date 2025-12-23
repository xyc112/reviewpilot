import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Note } from '../types';
import { noteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import '../styles/Course.css';

const NoteEdit: React.FC = () => {
    const { noteId } = useParams<{ noteId: string }>();
    const navigate = useNavigate();
    const { selectedCourse } = useCourse();
    const { user, isAdmin } = useAuth();
    const { success, error: showError } = useToast();

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [noteForm, setNoteForm] = useState({
        title: '',
        content: '',
        visibility: 'private' as 'public' | 'private',
    });

    useEffect(() => {
        if (!selectedCourse) {
            navigate('/courses');
            return;
        }
        if (noteId) {
            fetchNote();
        }
    }, [selectedCourse, noteId, navigate]);

    const fetchNote = async () => {
        if (!selectedCourse || !noteId) return;
        try {
            setLoading(true);
            const response = await noteAPI.getNote(selectedCourse.id, noteId);
            const noteData = response.data;
            setNote(noteData);
            setNoteForm({
                title: noteData.title,
                content: noteData.content,
                visibility: noteData.visibility,
            });
        } catch (err: any) {
            const errorMsg = '获取笔记失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note) return;

        setSaving(true);
        setError('');

        if (!selectedCourse) return;
        try {
            await noteAPI.updateNote(selectedCourse.id, note.id, noteForm);
            success('笔记更新成功');
            navigate(`/notes/${noteId}`);
        } catch (err: any) {
            const errorMsg = '更新笔记失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const canEdit = () => {
        return isAdmin || note?.authorId === user?.id;
    };

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

    if (loading) return <div className="loading">加载笔记中...</div>;
    if (error && !note) return <div className="error-message">{error}</div>;
    if (!note) return <div className="error-message">笔记不存在</div>;
    if (!canEdit()) {
        return (
            <div className="container">
                <div className="error-message">无权限编辑此笔记</div>
                <Link to="/notes" className="btn btn-outline">
                    返回笔记列表
                </Link>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <div className="header-content">
                    <Link to={`/courses/${courseId}/notes/${noteId}`} className="btn btn-outline">
                        <ArrowLeft size={18} />
                        取消编辑
                    </Link>
                    <h1>编辑笔记</h1>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="note-edit-page">
                <form onSubmit={handleSubmit} className="note-edit-form">
                    <div className="form-group">
                        <label>标题:</label>
                        <input
                            type="text"
                            value={noteForm.title}
                            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                            required
                            placeholder="输入笔记标题"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>内容:</label>
                        <textarea
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                            rows={20}
                            required
                            placeholder="输入笔记内容，支持 Markdown 格式"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>可见性:</label>
                        <select
                            value={noteForm.visibility}
                            onChange={(e) => setNoteForm({ ...noteForm, visibility: e.target.value as 'public' | 'private' })}
                            className="form-input"
                            aria-label="笔记可见性"
                        >
                            <option value="private">私有（仅自己可见）</option>
                            <option value="public">公开（所有人可见）</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate(`/notes/${noteId}`)}
                            className="btn btn-outline"
                            disabled={saving}
                        >
                            <X size={18} />
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            <Save size={18} />
                            {saving ? '保存中...' : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoteEdit;

