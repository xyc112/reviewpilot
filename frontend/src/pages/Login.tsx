import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { validateUsername, validatePassword } from '../utils/validation';
import '../styles/Auth.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // 实时验证
        if (touched[name]) {
            if (name === 'username') {
                const error = validateUsername(value);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            } else if (name === 'password') {
                const error = validatePassword(value);
                setErrors(prev => ({ ...prev, [name]: error || '' }));
            }
        }
        
        if (error) setError('');
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // 验证字段
        if (name === 'username') {
            const error = validateUsername(value);
            setErrors(prev => ({ ...prev, [name]: error || '' }));
        } else if (name === 'password') {
            const error = validatePassword(value);
            setErrors(prev => ({ ...prev, [name]: error || '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 验证所有字段
        if (!formData.username || formData.username.trim().length === 0) {
            setErrors({ username: '用户名不能为空' });
            setTouched({ username: true, password: true });
            return;
        }
        
        if (!formData.password || formData.password.length === 0) {
            setErrors({ password: '密码不能为空' });
            setTouched({ username: true, password: true });
            return;
        }
        
        const usernameError = validateUsername(formData.username);
        const passwordError = validatePassword(formData.password);
        
        if (usernameError || passwordError) {
            setErrors({
                username: usernameError || '',
                password: passwordError || '',
            });
            setTouched({ username: true, password: true });
            return;
        }
        
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
        <div className="auth-page-full">
            <div className="auth-page-left">
                <div className="auth-welcome-content">
                    <div className="auth-welcome-icon">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2"/>
                            <path d="M30 50 L45 65 L70 35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1 className="auth-welcome-title">欢迎来到 ReviewPilot</h1>
                    <p className="auth-welcome-subtitle">
                        一体化复习平台，让学习更高效，让复习更系统
                    </p>
                    <div className="auth-welcome-features">
                        <div className="feature-item">
                            <div className="feature-icon">📚</div>
                            <div className="feature-text">
                                <strong>课程与知识图谱</strong>
                                <span>管理课程，可视化知识关联</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📝</div>
                            <div className="feature-text">
                                <strong>笔记与测验</strong>
                                <span>记录笔记，检验学习成果</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📅</div>
                            <div className="feature-text">
                                <strong>复习计划与社区</strong>
                                <span>制定计划，交流学习心得</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="auth-page-right">
                <div className="auth-form-container">
                    <h2 className="auth-title">登录</h2>
                    <p className="auth-subtitle">请登录继续访问学习辅助系统</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">用户名</label>
                            <div className="input-with-icon">
                                <div className="input-icon-wrapper">
                                    <User className="input-icon" size={18} />
                                    <div className="input-icon-divider"></div>
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${errors.username ? 'form-input-error' : ''}`}
                                    placeholder="请输入用户名"
                                    aria-invalid={!!errors.username}
                                    aria-describedby={errors.username ? 'username-error' : undefined}
                                />
                            </div>
                            {errors.username && (
                                <span id="username-error" className="form-error" role="alert">
                                    {errors.username}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">密码</label>
                            <div className="input-with-icon">
                                <div className="input-icon-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <div className="input-icon-divider"></div>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                                    placeholder="请输入密码"
                                    required
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="input-action-button"
                                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <span id="password-error" className="form-error" role="alert">
                                    {errors.password}
                                </span>
                            )}
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
        </div>
    );
};

export default Login;
