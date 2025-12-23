import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Post, Comment, Course } from '../types';
import { postAPI, commentAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { Plus, MessageSquare, Edit, Trash2, Send, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import '../styles/Community.css';
import '../styles/Course.css';

const Community: React.FC = () => {
    const { courseId: courseIdParam } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { selectedCourse, currentStudyingCourse } = useCourse();
    const { success, error: showError } = useToast();
    
    // 优先使用URL参数，其次使用当前学习的课程，最后使用选中的课程
    const courseId = courseIdParam || currentStudyingCourse?.id?.toString() || selectedCourse?.id?.toString();
    const [course, setCourse] = useState<{ id: number; title: string } | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPost, setExpandedPost] = useState<number | null>(null);
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState<{ postId: number; parentId: number | null } | null>(null);
    
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [newComment, setNewComment] = useState('');
    const [editingPost, setEditingPost] = useState<number | null>(null);
    const [editPostData, setEditPostData] = useState({ title: '', content: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'post' | 'comment'; id: number; postId?: number } | null>(null);
    
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!courseId) {
            navigate('/courses');
            return;
        }
        fetchCourse();
        fetchPosts();
    }, [courseId, navigate, currentStudyingCourse, selectedCourse]);

    const fetchCourse = async () => {
        if (!courseId) return;
        try {
            const response = await courseAPI.getCourse(Number(courseId));
            setCourse({ id: response.data.id, title: response.data.title });
        } catch (err: any) {
            console.error('Failed to fetch course:', err);
            // 如果获取失败，使用selectedCourse作为后备
            if (selectedCourse && selectedCourse.id === Number(courseId)) {
                setCourse({ id: selectedCourse.id, title: selectedCourse.title });
            }
        }
    };

    const fetchPosts = async () => {
        if (!courseId) return;
        try {
            setLoading(true);
            const response = await postAPI.getPosts(Number(courseId));
            setPosts(response.data);
        } catch (err: any) {
            setError('获取帖子列表失败: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (postId: number) => {
        if (!courseId) return;
        try {
            setLoadingComments(prev => ({ ...prev, [postId]: true }));
            const response = await commentAPI.getComments(Number(courseId), postId);
            setComments(prev => ({ ...prev, [postId]: response.data }));
        } catch (err: any) {
            showError('获取评论失败: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleTogglePost = (postId: number) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
        } else {
            setExpandedPost(postId);
            if (!comments[postId]) {
                fetchComments(postId);
            }
        }
    };

    const handleCreatePost = async () => {
        if (!courseId || !newPost.title.trim() || !newPost.content.trim()) {
            showError('请填写标题和内容');
            return;
        }
        try {
            await postAPI.createPost(Number(courseId), {
                title: newPost.title,
                content: newPost.content,
            });
            success('帖子创建成功');
            setNewPost({ title: '', content: '' });
            setShowCreatePost(false);
            fetchPosts();
        } catch (err: any) {
            showError('创建帖子失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdatePost = async (postId: number) => {
        if (!courseId || !editPostData.title.trim() || !editPostData.content.trim()) {
            showError('请填写标题和内容');
            return;
        }
        try {
            await postAPI.updatePost(Number(courseId), postId, {
                title: editPostData.title,
                content: editPostData.content,
            });
            success('帖子更新成功');
            setEditingPost(null);
            setEditPostData({ title: '', content: '' });
            fetchPosts();
        } catch (err: any) {
            showError('更新帖子失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePost = async () => {
        if (!deleteConfirm || !courseId || deleteConfirm.type !== 'post') return;
        try {
            await postAPI.deletePost(Number(courseId), deleteConfirm.id);
            success('帖子删除成功');
            setDeleteConfirm(null);
            fetchPosts();
            if (expandedPost === deleteConfirm.id) {
                setExpandedPost(null);
            }
        } catch (err: any) {
            showError('删除帖子失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCreateComment = async (postId: number, parentId: number | null = null) => {
        if (!courseId || !newComment.trim()) {
            showError('请输入评论内容');
            return;
        }
        try {
            await commentAPI.createComment(Number(courseId), postId, {
                content: newComment,
                parentId: parentId,
            });
            success('评论发布成功');
            setNewComment('');
            setShowReplyForm(null);
            fetchComments(postId);
        } catch (err: any) {
            showError('发布评论失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteComment = async () => {
        if (!deleteConfirm || !courseId || deleteConfirm.type !== 'comment' || !deleteConfirm.postId) return;
        try {
            await commentAPI.deleteComment(Number(courseId), deleteConfirm.postId, deleteConfirm.id);
            success('评论删除成功');
            setDeleteConfirm(null);
            fetchComments(deleteConfirm.postId);
        } catch (err: any) {
            showError('删除评论失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const startEditPost = (post: Post) => {
        setEditingPost(post.id);
        setEditPostData({ title: post.title, content: post.content });
    };

    const cancelEditPost = () => {
        setEditingPost(null);
        setEditPostData({ title: '', content: '' });
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

    // 过滤帖子
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // 搜索过滤
            const matchesSearch = !searchQuery || 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.authorUsername && post.authorUsername.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [posts, searchQuery]);

    const renderComments = (postId: number, parentId: number | null = null, level: number = 0): React.ReactNode => {
        const postComments = comments[postId] || [];
        const filteredComments = postComments.filter(c => c.parentId === parentId);
        
        if (filteredComments.length === 0) return null;

        return (
            <div className={`comments-list ${level > 0 ? 'nested-comments' : ''}`} style={{ marginLeft: level > 0 ? '2rem' : '0' }}>
                {filteredComments.map(comment => (
                    <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                            <span className="comment-author">{comment.authorUsername || `用户 ${comment.authorId}`}</span>
                            <span className="comment-date">{formatDate(comment.createdAt)}</span>
                            {(isAdmin || user?.id === comment.authorId) && (
                                <button
                                    onClick={() => setDeleteConfirm({ type: 'comment', id: comment.id, postId })}
                                    className="btn-icon btn-icon-danger"
                                    title="删除评论"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <div className="comment-content">
                            <MarkdownRenderer content={comment.content} />
                        </div>
                        <div className="comment-actions">
                            <button
                                onClick={() => {
                                    setShowReplyForm({ postId, parentId: comment.id });
                                    setTimeout(() => commentInputRef.current?.focus(), 100);
                                }}
                                className="btn-link"
                            >
                                <MessageSquare size={14} />
                                回复
                            </button>
                        </div>
                        {showReplyForm?.postId === postId && showReplyForm?.parentId === comment.id && (
                            <div className="reply-form">
                                <textarea
                                    ref={commentInputRef}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="输入回复..."
                                    rows={3}
                                    className="form-textarea"
                                />
                                <div className="form-actions">
                                    <button
                                        onClick={() => handleCreateComment(postId, comment.id)}
                                        className="btn btn-primary btn-small"
                                    >
                                        <Send size={14} />
                                        发送
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowReplyForm(null);
                                            setNewComment('');
                                        }}
                                        className="btn btn-outline btn-small"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        )}
                        {renderComments(postId, comment.id, level + 1)}
                    </div>
                ))}
            </div>
        );
    };

    if (!courseId) {
        return (
            <div className="container">
                <div className="error-message">课程ID无效</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                title={deleteConfirm?.type === 'post' ? '删除帖子' : '删除评论'}
                message={`确定要删除这个${deleteConfirm?.type === 'post' ? '帖子' : '评论'}吗？此操作无法撤销。`}
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={() => {
                    if (deleteConfirm?.type === 'post') {
                        handleDeletePost();
                    } else {
                        handleDeleteComment();
                    }
                }}
                onCancel={() => setDeleteConfirm(null)}
            />

            <div className="community-page">
                {error && <div className="error-message mb-4">{error}</div>}

                {/* 搜索栏 */}
                <div className="search-filter-bar" style={{ marginBottom: '1.5rem' }}>
                    <div className="search-box">
                        <div className="input-icon-wrapper">
                            <Search size={20} className="input-icon" />
                            <div className="input-icon-divider"></div>
                        </div>
                        <input
                            type="text"
                            placeholder="搜索帖子标题、内容或作者..."
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

                    <button
                        onClick={() => setShowCreatePost(!showCreatePost)}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        {showCreatePost ? '取消发布' : '发布新帖'}
                    </button>
                </div>

                {showCreatePost && (
                    <div className="content-section" style={{ marginBottom: '2rem' }}>
                        <div className="note-edit-page">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCreatePost();
                                }}
                                className="note-edit-form"
                            >
                                <div className="form-group">
                                    <label>标题:</label>
                                    <input
                                        type="text"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        required
                                        placeholder="输入帖子标题"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>内容:</label>
                                    <textarea
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        rows={15}
                                        required
                                        placeholder="输入帖子内容，支持 Markdown 格式"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreatePost(false);
                                            setNewPost({ title: '', content: '' });
                                        }}
                                        className="btn btn-outline"
                                    >
                                        <X size={18} />
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        <Send size={18} />
                                        发布
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="posts-list">
                    {posts.length === 0 && !showCreatePost ? (
                        <div className="empty-state">
                            <MessageSquare size={48} className="text-stone-400 mb-4" />
                            <p className="text-lg font-semibold mb-2">还没有帖子</p>
                            <p className="text-stone-500 mb-4">成为第一个发布帖子的人吧！</p>
                        </div>
                    ) : filteredPosts.length === 0 && searchQuery ? (
                        <div className="empty-state">
                            <MessageSquare size={48} className="text-stone-400 mb-4" />
                            <p className="text-lg font-semibold mb-2">未找到匹配的帖子</p>
                            <p className="text-stone-500 mb-4">尝试调整搜索条件</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="btn btn-primary"
                            >
                                清除搜索
                            </button>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <div key={post.id} className="post-card card">
                                <div className="post-header">
                                    <div className="post-title-section">
                                        <h3 className="post-title">{post.title}</h3>
                                        <div className="post-meta">
                                            <span className="post-author">{post.authorUsername || `用户 ${post.authorId}`}</span>
                                            <span className="post-date">{formatDate(post.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="post-actions">
                                        {(isAdmin || user?.id === post.authorId) && (
                                            <>
                                                <button
                                                    onClick={() => startEditPost(post)}
                                                    className="btn-icon"
                                                    title="编辑"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: 'post', id: post.id })}
                                                    className="btn-icon btn-icon-danger"
                                                    title="删除"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleTogglePost(post.id)}
                                            className="btn-icon"
                                            title={expandedPost === post.id ? '收起' : '展开'}
                                        >
                                            {expandedPost === post.id ? (
                                                <ChevronUp size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {editingPost === post.id ? (
                                    <div className="post-edit-form">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                value={editPostData.title}
                                                onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <textarea
                                                value={editPostData.content}
                                                onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                                                rows={6}
                                                className="form-textarea"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button onClick={() => handleUpdatePost(post.id)} className="btn btn-primary btn-small">
                                                保存
                                            </button>
                                            <button onClick={cancelEditPost} className="btn btn-outline btn-small">
                                                取消
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="post-content">
                                        <MarkdownRenderer content={post.content} />
                                    </div>
                                )}

                                {expandedPost === post.id && (
                                    <div className="post-comments">
                                        <div className="comments-section-header">
                                            <h4 className="text-lg font-semibold">评论</h4>
                                            {loadingComments[post.id] && (
                                                <span className="text-sm text-stone-500">加载中...</span>
                                            )}
                                        </div>

                                        {!showReplyForm || showReplyForm.postId !== post.id || showReplyForm.parentId !== null ? (
                                            <div className="comment-form">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="输入评论..."
                                                    rows={3}
                                                    className="form-textarea"
                                                />
                                                <div className="form-actions">
                                                    <button
                                                        onClick={() => handleCreateComment(post.id, null)}
                                                        className="btn btn-primary btn-small"
                                                    >
                                                        <Send size={14} />
                                                        发布评论
                                                    </button>
                                                </div>
                                            </div>
                                        ) : null}

                                        {renderComments(post.id)}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Community;

