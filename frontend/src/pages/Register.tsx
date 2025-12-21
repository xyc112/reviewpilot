import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, Shield, ArrowRight } from 'lucide-react';
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
        if (error) setError('');
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            const errorMessage = err.response?.data?.message 
                || err.response?.data?.error 
                || err.message 
                || '注册失败，请稍后重试';
            setError(errorMessage);
            console.error('注册错误:', err);
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

                    <div className="form-group">
                        <label className="form-label">角色</label>
                        <div className="relative">
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-input pl-10 appearance-none"
                            >
                                <option value="USER">普通用户</option>
                                <option value="ADMIN">管理员</option>
                            </select>
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn flex justify-center items-center gap-2"
                    >
                        {loading ? '注册中...' : (
                            <>
                                注册
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    已有账号？
                    <Link to="/login" className="auth-link">立即登录</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
