// LoginController.ets
import http from '@ohos.net.http';
import { ApiConfig } from '../config/ApiConfig';

// ==================== 类型定义区域 ====================

// HTTP 请求头类型
export interface HttpHeader {
  'Content-Type': string;
  'Authorization'?: string
}

// HTTP 请求选项类型
export interface HttpRequestOptions {
  method: http.RequestMethod;
  header: HttpHeader;
  extraData: string;
}

// HTTP 响应数据类型
export interface HttpResponseData {
  responseCode: number;
  result: string | Object;
}

// 登录请求数据类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求数据类型
export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
}

// 登录成功响应数据类型
export interface LoginResponseData {
  token: string;
  username: string;
  role: string;
}

// 错误响应数据类型
export interface ErrorResponseData {
  status: number;
  error: string;
  timestamp: string;
}

// 登录结果数据类型
export interface LoginResultData {
  success: boolean;
  message?: string;
  data?: LoginResponseData;
}

// ==================== 控制器类 ====================

export class LoginController {
  private baseUrl: string = ApiConfig.BASE_URL;

  /**
   * 用户登录方法
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果
   */
  async login(username: string, password: string): Promise<LoginResultData> {
    try {
      // 前端基础验证
      const validationResult: LoginResultData = this.validateLoginInput(username, password);
      if (!validationResult.success) {
        return validationResult;
      }

      // 构建请求数据
      const loginRequest: LoginRequest = {
        username: username,
        password: password
      };

      // 发送HTTP POST请求到后端API
      const response: LoginResultData = await this.sendLoginRequest(loginRequest);
      return response;

    } catch (error) {
      console.error('登录请求异常:', error);
      return {
        success: false,
        message: '网络请求异常，请检查网络连接'
      };
    }
  }

  /**
   * 验证登录输入
   * @param username 用户名
   * @param password 密码
   * @returns 验证结果
   */
  private validateLoginInput(username: string, password: string): LoginResultData {
    if (!username || !password) {
      return {
        success: false,
        message: '用户名和密码不能为空'
      };
    }

    if (username.length < 3) {
      return {
        success: false,
        message: '用户名至少3个字符'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: '密码至少6个字符'
      };
    }

    return { success: true };
  }

  /**
   * 发送登录请求到后端
   * @param loginData 登录数据
   * @returns 登录结果
   */
  private async sendLoginRequest(loginData: LoginRequest): Promise<LoginResultData> {
    return new Promise<LoginResultData>((resolve) => {
      let httpRequest = http.createHttp();

      // 创建请求头对象
      const headers: HttpHeader = {
        'Content-Type': 'application/json'
      };

      // 创建请求选项对象
      const requestOptions: HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: headers,
        extraData: JSON.stringify(loginData)
      };

      httpRequest.request(
        `${this.baseUrl}/api/auth/login`,
        requestOptions,
        (err: Error, data: HttpResponseData) => {
          if (err) {
            console.error('请求失败:', err);
            const errorResult: LoginResultData = {
              success: false,
              message: '网络请求失败，请稍后重试'
            };
            resolve(errorResult);
            return;
          }

          // 解析响应
          if (data && data.responseCode === 200) {
            this.handleLoginSuccess(data, resolve);
          } else {
            this.handleLoginError(data, resolve);
          }

          httpRequest.destroy();
        }
      );
    });
  }

  /**
   * 处理登录成功响应
   * @param data HTTP响应数据
   * @param resolve Promise解析函数
   */
  private handleLoginSuccess(data: HttpResponseData, resolve: (result: LoginResultData) => void): void {
    try {
      const responseString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
      const responseData: LoginResponseData = JSON.parse(responseString) as LoginResponseData;

      // 登录成功
      const result: LoginResultData = {
        success: true,
        message: '登录成功',
        data: {
          token: responseData.token,
          username: responseData.username,
          role: responseData.role
        }
      };

      // 保存token到本地存储
      this.saveToken(responseData.token);
      resolve(result);

    } catch (parseError) {
      console.error('响应数据解析失败:', parseError);
      const errorResult: LoginResultData = {
        success: false,
        message: '服务器响应格式错误'
      };
      resolve(errorResult);
    }
  }

  /**
   * 处理登录错误响应
   * @param data HTTP响应数据
   * @param resolve Promise解析函数
   */
  private handleLoginError(data: HttpResponseData, resolve: (result: LoginResultData) => void): void {
    try {
      const responseString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (data.responseCode === 401) {
        const errorData: ErrorResponseData = JSON.parse(responseString) as ErrorResponseData;
        const errorResult: LoginResultData = {
          success: false,
          message: errorData.error || '用户名或密码错误'
        };
        resolve(errorResult);
      } else if (data.responseCode === 400) {
        const errorResult: LoginResultData = {
          success: false,
          message: '请求参数错误'
        };
        resolve(errorResult);
      } else if (data.responseCode >= 500) {
        const errorResult: LoginResultData = {
          success: false,
          message: '服务器内部错误，请稍后重试'
        };
        resolve(errorResult);
      } else {
        const errorData: ErrorResponseData = JSON.parse(responseString) as ErrorResponseData;
        const errorResult: LoginResultData = {
          success: false,
          message: errorData.error || `登录失败 (${data.responseCode})`
        };
        resolve(errorResult);
      }
    } catch (error) {
      const errorResult: LoginResultData = {
        success: false,
        message: `网络错误: ${data.responseCode}`
      };
      resolve(errorResult);
    }
  }

  /**
   * 保存token到本地存储
   * @param token JWT令牌
   */
  private saveToken(token: string): void {
    // 使用Preferences保存token
    // 示例代码，实际使用时需要导入@ohos.data.preferences
    console.log('保存token:', token);
    // 实际代码示例：
    // const preferences = await dataPreferences.getPreferences(this.context, 'user_data');
    // await preferences.put('token', token);
    // await preferences.flush();
  }

  /**
   * 用户注册方法
   * @param username 用户名
   * @param password 密码
   * @param role 用户角色，默认为USER
   * @returns 注册结果
   */
  async register(username: string, password: string, role: string = 'USER'): Promise<LoginResultData> {
    try {
      // 前端验证
      const validationResult: LoginResultData = this.validateRegisterInput(username, password, role);
      if (!validationResult.success) {
        return validationResult;
      }

      // 构建注册请求数据
      const registerData: RegisterRequest = {
        username: username,
        password: password,
        role: role
      };

      // 发送注册请求
      return await this.sendRegisterRequest(registerData);

    } catch (error) {
      console.error('注册请求异常:', error);
      return {
        success: false,
        message: '网络请求异常，请检查网络连接'
      };
    }
  }

  /**
   * 验证注册输入
   * @param username 用户名
   * @param password 密码
   * @param role 用户角色
   * @returns 验证结果
   */
  private validateRegisterInput(username: string, password: string, role: string): LoginResultData {
    if (!username || !password) {
      return {
        success: false,
        message: '用户名和密码不能为空'
      };
    }

    if (username.length < 3) {
      return {
        success: false,
        message: '用户名至少3个字符'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: '密码至少6个字符'
      };
    }

    if (role !== 'USER' && role !== 'ADMIN') {
      return {
        success: false,
        message: '角色类型只能是USER或ADMIN'
      };
    }

    return { success: true };
  }

  /**
   * 发送注册请求
   * @param registerData 注册数据
   * @returns 注册结果
   */
  private async sendRegisterRequest(registerData: RegisterRequest): Promise<LoginResultData> {
    return new Promise<LoginResultData>((resolve) => {
      let httpRequest = http.createHttp();

      // 创建请求头对象
      const headers: HttpHeader = {
        'Content-Type': 'application/json'
      };

      // 创建请求选项对象
      const requestOptions: HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: headers,
        extraData: JSON.stringify(registerData)
      };

      httpRequest.request(
        `${this.baseUrl}/api/auth/register`,
        requestOptions,
        (err: Error, data: HttpResponseData) => {
          if (err) {
            console.error('注册请求失败:', err);
            const errorResult: LoginResultData = {
              success: false,
              message: '网络请求失败，请稍后重试'
            };
            resolve(errorResult);
            return;
          }

          if (data && data.responseCode === 200) {
            this.handleRegisterSuccess(data, resolve);
          } else {
            this.handleRegisterError(data, resolve);
          }

          httpRequest.destroy();
        }
      );
    });
  }

  /**
   * 处理注册成功响应
   * @param data HTTP响应数据
   * @param resolve Promise解析函数
   */
  private handleRegisterSuccess(data: HttpResponseData, resolve: (result: LoginResultData) => void): void {
    try {
      const responseString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
      const responseData: LoginResponseData = JSON.parse(responseString) as LoginResponseData;

      const result: LoginResultData = {
        success: true,
        message: '注册成功',
        data: {
          token: responseData.token,
          username: responseData.username,
          role: responseData.role
        }
      };

      // 保存token
      this.saveToken(responseData.token);
      resolve(result);

    } catch (parseError) {
      const errorResult: LoginResultData = {
        success: false,
        message: '服务器响应格式错误'
      };
      resolve(errorResult);
    }
  }

  /**
   * 处理注册错误响应
   * @param data HTTP响应数据
   * @param resolve Promise解析函数
   */
  private handleRegisterError(data: HttpResponseData, resolve: (result: LoginResultData) => void): void {
    try {
      const responseString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (data.responseCode === 409) {
        const errorData: ErrorResponseData = JSON.parse(responseString) as ErrorResponseData;
        const errorResult: LoginResultData = {
          success: false,
          message: errorData.error || '用户名已存在'
        };
        resolve(errorResult);
      } else {
        const errorData: ErrorResponseData = JSON.parse(responseString) as ErrorResponseData;
        const errorResult: LoginResultData = {
          success: false,
          message: errorData.error || `注册失败 (${data.responseCode})`
        };
        resolve(errorResult);
      }
    } catch (error) {
      const errorResult: LoginResultData = {
        success: false,
        message: `网络错误: ${data.responseCode}`
      };
      resolve(errorResult);
    }
  }

  /**
   * 验证token是否有效（供其他模块使用）
   * @param token JWT令牌
   * @returns 验证结果
   */
  validateToken(token: string): boolean {
    // 这里可以实现token验证逻辑
    // 实际开发中可能需要解析JWT或发送验证请求到后端
    if (!token || token.length === 0) {
      return false;
    }

    // 简单验证：检查token是否包含必要的部分
    return token.includes('.') && token.length > 10;
  }

  /**
   * 清除本地存储的token（退出登录）
   */
  clearToken(): void {
    // 实际代码示例：
    // const preferences = await dataPreferences.getPreferences(this.context, 'user_data');
    // await preferences.delete('token');
    // await preferences.flush();
    console.log('清除token');
  }

  /**
   * 设置认证头（用于后续需要认证的请求）
   * @param token JWT令牌
   * @returns 认证头对象
   */
  getAuthHeader(token: string): HttpHeader {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
}