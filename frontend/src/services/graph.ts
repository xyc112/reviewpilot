import api from "./apiClient";
import { Node, Relation } from "../types";

export const graphAPI = {
  getNodes: (courseId: number) =>
    api.get<Node[]>(`/api/graphs/${courseId}/nodes`),
  getNode: (courseId: number, nodeId: string) =>
    api.get<Node>(`/api/graphs/${courseId}/nodes/${nodeId}`),
  createNode: (courseId: number, nodeData: Partial<Node>) =>
    api.post<Node>(`/api/graphs/${courseId}/nodes`, nodeData),
  updateNode: (courseId: number, nodeId: string, nodeData: Partial<Node>) =>
    api.put<Node>(`/api/graphs/${courseId}/nodes/${nodeId}`, nodeData),
  deleteNode: (courseId: number, nodeId: string) =>
    api.delete(`/api/graphs/${courseId}/nodes/${nodeId}`),
  getRelations: (courseId: number, params?: Record<string, string | number | boolean>) =>
    api.get<Relation[]>(`/api/graphs/${courseId}/relations`, { params }),
  createRelation: (courseId: number, relationData: Partial<Relation>) =>
    api.post<Relation>(`/api/graphs/${courseId}/relations`, relationData),
  updateRelation: (
    courseId: number,
    relationId: string,
    relationData: Partial<Relation>,
  ) =>
    api.put<Relation>(
      `/api/graphs/${courseId}/relations/${relationId}`,
      relationData,
    ),
  deleteRelation: (courseId: number, relationId: string) =>
    api.delete(`/api/graphs/${courseId}/relations/${relationId}`),
};
