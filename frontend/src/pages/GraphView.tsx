import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, X } from "lucide-react";
import type { Node, Relation } from "../types";
import { graphAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { GraphCanvas, ConfirmDialog, useToast } from "../components";
import { getErrorMessage } from "../utils";
import { ROUTES } from "@/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components";

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
      void navigate(ROUTES.COURSES);
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
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>请先选择一个课程</AlertTitle>
          <div className="mt-2">
            <Button onClick={() => void navigate(ROUTES.COURSES)}>
              前往课程列表
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen w-full p-0">
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

      <div className="h-full w-full">
        <div className="h-full w-full">
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
          <Card className="absolute right-4 top-4 z-[1000] w-80">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  {selectedNode ? "节点详情" : "关系详情"}
                </h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setSelectedNode(null);
                    setEditingNode(null);
                    setSelectedRelation(null);
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
              {selectedNode ? (
                editingNode && editingNode.id === selectedNode.id ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="node-label">节点标签</Label>
                      <Input
                        id="node-label"
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
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="node-type">节点类型</Label>
                      <Input
                        id="node-type"
                        value={editNodeForm.type}
                        onChange={(e) => {
                          setEditNodeForm({
                            ...editNodeForm,
                            type: e.target.value,
                          });
                        }}
                        placeholder="例如: concept, topic"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="node-desc">描述</Label>
                      <Textarea
                        id="node-desc"
                        value={editNodeForm.description}
                        onChange={(e) => {
                          setEditNodeForm({
                            ...editNodeForm,
                            description: e.target.value,
                          });
                        }}
                        rows={3}
                        placeholder="输入节点描述（可选）"
                        className="resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          void handleSaveEditNode();
                        }}
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditNode}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        标签:
                      </span>
                      <div className="font-medium">
                        {selectedNode.label || "未命名节点"}
                      </div>
                    </div>
                    {selectedNode.type !== undefined &&
                    selectedNode.type !== "" ? (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          类型:
                        </span>
                        <div className="font-medium">{selectedNode.type}</div>
                      </div>
                    ) : null}
                    {selectedNode.description ? (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          描述:
                        </span>
                        <p className="mt-1 text-sm">
                          {selectedNode.description}
                        </p>
                      </div>
                    ) : null}
                    {isAdmin ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            handleStartEditNode(selectedNode);
                          }}
                        >
                          <Pencil className="size-4" />
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            handleDeleteNode(selectedNode.id ?? "");
                          }}
                        >
                          <Trash2 className="size-4" />
                          删除
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )
              ) : selectedRelation ? (
                editingRelation &&
                editingRelation.id === selectedRelation.id ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>关系类型</Label>
                      <Select
                        value={editRelationForm.type}
                        onValueChange={(
                          value: "prerequisite" | "related" | "part_of",
                        ) => {
                          setEditRelationForm({
                            ...editRelationForm,
                            type: value,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prerequisite">
                            前置 (prerequisite)
                          </SelectItem>
                          <SelectItem value="related">
                            相关 (related)
                          </SelectItem>
                          <SelectItem value="part_of">
                            包含 (part_of)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="relation-directed"
                        checked={editRelationForm.directed}
                        onCheckedChange={(checked) => {
                          setEditRelationForm({
                            ...editRelationForm,
                            directed: checked === true,
                          });
                        }}
                      />
                      <Label
                        htmlFor="relation-directed"
                        className="cursor-pointer text-sm font-normal"
                      >
                        有向关系
                      </Label>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="relation-weight">权重</Label>
                      <Input
                        id="relation-weight"
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
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">从:</span>
                      <div className="font-medium">
                        {nodes.find((n) => n.id === selectedRelation.from)
                          ?.label ?? selectedRelation.from}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">到:</span>
                      <div className="font-medium">
                        {nodes.find((n) => n.id === selectedRelation.to)
                          ?.label ?? selectedRelation.to}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          void handleSaveEditRelation();
                        }}
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditRelation}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        类型:
                      </span>
                      <div className="font-medium">
                        {{
                          prerequisite: "前置 (prerequisite)",
                          related: "相关 (related)",
                          part_of: "包含 (part_of)",
                        }[selectedRelation.type] ?? selectedRelation.type}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        方向:
                      </span>
                      <div className="font-medium">
                        {selectedRelation.directed ? "有向" : "无向"}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        权重:
                      </span>
                      <div className="font-medium">
                        {selectedRelation.weight ?? 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">从:</span>
                      <div className="font-medium">
                        {nodes.find((n) => n.id === selectedRelation.from)
                          ?.label ?? selectedRelation.from}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">到:</span>
                      <div className="font-medium">
                        {nodes.find((n) => n.id === selectedRelation.to)
                          ?.label ?? selectedRelation.to}
                      </div>
                    </div>
                    {isAdmin ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            handleStartEditRelation(selectedRelation);
                          }}
                        >
                          <Pencil className="size-4" />
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            handleDeleteRelation(selectedRelation.id ?? "");
                          }}
                        >
                          <Trash2 className="size-4" />
                          删除
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default GraphView;
