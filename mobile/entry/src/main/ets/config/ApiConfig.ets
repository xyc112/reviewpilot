// API配置文件
export class ApiConfig {
  // 后端服务器地址 - 根据你的实际环境修改
  // 如果是本地开发，使用你的电脑IP地址
  // 如果是部署环境，使用对应的服务器地址
  static readonly BASE_URL: string = 'http://172.29.240.1:8080';
  
  // 备用配置（可以取消注释使用）
  // static readonly BASE_URL: string = 'http://localhost:8080';
  // static readonly BASE_URL: string = 'http://192.168.1.100:8080';
  
  // 请求超时时间（毫秒）
  static readonly TIMEOUT: number = 60000;
  
  // API端点 - 使用常量字符串
  static readonly LOGIN: string = '/api/auth/login';
  static readonly REGISTER: string = '/api/auth/register';
  static readonly COURSES: string = '/api/courses';
  static readonly QUIZZES: string = '/api/quizzes';
  static readonly NOTES: string = '/api/notes';
  static readonly GRAPHS: string = '/api/graphs';
}