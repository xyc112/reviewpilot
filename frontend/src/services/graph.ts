import api from "./apiClient";
import type { Node, Relation } from "../types";

export const graphAPI = {
  getNodes: (courseId: number) =>
    api.get<Node[]>(`/api/graphs/${String(courseId)}/nodes`),
  getNode: (courseId: number, nodeId: string) =>
    api.get<Node>(`/api/graphs/${String(courseId)}/nodes/${nodeId}`),
  createNode: (courseId: number, nodeData: Partial<Node>) =>
    api.post<Node>(`/api/graphs/${String(courseId)}/nodes`, nodeData),
  updateNode: (courseId: number, nodeId: string, nodeData: Partial<Node>) =>
    api.put<Node>(`/api/graphs/${String(courseId)}/nodes/${nodeId}`, nodeData),
  deleteNode: (courseId: number, nodeId: string) =>
    api.delete(`/api/graphs/${String(courseId)}/nodes/${nodeId}`),
  getRelations: (courseId: number, params?: Record<string, string | number | boolean>) =>
    api.get<Relation[]>(`/api/graphs/${String(courseId)}/relations`, { params }),
  createRelation: (courseId: number, relationData: Partial<Relation>) =>
    api.post<Relation>(`/api/graphs/${String(courseId)}/relations`, relationData),
  updateRelation: (
    courseId: number,
    relationId: string,
    relationData: Partial<Relation>,
  ) =>
    api.put<Relation>(
      `/api/graphs/${String(courseId)}/relations/${relationId}`,
      relationData,
    ),
  deleteRelation: (courseId: number, relationId: string) =>
    api.delete(`/api/graphs/${String(courseId)}/relations/${relationId}`),
};
