// 认证工具函数

/**
 * 清除所有认证信息
 */
export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * 获取存储的 token
 */
export const getStoredToken = (): string | null => {
    return localStorage.getItem('token');
};

/**
 * 获取存储的用户信息
 */
export const getStoredUser = (): any | null => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
        return JSON.parse(userData);
    } catch (e) {
        console.error('解析用户数据失败:', e);
        clearAuthData();
        return null;
    }
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
    const token = getStoredToken();
    const user = getStoredUser();
    return !!(token && user);
};
