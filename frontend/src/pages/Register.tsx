import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { validateUsername, validatePassword } from '../utils/validation';
import '../styles/Auth.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'USER'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        <div className="auth-page-full">
            <div className="auth-page-left">
                <div className="auth-welcome-content">
                    <div className="auth-welcome-icon">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2"/>
                            <path d="M50 20 L50 50 L35 65 L50 50 L65 65 L50 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                    </div>
                    <h1 className="auth-welcome-title">加入我们</h1>
                    <p className="auth-welcome-subtitle">
                        开启您的学习之旅<br/>
                        与知识同行，与成长相伴
                    </p>
                    <div className="auth-welcome-features">
                        <div className="feature-item">
                            <div className="feature-icon">🎓</div>
                            <div className="feature-text">
                                <strong>个性化学习路径</strong>
                                <span>根据您的需求定制学习计划</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <div className="feature-text">
                                <strong>学习进度追踪</strong>
                                <span>实时了解学习成果</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🤝</div>
                            <div className="feature-text">
                                <strong>社区互动交流</strong>
                                <span>与学习者共同进步</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="auth-page-right">
                <div className="auth-form-container">
                    <h2 className="auth-title">创建账号</h2>
                    <p className="auth-subtitle">欢迎加入学习辅助系统</p>

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
                                    placeholder="请输入用户名（3-20个字符，仅字母、数字、下划线）"
                                    required
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
                                    placeholder="请输入密码（至少6个字符）"
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

                        <div className="form-group">
                            <label className="form-label">角色</label>
                            <div className="input-with-icon">
                                <div className="input-icon-wrapper">
                                    <Shield className="input-icon" size={18} />
                                    <div className="input-icon-divider"></div>
                                </div>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="form-input appearance-none"
                                >
                                    <option value="USER">普通用户</option>
                                    <option value="ADMIN">管理员</option>
                                </select>
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
        </div>
    );
};

export default Register;
