// GraphTypes.ets
// 节点类型枚举
export enum NodeType {
  CONCEPT = "CONCEPT",
  EXAMPLE = "EXAMPLE",
  EXERCISE = "EXERCISE",
  REFERENCE = "REFERENCE",
  RESOURCE = "RESOURCE"
}

// 关系类型枚举

export enum RelationType {
  PREREQUISITE = "PREREQUISITE",
  RELATED = "RELATED",
  CONTAINS = "CONTAINS",
  EXAMPLES = "EXAMPLES",
  DEPENDS_ON = "DEPENDS_ON"
}

// 位置信息接口
export interface Position {
  x: number;
  y: number;
}

// 元数据接口
export interface Metadata {
  title?: string;
  description?: string;
  difficulty?: string | number;
  category?: string;
  tags?: string;
  priority?: string | number;
  status?: string;
  // 可以根据需要添加更多具体字段
}

// 图节点
export interface Node {
  id: string;
  courseId: number;
  type: NodeType;
  title: string;
  content?: string;
  position?: Position;
  metadata?: Metadata;
  createdAt: string;
  updatedAt?: string;
}

// 图关系
export interface Relation {
  id: string;
  courseId: number;
  fromNodeId: string;
  toNodeId: string;
  type: RelationType;
  label?: string;
  weight?: number;
  metadata?: Metadata;
  createdAt: string;
  updatedAt?: string;
}

// 创建节点请求
export interface CreateNodeRequest {
  type: NodeType;
  title: string;
  label?: string;
  content?: string;
  position?: Position;
  metadata?: Metadata;
}

// 更新节点请求
export interface UpdateNodeRequest extends Partial<CreateNodeRequest> {}

// 创建关系请求（前端使用）
export interface CreateRelationRequest {
  fromNodeId: string;
  toNodeId: string;
  type: RelationType;
  label?: string;
  weight?: number;
  metadata?: Metadata;
}

// 创建关系请求（后端API格式）
export interface ApiCreateRelationRequest {
  from: string;
  to: string;
  type: RelationType;
  label?: string;
  weight?: number;
  metadata?: Metadata;
}

// 更新关系请求
export interface UpdateRelationRequest extends Partial<CreateRelationRequest> {}

// 节点详情响应（包含相关关系）
export interface NodeDetailResponse {
  node?: Node;
  outgoingRelations?: Relation[];
  incomingRelations?: Relation[];
  additionalData?: Metadata; // 替代索引签名
}

// ========== 响应类型 ==========
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  message: string;
}

// 节点列表响应
export interface NodeListResponse extends BaseApiResponse {
  data?: Node[];
  total?: number;
}

// 节点详情响应
export interface NodeDetailApiResponse extends BaseApiResponse {
  data?: NodeDetailResponse;
}

// 节点操作响应
export interface NodeOperationResponse extends BaseApiResponse {
  data?: Node;
}

// 关系列表响应
export interface RelationListResponse extends BaseApiResponse {
  data?: Relation[];
  total?: number;
}

// 关系操作响应
export interface RelationOperationResponse extends BaseApiResponse {
  data?: Relation;
}

// 错误响应
export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}