import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditCourse: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        level: 'BEGINNER'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        if (id) {
            fetchCourse(Number(id));
        }
    }, [id]);

    const fetchCourse = async (courseId: number) => {
        try {
            const response = await courseAPI.getCourse(courseId);
            const courseData = response.data;
            setCourse(courseData);

            setFormData({
                title: courseData.title,
                description: courseData.description || '',
                tags: courseData.tags.join(', '),
                level: courseData.level
            });
        } catch (err: any) {
            setError('获取课程详情失败');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;

        setSaving(true);
        setError('');

        try {
            const courseData = {
                title: formData.title,
                description: formData.description,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                level: formData.level
            };

            await courseAPI.updateCourse(course.id, courseData);
            navigate(`/courses/${course.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || '更新课程失败');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container">
                <div className="error-message">课程不存在</div>
            </div>
        );
    }

    const canEdit = isAdmin || user?.id === course.authorId;

    if (!canEdit) {
        return (
            <div className="container">
                <div className="error-message">无权限编辑此课程</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="content-section">
                <div className="header-content">
                    <h1>编辑课程</h1>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">课程标题 *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">课程描述</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">标签 (用逗号分隔)</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="level">难度等级</label>
                        <select
                            id="level"
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="BEGINNER">初级</option>
                            <option value="INTERMEDIATE">中级</option>
                            <option value="ADVANCED">高级</option>
                        </select>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-outline"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? '保存中...' : '保存更改'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCourse;