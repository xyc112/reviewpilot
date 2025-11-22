import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.register(formData);
            const user = response.data;
            login(user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || '注册失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>用户注册</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>用户名:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>密码:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>角色:</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="USER">普通用户</option>
                            <option value="ADMIN">管理员</option>
                        </select>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? '注册中...' : '注册'}
                    </button>
                </form>
                <p>
                    已有账号？ <Link to="/login">立即登录</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;