// CourseController.ets
import http from '@ohos.net.http';
import {
  Course, CourseDetail, CreateCourseRequest, UpdateCourseRequest,
  CourseListResponse, CourseDetailResponse, CourseOperationResponse,
  ErrorResponse, BaseApiResponse,ErrorApiResponse
} from '../type/CourseTypes';
import { ApiConfig } from '../config/ApiConfig';

// 定义HTTP头部接口
interface HttpHeaders {
  'Content-Type': string;
  Authorization?: string;
}

export class CourseController {
  private baseUrl: string = ApiConfig.BASE_URL;
  private token: string =  AppStorage.get<string>('userToken') || '';

  constructor(token: string) {
    this.token = token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  // 修复：使用明确的接口类型替代Object
  private getAuthHeaders(): HttpHeaders {
    const headers: HttpHeaders = {
      'Content-Type': 'application/json'
    };

    if (this.token && this.token.trim().length > 0) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('设置Authorization头部，token长度:', this.token.length);
    } else {
      console.warn('Token为空或无效，未设置Authorization头部');
    }

    return headers;
  }

  /**
   * 获取课程列表
   */
  async listCourses(filter?: string): Promise<CourseListResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      let url: string = `${this.baseUrl}/api/courses`;

      if (filter && filter.trim().length > 0) {
        url += `?filter=${encodeURIComponent(filter.trim())}`;
      }

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: ApiConfig.TIMEOUT,
        connectTimeout: ApiConfig.TIMEOUT
      };

      return new Promise<CourseListResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取课程列表请求失败:', err);
            const errorResponse: CourseListResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleListResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('获取课程列表异常:', error);
      const errorResponse: CourseListResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理课程列表响应 - 使用统一的错误处理
   */
  private handleListResponse(data: http.HttpResponse, resolve: (result: CourseListResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const courses: Course[] = JSON.parse(resultString) as Course[];
        const successResponse: CourseListResponse = {
          success: true,
          data: courses,
          total: courses.length
        };
        resolve(successResponse);
      } else {
        // 使用统一的错误处理方法，但返回具体类型
        const errorResponse: CourseListResponse = this.handleErrorResponseGeneric<CourseListResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析课程列表响应失败:', parseError);
      const errorResponse: CourseListResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 获取课程详情
   */
  async getCourseDetail(courseId: number): Promise<CourseDetailResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: ApiConfig.TIMEOUT,
        connectTimeout: ApiConfig.TIMEOUT
      };

      return new Promise<CourseDetailResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取课程详情请求失败:', err);
            const errorResponse: CourseDetailResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleDetailResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('获取课程详情异常:', error);
      const errorResponse: CourseDetailResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理课程详情响应
   */
  private handleDetailResponse(data: http.HttpResponse, resolve: (result: CourseDetailResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const courseDetail: CourseDetail = JSON.parse(resultString) as CourseDetail;
        const successResponse: CourseDetailResponse = {
          success: true,
          data: courseDetail
        };
        resolve(successResponse);
      } else {
        const errorResponse: CourseDetailResponse = this.handleErrorResponseGeneric<CourseDetailResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析课程详情响应失败:', parseError);
      const errorResponse: CourseDetailResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 创建课程
   */
  async createCourse(courseData: CreateCourseRequest): Promise<CourseOperationResponse> {
    try {
      const validationResult: string | null = this.validateCourseData(courseData);
      if (validationResult) {
        const errorResponse: CourseOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000,
        extraData: JSON.stringify(courseData)
      };

      return new Promise<CourseOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('创建课程请求失败:', err);
            const errorResponse: CourseOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleCreateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('创建课程异常:', error);
      const errorResponse: CourseOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理创建课程响应
   */
  private handleCreateResponse(data: http.HttpResponse, resolve: (result: CourseOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 201) {
        const course: Course = JSON.parse(resultString) as Course;
        const successResponse: CourseOperationResponse = {
          success: true,
          data: course,
          message: '课程创建成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: CourseOperationResponse = this.handleErrorResponseGeneric<CourseOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析创建课程响应失败:', parseError);
      const errorResponse: CourseOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 更新课程
   */
  async updateCourse(courseId: number, courseData: UpdateCourseRequest): Promise<CourseOperationResponse> {
    try {
      const validationResult: string | null = this.validateCourseData(courseData);
      if (validationResult) {
        const errorResponse: CourseOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.PUT,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000,
        extraData: JSON.stringify(courseData)
      };

      return new Promise<CourseOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('更新课程请求失败:', err);
            const errorResponse: CourseOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleUpdateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('更新课程异常:', error);
      const errorResponse: CourseOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理更新课程响应
   */
  private handleUpdateResponse(data: http.HttpResponse, resolve: (result: CourseOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const course: Course = JSON.parse(resultString) as Course;
        const successResponse: CourseOperationResponse = {
          success: true,
          data: course,
          message: '课程更新成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: CourseOperationResponse = this.handleErrorResponseGeneric<CourseOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析更新课程响应失败:', parseError);
      const errorResponse: CourseOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 删除课程
   */
  async deleteCourse(courseId: number): Promise<CourseOperationResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.DELETE,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000
      };

      return new Promise<CourseOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('删除课程请求失败:', err);
            const errorResponse: CourseOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleDeleteResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('删除课程异常:', error);
      const errorResponse: CourseOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理删除课程响应
   */
  private handleDeleteResponse(data: http.HttpResponse, resolve: (result: CourseOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;

      if (responseCode === 204) {
        const successResponse: CourseOperationResponse = {
          success: true,
          message: '课程删除成功'
        };
        resolve(successResponse);
      } else {
        const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
        const errorResponse: CourseOperationResponse = this.handleErrorResponseGeneric<CourseOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析删除课程响应失败:', parseError);
      const errorResponse: CourseOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 统一的泛型错误处理方法 - 解决类型兼容性问题
   */
  private handleErrorResponseGeneric<T extends BaseApiResponse>(
    responseCode: number,
    resultString: string
  ): T {
    try {
      const errorData: ErrorResponse = JSON.parse(resultString) as ErrorResponse;

      let errorMessage: string = errorData.message || `请求失败 (${responseCode})`;

      switch (responseCode) {
        case 401:
          errorMessage = '认证失败，请重新登录';
          break;
        case 403:
          errorMessage = '权限不足，无法执行此操作';
          break;
        case 404:
          errorMessage = '课程不存在';
          break;
        case 409:
          errorMessage = '课程标题已存在';
          break;
        case 500:
          errorMessage = '服务器内部错误，请稍后重试';
          break;
      }

      // 创建明确类型的错误响应对象
      const errorResponse: ErrorApiResponse = {
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString()
      };

      return errorResponse as T;

    } catch (parseError) {
      const parseErrorResponse: ErrorApiResponse = {
        success: false,
        message: `请求失败: ${responseCode}`,
        timestamp: new Date().toISOString()
      };

      return parseErrorResponse as T;
    }
  }

  /**
   * 验证课程数据
   */
  private validateCourseData(courseData: CreateCourseRequest): string | null {
    if (!courseData.title || courseData.title.trim().length === 0) {
      return '课程标题不能为空';
    }

    if (courseData.title.trim().length < 2) {
      return '课程标题至少2个字符';
    }

    if (!courseData.level) {
      return '请选择课程级别';
    }

    return null;
  }
}