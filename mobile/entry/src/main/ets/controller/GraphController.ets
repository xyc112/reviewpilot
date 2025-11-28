// GraphController.ets
import http from '@ohos.net.http';
import { ApiConfig } from '../config/ApiConfig';
import {
  Node, Relation, CreateNodeRequest, UpdateNodeRequest,
  CreateRelationRequest, ApiCreateRelationRequest, UpdateRelationRequest, NodeDetailResponse,
  NodeListResponse, NodeDetailApiResponse, NodeOperationResponse,
  RelationListResponse, RelationOperationResponse,
  ErrorResponse, BaseApiResponse, ErrorApiResponse
} from '../type/GraphTypes';

// 定义HTTP头部接口
interface HttpHeaders {
  'Content-Type': string;
  Authorization?: string;
}

// 查询参数接口
interface QueryParams {
  from?: string;
  to?: string;
  type?: string;
}

export class GraphController {
  private baseUrl: string = ApiConfig.BASE_URL;
  private token: string = '';

  constructor(token?: string) {
    if (token) {
      this.token = token;
    }
  }

  setToken(token: string): void {
    this.token = token;
  }

  // 获取认证头部
  private getAuthHeaders(): HttpHeaders {
    const headers: HttpHeaders = {
      'Content-Type': 'application/json'
    };

    // 如果当前token为空，尝试从AppStorage获取
    if (!this.token || this.token.trim().length === 0) {
      try {
        this.token = AppStorage.get<string>('userToken') || '';
      } catch (error) {
        console.warn('无法从AppStorage获取token:', error);
      }
    }

    if (this.token && this.token.trim().length > 0) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('GraphController设置Authorization头部，token长度:', this.token.length);
    } else {
      console.warn('GraphController Token为空或无效，未设置Authorization头部');
    }

    return headers;
  }

  /**
   * 获取课程的所有节点
   */
  async listNodes(courseId: number): Promise<NodeListResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/nodes`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: 30000, // 30秒读取超时
        connectTimeout: 10000 // 10秒连接超时
      };

      return new Promise<NodeListResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取节点列表请求失败:', err);
            const errorResponse: NodeListResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleNodeListResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('获取节点列表异常:', error);
      const errorResponse: NodeListResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 获取特定节点详情
   */
  async getNode(courseId: number, nodeId: string): Promise<NodeDetailApiResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/nodes/${nodeId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: 30000, // 30秒读取超时
        connectTimeout: 10000 // 10秒连接超时
      };

      return new Promise<NodeDetailApiResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取节点详情请求失败:', err);
            const errorResponse: NodeDetailApiResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleNodeDetailResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('获取节点详情异常:', error);
      const errorResponse: NodeDetailApiResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 创建新节点
   */
  async createNode(courseId: number, nodeData: CreateNodeRequest): Promise<NodeOperationResponse> {
    try {
      const validationResult: string | null = this.validateNodeData(nodeData);
      if (validationResult) {
        const errorResponse: NodeOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/nodes`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: this.getAuthHeaders(),
        readTimeout: 30000,
        connectTimeout: 10000,
        extraData: JSON.stringify(nodeData)
      };

      return new Promise<NodeOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('创建节点请求失败:', err);
            const errorResponse: NodeOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleNodeCreateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('创建节点异常:', error);
      const errorResponse: NodeOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 更新节点
   */
  async updateNode(courseId: number, nodeId: string, nodeData: UpdateNodeRequest): Promise<NodeOperationResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/nodes/${nodeId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.PUT,
        header: this.getAuthHeaders(),
        readTimeout: 30000,
        connectTimeout: 10000,
        extraData: JSON.stringify(nodeData)
      };

      return new Promise<NodeOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('更新节点请求失败:', err);
            const errorResponse: NodeOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleNodeUpdateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('更新节点异常:', error);
      const errorResponse: NodeOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 删除节点
   */
  async deleteNode(courseId: number, nodeId: string): Promise<NodeOperationResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/nodes/${nodeId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.DELETE,
        header: this.getAuthHeaders(),
        readTimeout: 30000,
        connectTimeout: 10000
      };

      return new Promise<NodeOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('删除节点请求失败:', err);
            const errorResponse: NodeOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleNodeDeleteResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('删除节点异常:', error);
      const errorResponse: NodeOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 获取课程的所有关系
   */
  async listRelations(courseId: number, params?: QueryParams): Promise<RelationListResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      let url: string = `${this.baseUrl}/api/graphs/${courseId}/relations`;

      // 添加查询参数
      if (params) {
        const queryParams: string[] = [];
        if (params.from) queryParams.push(`from=${encodeURIComponent(params.from)}`);
        if (params.to) queryParams.push(`to=${encodeURIComponent(params.to)}`);
        if (params.type) queryParams.push(`type=${encodeURIComponent(params.type)}`);
        
        if (queryParams.length > 0) {
          url += '?' + queryParams.join('&');
        }
      }

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: 30000, // 30秒读取超时
        connectTimeout: 10000 // 10秒连接超时
      };

      return new Promise<RelationListResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取关系列表请求失败:', err);
            const errorResponse: RelationListResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleRelationListResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('获取关系列表异常:', error);
      const errorResponse: RelationListResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 创建新关系
   */
  async createRelation(courseId: number, relationData: ApiCreateRelationRequest): Promise<RelationOperationResponse> {
    try {
      const validationResult: string | null = this.validateRelationData(relationData);
      if (validationResult) {
        const errorResponse: RelationOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/relations`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: this.getAuthHeaders(),
        readTimeout: 30000,
        connectTimeout: 10000,
        extraData: JSON.stringify(relationData)
      };

      return new Promise<RelationOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('创建关系请求失败:', err);
            const errorResponse: RelationOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleRelationCreateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('创建关系异常:', error);
      const errorResponse: RelationOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 更新关系
   */
  async updateRelation(courseId: number, relationId: string, relationData: UpdateRelationRequest): Promise<RelationOperationResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/relations/${relationId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.PUT,
        header: this.getAuthHeaders(),
        readTimeout: 30000,
        connectTimeout: 10000,
        extraData: JSON.stringify(relationData)
      };

      return new Promise<RelationOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('更新关系请求失败:', err);
            const errorResponse: RelationOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleRelationUpdateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('更新关系异常:', error);
      const errorResponse: RelationOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 删除关系
   */
  async deleteRelation(courseId: number, relationId: string): Promise<RelationOperationResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/graphs/${courseId}/relations/${relationId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.DELETE,
        header: this.getAuthHeaders(),
        readTimeout: 30000,
        connectTimeout: 10000
      };

      return new Promise<RelationOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('删除关系请求失败:', err);
            const errorResponse: RelationOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleRelationDeleteResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('删除关系异常:', error);
      const errorResponse: RelationOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  // ========== 响应处理方法 ==========

  /**
   * 处理节点列表响应
   */
  private handleNodeListResponse(data: http.HttpResponse, resolve: (result: NodeListResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      
      // 更安全的result处理
      let resultString: string;
      if (data.result === null || data.result === undefined) {
        resultString = '';
      } else if (typeof data.result === 'string') {
        resultString = data.result;
      } else {
        resultString = JSON.stringify(data.result);
      }

      if (responseCode === 200) {
        // 安全的JSON解析
        let nodes: Node[];
        try {
          nodes = JSON.parse(resultString) as Node[];
          // 确保解析结果是数组
          if (!Array.isArray(nodes)) {
            nodes = [];
          }
        } catch (jsonError) {
          console.error('JSON解析节点数据失败:', jsonError);
          nodes = [];
        }
        
        const successResponse: NodeListResponse = {
          success: true,
          data: nodes,
          total: nodes.length
        };
        resolve(successResponse);
      } else {
        const errorResponse: NodeListResponse = this.handleErrorResponseGeneric<NodeListResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析节点列表响应失败:', parseError);
      const errorResponse: NodeListResponse = {
        success: false,
        message: '解析响应数据失败: ' + (parseError as Error).message
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理节点详情响应
   */
  private handleNodeDetailResponse(data: http.HttpResponse, resolve: (result: NodeDetailApiResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      
      // 更安全的result处理
      let resultString: string;
      if (data.result === null || data.result === undefined) {
        resultString = '';
      } else if (typeof data.result === 'string') {
        resultString = data.result;
      } else {
        resultString = JSON.stringify(data.result);
      }

      if (responseCode === 200) {
        // 安全的JSON解析
        let nodeDetail: NodeDetailResponse;
        try {
          nodeDetail = JSON.parse(resultString) as NodeDetailResponse;
          // 确保解析结果是对象
          if (typeof nodeDetail !== 'object' || nodeDetail === null) {
            nodeDetail = {};
          }
        } catch (jsonError) {
          console.error('JSON解析节点详情失败:', jsonError);
          nodeDetail = {};
        }
        
        const successResponse: NodeDetailApiResponse = {
          success: true,
          data: nodeDetail
        };
        resolve(successResponse);
      } else {
        const errorResponse: NodeDetailApiResponse = this.handleErrorResponseGeneric<NodeDetailApiResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析节点详情响应失败:', parseError);
      const errorResponse: NodeDetailApiResponse = {
        success: false,
        message: '解析响应数据失败: ' + (parseError as Error).message
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理节点创建响应
   */
  private handleNodeCreateResponse(data: http.HttpResponse, resolve: (result: NodeOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 201) {
        const node: Node = JSON.parse(resultString) as Node;
        const successResponse: NodeOperationResponse = {
          success: true,
          data: node,
          message: '节点创建成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: NodeOperationResponse = this.handleErrorResponseGeneric<NodeOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析创建节点响应失败:', parseError);
      const errorResponse: NodeOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理节点更新响应
   */
  private handleNodeUpdateResponse(data: http.HttpResponse, resolve: (result: NodeOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const node: Node = JSON.parse(resultString) as Node;
        const successResponse: NodeOperationResponse = {
          success: true,
          data: node,
          message: '节点更新成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: NodeOperationResponse = this.handleErrorResponseGeneric<NodeOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析更新节点响应失败:', parseError);
      const errorResponse: NodeOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理节点删除响应
   */
  private handleNodeDeleteResponse(data: http.HttpResponse, resolve: (result: NodeOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;

      if (responseCode === 204) {
        const successResponse: NodeOperationResponse = {
          success: true,
          message: '节点删除成功'
        };
        resolve(successResponse);
      } else {
        const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
        const errorResponse: NodeOperationResponse = this.handleErrorResponseGeneric<NodeOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析删除节点响应失败:', parseError);
      const errorResponse: NodeOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理关系列表响应
   */
  private handleRelationListResponse(data: http.HttpResponse, resolve: (result: RelationListResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const relations: Relation[] = JSON.parse(resultString) as Relation[];
        const successResponse: RelationListResponse = {
          success: true,
          data: relations,
          total: relations.length
        };
        resolve(successResponse);
      } else {
        const errorResponse: RelationListResponse = this.handleErrorResponseGeneric<RelationListResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析关系列表响应失败:', parseError);
      const errorResponse: RelationListResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理关系创建响应
   */
  private handleRelationCreateResponse(data: http.HttpResponse, resolve: (result: RelationOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 201) {
        const relation: Relation = JSON.parse(resultString) as Relation;
        const successResponse: RelationOperationResponse = {
          success: true,
          data: relation,
          message: '关系创建成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: RelationOperationResponse = this.handleErrorResponseGeneric<RelationOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析创建关系响应失败:', parseError);
      const errorResponse: RelationOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理关系更新响应
   */
  private handleRelationUpdateResponse(data: http.HttpResponse, resolve: (result: RelationOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const relation: Relation = JSON.parse(resultString) as Relation;
        const successResponse: RelationOperationResponse = {
          success: true,
          data: relation,
          message: '关系更新成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: RelationOperationResponse = this.handleErrorResponseGeneric<RelationOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析更新关系响应失败:', parseError);
      const errorResponse: RelationOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 处理关系删除响应
   */
  private handleRelationDeleteResponse(data: http.HttpResponse, resolve: (result: RelationOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;

      if (responseCode === 204) {
        const successResponse: RelationOperationResponse = {
          success: true,
          message: '关系删除成功'
        };
        resolve(successResponse);
      } else {
        const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
        const errorResponse: RelationOperationResponse = this.handleErrorResponseGeneric<RelationOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析删除关系响应失败:', parseError);
      const errorResponse: RelationOperationResponse = {
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
        case 401:
          errorMessage = '认证失败，请重新登录';
          break;
        case 403:
          errorMessage = '权限不足，无法执行此操作';
          break;
        case 404:
          errorMessage = '资源不存在';
          break;
        case 409:
          errorMessage = '资源冲突';
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
   * 验证节点数据
   */
  private validateNodeData(nodeData: CreateNodeRequest): string | null {
    if (!nodeData.title || nodeData.title.trim().length === 0) {
      return '节点标题不能为空';
    }

    if (nodeData.title.trim().length < 2) {
      return '节点标题至少2个字符';
    }

    if (!nodeData.type) {
      return '请选择节点类型';
    }

    return null;
  }

  /**
   * 验证关系数据
   */
  private validateRelationData(relationData: ApiCreateRelationRequest): string | null {
    if (!relationData.from || relationData.from.trim().length === 0) {
      return '起始节点ID不能为空';
    }

    if (!relationData.to || relationData.to.trim().length === 0) {
      return '目标节点ID不能为空';
    }

    if (relationData.from === relationData.to) {
      return '起始节点和目标节点不能相同';
    }

    if (!relationData.type) {
      return '请选择关系类型';
    }

    return null;
  }
}