import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { noteAPI } from '../services/api';
import { useCourse } from '../context/CourseContext';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import '../styles/Course.css';

const NoteCreate: React.FC = () => {
    const navigate = useNavigate();
    const { selectedCourse } = useCourse();
    const { success, error: showError } = useToast();

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
        }
    }, [selectedCourse, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;

        setSaving(true);
        setError('');

        try {
            const response = await noteAPI.createNote(selectedCourse.id, noteForm);
            success('笔记创建成功');
            navigate(`/notes/${response.data.id}`);
        } catch (err: any) {
            const errorMsg = '创建笔记失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <div className="header-content">
                    <Link to="/notes" className="btn btn-outline">
                        <ArrowLeft size={18} />
                        返回笔记列表
                    </Link>
                    <h1>创建新笔记</h1>
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
                            onClick={() => navigate('/notes')}
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
                            {saving ? '创建中...' : '创建'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoteCreate;

