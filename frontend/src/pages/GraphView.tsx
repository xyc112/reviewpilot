import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Spin,
  Button,
  Card,
  Space,
  Typography,
  Input,
  Select,
  Form,
} from "antd";
import { EditOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Node, Relation } from "../types";
import { graphAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { GraphCanvas, ConfirmDialog, useToast } from "../components";
import { getErrorMessage } from "../utils";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const GraphView = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;

  const [nodes, setNodes] = useState<Node[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<Relation | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "node" | "relation" | null;
    id: string | null;
  }>({
    isOpen: false,
    type: null,
    id: null,
  });

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editNodeForm, setEditNodeForm] = useState({
    label: "",
    type: "",
    description: "",
  });
  const [editingRelation, setEditingRelation] = useState<Relation | null>(null);
  const [editRelationForm, setEditRelationForm] = useState({
    type: "related" as "prerequisite" | "related" | "part_of",
    directed: true,
    weight: 0.5,
  });
  const [relationType, setRelationType] = useState<
    "prerequisite" | "related" | "part_of"
  >("related");
  const [relationDirected, setRelationDirected] = useState(true);
  const [relationWeight, setRelationWeight] = useState(0.5);

  useEffect(() => {
    if (!course) {
      void navigate("/courses");
      return;
    }
    void fetchGraphData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchGraphData 依赖 course
  }, [course, navigate]);

  const fetchGraphData = async () => {
    if (!course) return;
    try {
      setLoading(true);
      const [nodesResponse, relationsResponse] = await Promise.all([
        graphAPI.getNodes(course.id),
        graphAPI.getRelations(course.id),
      ]);
      const fetchedNodes = nodesResponse.data;
      const fetchedRelations = relationsResponse.data;
      setNodes(fetchedNodes);
      setRelations(fetchedRelations);

      // 更新正在编辑的节点和选中的节点
      setEditingNode((prev) => {
        if (prev) {
          const updatedNode = fetchedNodes.find((n) => n.id === prev.id);
          return updatedNode ?? prev;
        }
        return prev;
      });

      setSelectedNode((prev) => {
        if (prev) {
          const updatedNode = fetchedNodes.find((n) => n.id === prev.id);
          return updatedNode ?? prev;
        }
        return prev;
      });

      setSelectedRelation((prev) => {
        if (prev) {
          const updatedRelation = fetchedRelations.find(
            (r) => r.id === prev.id,
          );
          return updatedRelation ?? null;
        }
        return prev;
      });
    } catch (err: unknown) {
      setError(
        "获取知识图谱数据失败: " +
          (err instanceof Error ? err.message : String(err)),
      );
      console.error("Error fetching graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNodeByPosition = async (position: {
    x: number;
    y: number;
  }) => {
    try {
      // 生成唯一的默认节点名称
      const getUniqueNodeLabel = (): string => {
        const baseLabel = "新节点";
        const existingLabels = nodes
          .map((n) => n.label)
          .filter((label) => label.startsWith(baseLabel));

        if (existingLabels.length === 0) {
          return baseLabel;
        }

        // 提取所有数字后缀
        const numbers = existingLabels.map((label) => {
          const match = /^新节点(\d+)$/.exec(label);
          return match ? parseInt(match[1], 10) : 0;
        });

        // 找到下一个可用的数字
        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        return `${baseLabel}${String(maxNumber + 1)}`;
      };

      const nodeData: Partial<Node> = {
        label: getUniqueNodeLabel(),
        meta: {
          x: position.x,
          y: position.y,
        },
      };

      if (!course) return;
      const response = await graphAPI.createNode(course.id, nodeData);
      success("节点创建成功，点击节点进行编辑");

      await fetchGraphData();

      if (response.data.id) {
        setTimeout(() => {
          setNodes((currentNodes) => {
            const newNode = currentNodes.find((n) => n.id === response.data.id);
            if (newNode) {
              setSelectedNode(newNode);
              handleStartEditNode(newNode);
            }
            return currentNodes;
          });
        }, 100);
      }
    } catch (err: unknown) {
      const errorMsg = "创建节点失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleCreateRelationByNodes = async (from: string, to: string) => {
    try {
      if (!course) return;
      await graphAPI.createRelation(course.id, {
        from,
        to,
        type: relationType,
        directed: relationDirected,
        weight: relationWeight,
      });
      success("关系创建成功");
      void fetchGraphData();
    } catch (err: unknown) {
      const errorMsg = "创建关系失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    setDeleteConfirm({ isOpen: true, type: "node", id: nodeId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;
    try {
      if (deleteConfirm.type === "node") {
        if (!course) return;
        await graphAPI.deleteNode(course.id, deleteConfirm.id);
        if (selectedNode?.id === deleteConfirm.id) {
          setSelectedNode(null);
          setEditingNode(null);
        }
        success("节点删除成功");
      } else {
        if (!course) return;
        await graphAPI.deleteRelation(course.id, deleteConfirm.id);
        if (selectedRelation?.id === deleteConfirm.id) {
          setSelectedRelation(null);
        }
        success("关系删除成功");
      }
      void fetchGraphData();
    } catch (err: unknown) {
      const errorMsg =
        `删除${deleteConfirm.type === "node" ? "节点" : "关系"}失败: ` +
        getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm({ isOpen: false, type: null, id: null });
    }
  };

  const handleStartEditNode = (node: Node) => {
    setEditingNode(node);
    setEditNodeForm({
      label: node.label,
      type: node.type ?? "",
      description: node.description ?? "",
    });
  };

  const handleCancelEditNode = () => {
    setEditingNode(null);
    setEditNodeForm({ label: "", type: "", description: "" });
  };

  const handleSaveEditNode = async () => {
    if (!editingNode || !course) return;

    try {
      const nodeData: Partial<Node> = {
        label: editNodeForm.label.trim() || "新节点",
      };
      if (editNodeForm.type) nodeData.type = editNodeForm.type;
      if (editNodeForm.description)
        nodeData.description = editNodeForm.description;

      await graphAPI.updateNode(course.id, editingNode.id ?? "", nodeData);
      success("节点更新成功");
      setEditingNode(null);
      setEditNodeForm({ label: "", type: "", description: "" });
      void fetchGraphData();
      if (selectedNode?.id === editingNode.id) {
        const updatedNode = { ...selectedNode, ...nodeData };
        setSelectedNode(updatedNode);
      }
    } catch (err: unknown) {
      const errorMsg = "更新节点失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleRelationClick = (relation: Relation) => {
    setSelectedRelation(relation);
    setSelectedNode(null);
  };

  const handleDeleteRelation = (relationId: string) => {
    setDeleteConfirm({ isOpen: true, type: "relation", id: relationId });
  };

  const handleStartEditRelation = (relation: Relation) => {
    setEditingRelation(relation);
    setEditRelationForm({
      type: (relation.type || "related") as
        | "prerequisite"
        | "related"
        | "part_of",
      directed: relation.directed ?? true,
      weight: relation.weight ?? 0.5,
    });
  };

  const handleCancelEditRelation = () => {
    setEditingRelation(null);
    setEditRelationForm({
      type: "related",
      directed: true,
      weight: 0.5,
    });
  };

  const handleSaveEditRelation = async () => {
    if (!editingRelation || !course) return;

    try {
      await graphAPI.updateRelation(course.id, editingRelation.id ?? "", {
        type: editRelationForm.type,
        directed: editRelationForm.directed,
        weight: editRelationForm.weight,
      });
      success("关系更新成功");
      setEditingRelation(null);
      setEditRelationForm({
        type: "related",
        directed: true,
        weight: 0.5,
      });
      void fetchGraphData();
      if (selectedRelation?.id === editingRelation.id) {
        const updatedRelation = { ...selectedRelation, ...editRelationForm };
        setSelectedRelation(updatedRelation);
      }
    } catch (err: unknown) {
      const errorMsg = "更新关系失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  if (!course) {
    return (
      <Alert
        title="请先选择一个课程"
        type="warning"
        showIcon
        action={
          <Button
            type="primary"
            onClick={() => {
              void navigate("/courses");
            }}
          >
            前往课程列表
          </Button>
        }
        style={{ margin: "2rem" }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }
  if (error) {
    return (
      <Alert title={error} type="error" showIcon style={{ margin: "2rem" }} />
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", padding: 0 }}>
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.type === "node" ? "删除节点" : "删除关系"}
        message={
          deleteConfirm.type === "node"
            ? "确定要删除这个节点吗？这可能会影响相关的关系。"
            : "确定要删除这个关系吗？"
        }
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={() => {
          void confirmDelete();
        }}
        onCancel={() => {
          setDeleteConfirm({ isOpen: false, type: null, id: null });
        }}
      />

      <div style={{ width: "100%", height: "100%" }}>
        <div style={{ width: "100%", height: "100%" }}>
          <GraphCanvas
            nodes={nodes}
            relations={relations}
            onNodeClick={(node) => {
              setSelectedNode(node);
              setSelectedRelation(null);
            }}
            onRelationClick={handleRelationClick}
            onDeselect={() => {
              setSelectedNode(null);
              setSelectedRelation(null);
              setEditingNode(null);
              setEditingRelation(null);
            }}
            onNodeCreate={
              isAdmin
                ? (pos) => {
                    void handleCreateNodeByPosition(pos);
                  }
                : undefined
            }
            onRelationCreate={
              isAdmin
                ? (from, to) => {
                    void handleCreateRelationByNodes(from, to);
                  }
                : undefined
            }
            selectedNodeId={selectedNode?.id}
            selectedRelationId={selectedRelation?.id}
            editable={isAdmin}
            relationType={relationType}
            relationDirected={relationDirected}
            relationWeight={relationWeight}
            onRelationTypeChange={setRelationType}
            onRelationDirectedChange={setRelationDirected}
            onRelationWeightChange={setRelationWeight}
            onNodeUpdate={(nodeId, position) => {
              void (async () => {
                try {
                  const node = nodes.find((n) => n.id === nodeId);
                  if (node) {
                    await graphAPI.updateNode(course.id, nodeId, {
                      ...node,
                      meta: {
                        ...node.meta,
                        x: position.x,
                        y: position.y,
                      },
                    });
                  }
                } catch (err) {
                  console.error("Failed to update node position:", err);
                }
              })();
            }}
          />
        </div>

        {/* 节点 / 关系详情浮动面板 */}
        {selectedNode || selectedRelation ? (
          <Card
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              width: 320,
              zIndex: 1000,
            }}
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  {selectedNode ? "节点详情" : "关系详情"}
                </Title>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setSelectedNode(null);
                    setEditingNode(null);
                    setSelectedRelation(null);
                  }}
                />
              </div>
            }
          >
            {selectedNode ? (
              editingNode && editingNode.id === selectedNode.id ? (
                <Form layout="vertical">
                  <Form.Item label="节点标签" required>
                    <Input
                      value={editNodeForm.label}
                      onChange={(e) => {
                        setEditNodeForm({
                          ...editNodeForm,
                          label: e.target.value,
                        });
                      }}
                      placeholder="输入节点名称"
                      autoFocus
                    />
                  </Form.Item>
                  <Form.Item label="节点类型">
                    <Input
                      value={editNodeForm.type}
                      onChange={(e) => {
                        setEditNodeForm({
                          ...editNodeForm,
                          type: e.target.value,
                        });
                      }}
                      placeholder="例如: concept, topic"
                    />
                  </Form.Item>
                  <Form.Item label="描述">
                    <TextArea
                      value={editNodeForm.description}
                      onChange={(e) => {
                        setEditNodeForm({
                          ...editNodeForm,
                          description: e.target.value,
                        });
                      }}
                      rows={3}
                      placeholder="输入节点描述（可选）"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          void handleSaveEditNode();
                        }}
                      >
                        保存
                      </Button>
                      <Button size="small" onClick={handleCancelEditNode}>
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
                <Space
                  orientation="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                      标签:
                    </Text>
                    <div>
                      <Text strong>{selectedNode.label || "未命名节点"}</Text>
                    </div>
                  </div>
                  {selectedNode.type !== undefined &&
                  selectedNode.type !== "" ? (
                    <div>
                      <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                        类型:
                      </Text>
                      <div>
                        <Text strong>{selectedNode.type}</Text>
                      </div>
                    </div>
                  ) : null}
                  {selectedNode.description ? (
                    <div>
                      <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                        描述:
                      </Text>
                      <Paragraph style={{ margin: "0.25rem 0 0 0" }}>
                        {selectedNode.description}
                      </Paragraph>
                    </div>
                  ) : null}
                  {isAdmin ? (
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                          handleStartEditNode(selectedNode);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          handleDeleteNode(selectedNode.id ?? "");
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  ) : null}
                </Space>
              )
            ) : selectedRelation ? (
              editingRelation && editingRelation.id === selectedRelation.id ? (
                <Form layout="vertical">
                  <Form.Item label="关系类型">
                    <Select
                      value={editRelationForm.type}
                      onChange={(value) => {
                        setEditRelationForm({
                          ...editRelationForm,
                          type: value,
                        });
                      }}
                      options={[
                        { value: "prerequisite", label: "前置 (prerequisite)" },
                        { value: "related", label: "相关 (related)" },
                        { value: "part_of", label: "包含 (part_of)" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <input
                        type="checkbox"
                        id="relation-directed"
                        checked={editRelationForm.directed}
                        onChange={(e) => {
                          setEditRelationForm({
                            ...editRelationForm,
                            directed: e.target.checked,
                          });
                        }}
                        style={{ margin: 0, cursor: "pointer", width: "auto" }}
                      />
                      <label
                        htmlFor="relation-directed"
                        style={{
                          margin: 0,
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "#475569",
                          fontSize: "0.875rem",
                        }}
                      >
                        有向关系
                      </label>
                    </Space>
                  </Form.Item>
                  <Form.Item label="权重">
                    <Input
                      type="number"
                      min={0}
                      max={1}
                      step={0.1}
                      value={editRelationForm.weight}
                      onChange={(e) => {
                        setEditRelationForm({
                          ...editRelationForm,
                          weight: Math.max(
                            0,
                            Math.min(1, Number(e.target.value) || 0),
                          ),
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item label="从">
                    <Text>
                      {nodes.find((n) => n.id === selectedRelation.from)
                        ?.label ?? selectedRelation.from}
                    </Text>
                  </Form.Item>
                  <Form.Item label="到">
                    <Text>
                      {nodes.find((n) => n.id === selectedRelation.to)?.label ??
                        selectedRelation.to}
                    </Text>
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          void handleSaveEditRelation();
                        }}
                      >
                        保存
                      </Button>
                      <Button size="small" onClick={handleCancelEditRelation}>
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
                <Space
                  orientation="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                      类型:
                    </Text>
                    <div>
                      <Text strong>
                        {{
                          prerequisite: "前置 (prerequisite)",
                          related: "相关 (related)",
                          part_of: "包含 (part_of)",
                        }[selectedRelation.type] ?? selectedRelation.type}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                      方向:
                    </Text>
                    <div>
                      <Text strong>
                        {selectedRelation.directed ? "有向" : "无向"}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                      权重:
                    </Text>
                    <div>
                      <Text strong>{selectedRelation.weight ?? 0}</Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                      从:
                    </Text>
                    <div>
                      <Text strong>
                        {nodes.find((n) => n.id === selectedRelation.from)
                          ?.label ?? selectedRelation.from}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                      到:
                    </Text>
                    <div>
                      <Text strong>
                        {nodes.find((n) => n.id === selectedRelation.to)
                          ?.label ?? selectedRelation.to}
                      </Text>
                    </div>
                  </div>
                  {isAdmin ? (
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                          handleStartEditRelation(selectedRelation);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          handleDeleteRelation(selectedRelation.id ?? "");
                        }}
                      >
                        删除
                      </Button>
                    </Space>
                  ) : null}
                </Space>
              )
            ) : null}
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default GraphView;
