import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'USER'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.register(formData);
            login(response.data);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">创建账号</h2>
                <p className="auth-subtitle">欢迎加入学习辅助系统</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>用户名</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="input-box"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input-box"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>角色</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="input-box"
                        >
                            <option value="USER">普通用户</option>
                            <option value="ADMIN">管理员</option>
                        </select>
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn primary"
                    >
                        {loading ? '注册中...' : '注册'}
                    </button>
                </form>

                <p className="auth-footer">
                    已有账号？
                    <Link to="/login">立即登录</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
