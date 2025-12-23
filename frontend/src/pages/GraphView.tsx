import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Node, Relation } from '../types';
import { graphAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import GraphCanvas from '../components/common/GraphCanvas';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import { Edit2, X, Trash2 } from 'lucide-react';

const GraphView: React.FC = () => {
    const navigate = useNavigate();
    const { selectedCourse } = useCourse();

    const [nodes, setNodes] = useState<Node[]>([]);
    const [relations, setRelations] = useState<Relation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        type: 'node' | 'relation' | null;
        id: string | null;
    }>({
        isOpen: false,
        type: null,
        id: null,
    });

    const { isAdmin } = useAuth();
    const { success, error: showError } = useToast();

    const [editingNode, setEditingNode] = useState<Node | null>(null);
    const [editNodeForm, setEditNodeForm] = useState({
        label: '',
        type: '',
        description: '',
    });

    useEffect(() => {
        if (!selectedCourse) {
            navigate('/courses');
            return;
        }
        fetchGraphData();
    }, [selectedCourse, navigate]);

    const fetchGraphData = async () => {
        if (!selectedCourse) return;
        try {
            setLoading(true);
            const [nodesResponse, relationsResponse] = await Promise.all([
                graphAPI.getNodes(selectedCourse.id),
                graphAPI.getRelations(selectedCourse.id)
            ]);
            const fetchedNodes = nodesResponse.data;
            const fetchedRelations = relationsResponse.data;
            setNodes(fetchedNodes);
            setRelations(fetchedRelations);
            
            // 更新正在编辑的节点和选中的节点
            setEditingNode(prev => {
                if (prev) {
                    const updatedNode = fetchedNodes.find(n => n.id === prev.id);
                    return updatedNode || prev;
                }
                return prev;
            });
            
            setSelectedNode(prev => {
                if (prev) {
                    const updatedNode = fetchedNodes.find(n => n.id === prev.id);
                    return updatedNode || prev;
                }
                return prev;
            });
        } catch (err: any) {
            setError('获取知识图谱数据失败: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching graph data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNodeByPosition = async (position: { x: number; y: number }) => {
        try {
            const nodeData: Partial<Node> = {
                label: '新节点',
                meta: {
                    x: position.x,
                    y: position.y,
                },
            };

            if (!selectedCourse) return;
            const response = await graphAPI.createNode(selectedCourse.id, nodeData);
            success('节点创建成功，点击节点进行编辑');
            
            await fetchGraphData();
            
            if (response.data && response.data.id) {
                setTimeout(() => {
                    setNodes(currentNodes => {
                        const newNode = currentNodes.find(n => n.id === response.data.id);
                        if (newNode) {
                            setSelectedNode(newNode);
                            handleStartEditNode(newNode);
                        }
                        return currentNodes;
                    });
                }, 100);
            }
        } catch (err: any) {
            const errorMsg = '创建节点失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        }
    };

    const handleCreateRelationByNodes = async (from: string, to: string) => {
        try {
            if (!selectedCourse) return;
            await graphAPI.createRelation(selectedCourse.id, {
                from,
                to,
                type: 'related',
                directed: true,
                weight: 0.5,
            });
            success('关系创建成功');
            fetchGraphData();
        } catch (err: any) {
            const errorMsg = '创建关系失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        }
    };

    const handleDeleteNode = (nodeId: string) => {
        setDeleteConfirm({ isOpen: true, type: 'node', id: nodeId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id || !deleteConfirm.type) return;
        try {
            if (deleteConfirm.type === 'node') {
                if (!selectedCourse) return;
                await graphAPI.deleteNode(selectedCourse.id, deleteConfirm.id);
                if (selectedNode?.id === deleteConfirm.id) {
                    setSelectedNode(null);
                    setEditingNode(null);
                }
                success('节点删除成功');
            }
            fetchGraphData();
        } catch (err: any) {
            const errorMsg = `删除${deleteConfirm.type === 'node' ? '节点' : '关系'}失败: ` + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setDeleteConfirm({ isOpen: false, type: null, id: null });
        }
    };

    const handleStartEditNode = (node: Node) => {
        setEditingNode(node);
        setEditNodeForm({
            label: node.label || '',
            type: node.type || '',
            description: node.description || '',
        });
    };

    const handleCancelEditNode = () => {
        setEditingNode(null);
        setEditNodeForm({ label: '', type: '', description: '' });
    };

    const handleSaveEditNode = async () => {
        if (!editingNode || !selectedCourse) return;
        
        try {
            const nodeData: Partial<Node> = {
                label: editNodeForm.label.trim() || '新节点',
            };
            if (editNodeForm.type) nodeData.type = editNodeForm.type;
            if (editNodeForm.description) nodeData.description = editNodeForm.description;

            await graphAPI.updateNode(selectedCourse.id, editingNode.id!, nodeData);
            success('节点更新成功');
            setEditingNode(null);
            setEditNodeForm({ label: '', type: '', description: '' });
            fetchGraphData();
            if (selectedNode?.id === editingNode.id) {
                const updatedNode = { ...selectedNode, ...nodeData };
                setSelectedNode(updatedNode);
            }
        } catch (err: any) {
            const errorMsg = '更新节点失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        }
    };

    const getNodeConnections = (nodeId: string) => {
        const incoming = relations.filter(r => r.to === nodeId);
        const outgoing = relations.filter(r => r.from === nodeId);
        return { incoming, outgoing };
    };

    if (!selectedCourse) {
        return (
            <div className="container">
                <div className="error-message">请先选择一个课程</div>
                <button onClick={() => navigate('/courses')} className="btn btn-primary">
                    前往课程列表
                </button>
            </div>
        );
    }

    if (loading) return <div className="loading">加载知识图谱中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="graph-view-fullscreen">
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={deleteConfirm.type === 'node' ? '删除节点' : '删除关系'}
                message={
                    deleteConfirm.type === 'node'
                        ? '确定要删除这个节点吗？这可能会影响相关的关系。'
                        : '确定要删除这个关系吗？'
                }
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
            />

            <div className="graph-container-fullscreen">
                <div className="graph-main-fullscreen">
                    <GraphCanvas
                        nodes={nodes}
                        relations={relations}
                        onNodeClick={setSelectedNode}
                        onNodeCreate={isAdmin ? handleCreateNodeByPosition : undefined}
                        onRelationCreate={isAdmin ? handleCreateRelationByNodes : undefined}
                        selectedNodeId={selectedNode?.id}
                        editable={isAdmin}
                        onNodeUpdate={async (nodeId, position) => {
                            if (!selectedCourse) return;
                            try {
                                const node = nodes.find(n => n.id === nodeId);
                                if (node) {
                                    await graphAPI.updateNode(selectedCourse.id, nodeId, {
                                        ...node,
                                        meta: {
                                            ...node.meta,
                                            x: position.x,
                                            y: position.y,
                                        },
                                    });
                                }
                            } catch (err) {
                                console.error('Failed to update node position:', err);
                            }
                        }}
                    />
                </div>

                {/* 节点详情浮动面板 */}
                {selectedNode && (
                    <div className="node-details-panel">
                        <div className="node-details-header">
                            <h3>节点详情</h3>
                            <button
                                onClick={() => {
                                    setSelectedNode(null);
                                    setEditingNode(null);
                                }}
                                className="btn-icon"
                                aria-label="关闭"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {editingNode && editingNode.id === selectedNode.id ? (
                            <div className="node-edit-form">
                                <div className="form-group">
                                    <label className="form-label">节点标签:</label>
                                    <input
                                        type="text"
                                        value={editNodeForm.label}
                                        onChange={(e) => setEditNodeForm({ ...editNodeForm, label: e.target.value })}
                                        className="form-input"
                                        placeholder="输入节点名称"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">节点类型:</label>
                                    <input
                                        type="text"
                                        value={editNodeForm.type}
                                        onChange={(e) => setEditNodeForm({ ...editNodeForm, type: e.target.value })}
                                        className="form-input"
                                        placeholder="例如: concept, topic"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">描述:</label>
                                    <textarea
                                        value={editNodeForm.description}
                                        onChange={(e) => setEditNodeForm({ ...editNodeForm, description: e.target.value })}
                                        className="form-input"
                                        rows={3}
                                        placeholder="输入节点描述（可选）"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button
                                        onClick={handleSaveEditNode}
                                        className="btn btn-primary btn-small"
                                    >
                                        保存
                                    </button>
                                    <button
                                        onClick={handleCancelEditNode}
                                        className="btn btn-outline btn-small"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="node-info">
                                    <div className="node-info-item">
                                        <span className="node-info-label">标签:</span>
                                        <span className="node-info-value">{selectedNode.label || '未命名节点'}</span>
                                    </div>
                                    {selectedNode.type && (
                                        <div className="node-info-item">
                                            <span className="node-info-label">类型:</span>
                                            <span className="node-info-value">{selectedNode.type}</span>
                                        </div>
                                    )}
                                    {selectedNode.description && (
                                        <div className="node-info-item">
                                            <span className="node-info-label">描述:</span>
                                            <p className="node-info-description">{selectedNode.description}</p>
                                        </div>
                                    )}
                                    {(() => {
                                        const { incoming, outgoing } = getNodeConnections(selectedNode.id!);
                                        return (
                                            <div className="node-info-item">
                                                <span className="node-info-label">连接:</span>
                                                <span className="node-info-value">
                                                    {incoming.length + outgoing.length} 个关系
                                                    {incoming.length > 0 && ` (${incoming.length} 入, ${outgoing.length} 出)`}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {isAdmin && (
                                    <div className="node-actions">
                                        <button
                                            onClick={() => handleStartEditNode(selectedNode)}
                                            className="btn btn-primary btn-small"
                                        >
                                            <Edit2 size={16} />
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNode(selectedNode.id!)}
                                            className="btn btn-danger btn-small"
                                        >
                                            <Trash2 size={16} />
                                            删除
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraphView;
