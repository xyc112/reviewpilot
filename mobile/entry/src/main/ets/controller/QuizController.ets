// QuizController.ets
import http from '@ohos.net.http';
import { ApiConfig } from '../config/ApiConfig';
import {
  Quiz, QuizAttempt, CreateQuizRequest, UpdateQuizRequest, SubmitAttemptRequest,
  QuizListResponse, QuizDetailResponse, QuizOperationResponse, AttemptResponse, AttemptListResponse,
  AttemptResult, ErrorResponse, BaseApiResponse, ErrorApiResponse, BackendQuizRequest, BackendQuestion
} from '../type/QuizTypes';



// 定义HTTP头部接口
interface HttpHeaders {
  'Content-Type': string;
  Authorization?: string;
}

export class QuizController {
  private baseUrl: string = ApiConfig.BASE_URL;
  private token: string = AppStorage.get<string>('userToken') || '';

  constructor(token: string) {
    this.token = token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  // 获取认证头部
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
   * 获取课程测验列表
   */
  async listQuizzes(courseId: number): Promise<QuizListResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/quizzes`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000
      };

      return new Promise<QuizListResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取测验列表请求失败:', err);
            const errorResponse: QuizListResponse = {
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
      console.error('获取测验列表异常:', error);
      const errorResponse: QuizListResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理测验列表响应
   */
  private handleListResponse(data: http.HttpResponse, resolve: (result: QuizListResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const quizzes: Quiz[] = JSON.parse(resultString) as Quiz[];
        const successResponse: QuizListResponse = {
          success: true,
          data: quizzes,
          total: quizzes.length
        };
        resolve(successResponse);
      } else {
        const errorResponse: QuizListResponse = this.handleErrorResponseGeneric<QuizListResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析测验列表响应失败:', parseError);
      const errorResponse: QuizListResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 获取测验详情
   */
  async getQuiz(courseId: number, quizId: string): Promise<QuizDetailResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/quizzes/${quizId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000
      };

      return new Promise<QuizDetailResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取测验详情请求失败:', err);
            const errorResponse: QuizDetailResponse = {
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
      console.error('获取测验详情异常:', error);
      const errorResponse: QuizDetailResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理测验详情响应
   */
  private handleDetailResponse(data: http.HttpResponse, resolve: (result: QuizDetailResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const quiz: Quiz = JSON.parse(resultString) as Quiz;
        const successResponse: QuizDetailResponse = {
          success: true,
          data: quiz
        };
        resolve(successResponse);
      } else {
        const errorResponse: QuizDetailResponse = this.handleErrorResponseGeneric<QuizDetailResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析测验详情响应失败:', parseError);
      const errorResponse: QuizDetailResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 创建测验
   */
  async createQuiz(courseId: number, quizData: BackendQuizRequest): Promise<QuizOperationResponse> {
    try {
      const validationResult: string | null = this.validateQuizData(quizData);
      if (validationResult) {
        const errorResponse: QuizOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/quizzes`;

      const requestData = JSON.stringify(quizData);
      console.log('请求URL:', url);
      console.log('courseId类型:', typeof courseId, '值:', courseId);
      console.log('请求头:', JSON.stringify(this.getAuthHeaders()));
      console.log('请求数据:', requestData);
      
      // 验证请求数据的完整性
      console.log('=== 请求数据验证 ===');
      console.log('quizData.title:', quizData.title);
      console.log('quizData.questions.length:', quizData.questions?.length);
      
      if (quizData.questions && quizData.questions.length > 0) {
        quizData.questions.forEach((q, index) => {
          console.log(`问题${index + 1}:`, {
            id: q.id,
            type: q.type,
            question: q.question,
            optionsCount: q.options?.length,
            answer: q.answer
          });
          
          if (q.options) {
            q.options.forEach((opt, optIndex) => {
              console.log(`  选项${optIndex}: ${opt}`);
            });
          }
        });
      }
      console.log('==================');

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000,
        extraData: requestData
      };

      return new Promise<QuizOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('创建测验请求失败:', err);
            const errorResponse: QuizOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          console.log('响应状态码:', data.responseCode);
          console.log('响应数据:', typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
          
          this.handleCreateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('创建测验异常:', error);
      const errorResponse: QuizOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理创建测验响应
   */
  private handleCreateResponse(data: http.HttpResponse, resolve: (result: QuizOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 201) {
        const quiz: Quiz = JSON.parse(resultString) as Quiz;
        const successResponse: QuizOperationResponse = {
          success: true,
          data: quiz,
          message: '测验创建成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: QuizOperationResponse = this.handleErrorResponseGeneric<QuizOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析创建测验响应失败:', parseError);
      const errorResponse: QuizOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 更新测验
   */
  async updateQuiz(courseId: number, quizId: string, quizData: BackendQuizRequest): Promise<QuizOperationResponse> {
    try {
      const validationResult: string | null = this.validateQuizData(quizData);
      if (validationResult) {
        const errorResponse: QuizOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/quizzes/${quizId}`;

      const requestData = JSON.stringify(quizData);
      console.log('=== 更新测验请求调试 ===');
      console.log('请求URL:', url);
      console.log('courseId类型:', typeof courseId, '值:', courseId);
      console.log('quizId类型:', typeof quizId, '值:', quizId);
      console.log('请求头:', JSON.stringify(this.getAuthHeaders()));
      console.log('请求数据:', requestData);
      console.log('========================');

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.PUT,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000,
        extraData: requestData
      };

      return new Promise<QuizOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('更新测验请求失败:', err);
            const errorResponse: QuizOperationResponse = {
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
      console.error('更新测验异常:', error);
      const errorResponse: QuizOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理更新测验响应
   */
  private handleUpdateResponse(data: http.HttpResponse, resolve: (result: QuizOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      console.log('=== 更新测验响应调试 ===');
      console.log('响应状态码:', responseCode);
      console.log('响应数据:', resultString);
      console.log('========================');

      if (responseCode === 200) {
        const quiz: Quiz = JSON.parse(resultString) as Quiz;
        const successResponse: QuizOperationResponse = {
          success: true,
          data: quiz,
          message: '测验更新成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: QuizOperationResponse = this.handleErrorResponseGeneric<QuizOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析更新测验响应失败:', parseError);
      const errorResponse: QuizOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 删除测验
   */
  async deleteQuiz(courseId: number, quizId: string): Promise<QuizOperationResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/quizzes/${quizId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.DELETE,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000
      };

      return new Promise<QuizOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('删除测验请求失败:', err);
            const errorResponse: QuizOperationResponse = {
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
      console.error('删除测验异常:', error);
      const errorResponse: QuizOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理删除测验响应
   */
  private handleDeleteResponse(data: http.HttpResponse, resolve: (result: QuizOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;

      if (responseCode === 204) {
        const successResponse: QuizOperationResponse = {
          success: true,
          message: '测验删除成功'
        };
        resolve(successResponse);
      } else {
        const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
        const errorResponse: QuizOperationResponse = this.handleErrorResponseGeneric<QuizOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析删除测验响应失败:', parseError);
      const errorResponse: QuizOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 提交测验尝试
   */
  async submitAttempt(courseId: number, quizId: string, attemptData: SubmitAttemptRequest): Promise<AttemptResponse> {
    try {
      const validationResult: string | null = this.validateAttemptData(attemptData);
      if (validationResult) {
        const errorResponse: AttemptResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/quizzes/${quizId}/attempts`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000,
        extraData: JSON.stringify(attemptData)
      };

      return new Promise<AttemptResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('提交测验尝试请求失败:', err);
            const errorResponse: AttemptResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleAttemptResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('提交测验尝试异常:', error);
      const errorResponse: AttemptResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理测验尝试响应
   */
  private handleAttemptResponse(data: http.HttpResponse, resolve: (result: AttemptResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        console.log('后端返回的原始数据:', resultString);
        const parsedData: AttemptResult = JSON.parse(resultString) as AttemptResult;
        console.log('解析后的数据:', JSON.stringify(parsedData as Object));
        
        // 确保answers字段存在，如果后端没有返回，则创建空数组
        if (!parsedData.answers) {
          console.log('后端没有返回answers字段，创建空数组');
          parsedData.answers = [];
        }
        
        const attemptResult = parsedData as AttemptResult;
        console.log('attemptResult.answers:', attemptResult.answers);
        
        const successResponse: AttemptResponse = {
          success: true,
          data: attemptResult,
          message: '测验提交成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: AttemptResponse = this.handleErrorResponseGeneric<AttemptResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析测验尝试响应失败:', parseError);
      const errorResponse: AttemptResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 统一的泛型错误处理方法
   */
  private handleErrorResponseGeneric<T extends BaseApiResponse>(
    responseCode: number,
    resultString: string
  ): T {
    try {
      const errorData: ErrorResponse = JSON.parse(resultString) as ErrorResponse;

      let errorMessage: string = errorData.message || `请求失败 (${responseCode})`;

      switch (responseCode) {
        case 400:
          // 对于400错误，尝试解析详细的错误信息
          if (errorData.error && errorData.message) {
            errorMessage = `请求参数错误: ${errorData.message}`;
          } else {
            errorMessage = '请求参数错误，请检查输入数据';
          }
          break;
        case 401:
          errorMessage = '认证失败，请重新登录';
          break;
        case 403:
          errorMessage = '权限不足，无法执行此操作';
          break;
        case 404:
          errorMessage = '测验不存在';
          break;
        case 409:
          errorMessage = '测验标题已存在';
          break;
        case 500:
          errorMessage = '服务器内部错误，请稍后重试';
          break;
      }

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
   * 验证测验数据
   */
  private validateQuizData(quizData: BackendQuizRequest): string | null {
    if (!quizData.title || quizData.title.trim().length === 0) {
      return '测验标题不能为空';
    }

    if (quizData.title.trim().length < 2) {
      return '测验标题至少2个字符';
    }

    if (!quizData.courseId || quizData.courseId <= 0) {
      return '课程ID不能为空';
    }

    if (!quizData.questions || quizData.questions.length === 0) {
      return '测验必须包含至少一个问题';
    }

    // 验证每个问题
    for (let i = 0; i < quizData.questions.length; i++) {
      const question: BackendQuestion = quizData.questions[i];
      
      if (!question.question || question.question.trim().length === 0) {
        return `第${i + 1}题的问题内容不能为空`;
      }

      if (!question.options || question.options.length < 2) {
        return `第${i + 1}题至少需要2个选项`;
      }

      // 验证选项内容
      for (let j = 0; j < question.options.length; j++) {
        const option: string = question.options[j];
        if (!option || option.trim().length === 0) {
          return `第${i + 1}题的第${j + 1}个选项内容不能为空`;
        }
      }

      // 验证是否有正确答案
      if (!question.answer || question.answer.length === 0) {
        return `第${i + 1}题必须至少有一个正确答案`;
      }

      // 验证答案索引是否在有效范围内
      for (const answerIndex of question.answer) {
        if (answerIndex < 0 || answerIndex >= question.options.length) {
          return `第${i + 1}题的正确答案索引超出范围`;
        }
      }
    }

    return null;
  }

  /**
   * 验证尝试数据
   */
  private validateAttemptData(attemptData: SubmitAttemptRequest): string | null {
    if (!attemptData.answers || attemptData.answers.length === 0) {
      return '必须提供答案';
    }

    for (const answer of attemptData.answers) {
      if (!answer.questionId) {
        return '问题ID不能为空';
      }
      if (!answer.answer) {
        return '答案不能为空';
      }
    }

    return null;
  }
}