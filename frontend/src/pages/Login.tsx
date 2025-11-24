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
        // 用户开始输入时清除错误信息
        if (error) setError('');
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
            // 清除可能存在的错误token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // 优先显示后端返回的详细错误信息
            const errorMessage = err.response?.data?.message 
                || err.response?.data?.error 
                || err.message 
                || '登录失败，请检查用户名和密码';
            setError(errorMessage);
            console.error('登录错误:', err);
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
