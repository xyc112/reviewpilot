import axios from "axios";

// 移除硬编码的 baseURL，使用相对路径让Vite代理工作
const api = axios.create();

// 请求拦截器，自动添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 处理认证错误
    const axiosError = error as { response?: { status?: number } };
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      // 清除本地存储
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 只在非登录/注册页面时跳转
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

export default api;
