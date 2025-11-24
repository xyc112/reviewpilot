import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Note } from '../types';
import { noteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NoteList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const courseId = parseInt(id || '0');

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const { user, isAdmin } = useAuth();

    const [noteForm, setNoteForm] = useState({
        title: '',
        content: '',
        visibility: 'private' as 'public' | 'private',
    });

    useEffect(() => {
        if (courseId) {
            fetchNotes();
        }
    }, [courseId]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await noteAPI.getNotes(courseId);
            setNotes(response.data);
        } catch (err: any) {
            setError('获取笔记列表失败: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const noteData = {
                title: noteForm.title,
                content: noteForm.content,
                visibility: noteForm.visibility,
            };

            await noteAPI.createNote(courseId, noteData);
            setShowNoteForm(false);
            setNoteForm({ title: '', content: '', visibility: 'private' });
            fetchNotes();
        } catch (err: any) {
            setError('创建笔记失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingNote) return;

        try {
            const noteData = {
                title: noteForm.title,
                content: noteForm.content,
                visibility: noteForm.visibility,
            };

            await noteAPI.updateNote(courseId, editingNote.id, noteData);
            setEditingNote(null);
            setShowNoteForm(false);
            setNoteForm({ title: '', content: '', visibility: 'private' });
            fetchNotes();
        } catch (err: any) {
            setError('更新笔记失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (window.confirm('确定要删除这条笔记吗？')) {
            try {
                await noteAPI.deleteNote(courseId, noteId);
                if (selectedNote?.id === noteId) {
                    setSelectedNote(null);
                }
                fetchNotes();
            } catch (err: any) {
                setError('删除笔记失败: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleEditClick = (note: Note) => {
        setEditingNote(note);
        setNoteForm({
            title: note.title,
            content: note.content,
            visibility: note.visibility,
        });
        setShowNoteForm(true);
    };

    const handleViewNote = (note: Note) => {
        setSelectedNote(note);
    };

    const canEditNote = (note: Note) => {
        return isAdmin || note.authorId === user?.id;
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

    if (loading) return <div className="loading">加载笔记列表中...</div>;

    return (
        <div className="notes-view">
            <div className="page-header">
                <h1>课程笔记</h1>
                <div className="header-actions">
                    <Link to={`/courses/${courseId}`} className="btn btn-outline">
                        返回课程
                    </Link>
                    <button
                        onClick={() => {
                            setEditingNote(null);
                            setNoteForm({ title: '', content: '', visibility: 'private' });
                            setShowNoteForm(true);
                        }}
                        className="btn btn-primary"
                    >
                        创建笔记
                    </button>
                </div>
            </div>

            {error && <div className="error">{error}</div>}

            {/* 笔记创建/编辑表单 */}
            {showNoteForm && (
                <div className="modal-overlay">
                    <div className="modal modal-large">
                        <h3>{editingNote ? '编辑笔记' : '创建新笔记'}</h3>
                        <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote}>
                            <div className="form-group">
                                <label>标题:</label>
                                <input
                                    type="text"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    required
                                    placeholder="输入笔记标题"
                                />
                            </div>
                            <div className="form-group">
                                <label>内容:</label>
                                <textarea
                                    value={noteForm.content}
                                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                    rows={12}
                                    required
                                    placeholder="输入笔记内容，支持 Markdown 格式"
                                />
                            </div>
                            <div className="form-group">
                                <label>可见性:</label>
                                <select
                                    value={noteForm.visibility}
                                    onChange={(e) => setNoteForm({ ...noteForm, visibility: e.target.value as 'public' | 'private' })}
                                    aria-label="笔记可见性"
                                >
                                    <option value="private">私有（仅自己可见）</option>
                                    <option value="public">公开（所有人可见）</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    {editingNote ? '保存' : '创建'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNoteForm(false);
                                        setEditingNote(null);
                                        setNoteForm({ title: '', content: '', visibility: 'private' });
                                    }}
                                    className="btn btn-outline"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 笔记详情模态框 */}
            {selectedNote && (
                <div className="modal-overlay" onClick={() => setSelectedNote(null)}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="note-detail-header">
                            <div>
                                <h2>{selectedNote.title}</h2>
                                <div className="note-meta">
                                    <span className={`visibility-badge ${selectedNote.visibility}`}>
                                        {selectedNote.visibility === 'public' ? '公开' : '私有'}
                                    </span>
                                    <span>创建于: {formatDate(selectedNote.createdAt)}</span>
                                    {selectedNote.updatedAt && (
                                        <span>更新于: {formatDate(selectedNote.updatedAt)}</span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedNote(null)} className="btn btn-outline">
                                关闭
                            </button>
                        </div>
                        <div className="note-content">
                            <pre>{selectedNote.content}</pre>
                        </div>
                        {canEditNote(selectedNote) && (
                            <div className="note-actions">
                                <button
                                    onClick={() => {
                                        handleEditClick(selectedNote);
                                        setSelectedNote(null);
                                    }}
                                    className="btn btn-primary"
                                >
                                    编辑
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteNote(selectedNote.id);
                                        setSelectedNote(null);
                                    }}
                                    className="btn btn-danger"
                                >
                                    删除
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="notes-container">
                {notes.length === 0 ? (
                    <div className="empty-state">
                        <p>暂无笔记</p>
                        <p>点击"创建笔记"按钮开始记录你的学习心得</p>
                    </div>
                ) : (
                    <div className="notes-grid">
                        {notes.map((note) => (
                            <div key={note.id} className="note-card" onClick={() => handleViewNote(note)}>
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
                                    {canEditNote(note) && (
                                        <div className="note-card-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleEditClick(note)}
                                                className="btn btn-small btn-primary"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="btn btn-small btn-danger"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteList;