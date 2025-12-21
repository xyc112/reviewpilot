import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, ArrowRight } from 'lucide-react';
import '../styles/Auth.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
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
                        <label className="form-label">用户名</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input pl-10"
                                placeholder="请输入用户名"
                                required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">密码</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input pl-10"
                                placeholder="请输入密码"
                                required
                            />
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn flex justify-center items-center gap-2"
                    >
                        {loading ? '登录中...' : (
                            <>
                                登录
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    没有账号？
                    <Link to="/register" className="auth-link">立即注册</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
