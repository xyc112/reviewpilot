import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);
            const user = response.data;
            login(user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">欢迎回来</h2>
                <p className="auth-subtitle">请登录继续访问学习辅助系统</p>

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

                    {error && <div className="error-box">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn primary"
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                <p className="auth-footer">
                    没有账号？
                    <Link to="/register">立即注册</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
