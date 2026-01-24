import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Node, Relation } from '../types';
import { graphAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import GraphCanvas from '../components/GraphCanvas';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { Edit2, X, Trash2 } from 'lucide-react';

const GraphView: React.FC = () => {
    const navigate = useNavigate();
    const { selectedCourse, currentStudyingCourse } = useCourse();
    const course = selectedCourse || currentStudyingCourse;

    const [nodes, setNodes] = useState<Node[]>([]);
    const [relations, setRelations] = useState<Relation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedRelation, setSelectedRelation] = useState<Relation | null>(null);
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
    const [editingRelation, setEditingRelation] = useState<Relation | null>(null);
    const [editRelationForm, setEditRelationForm] = useState({
        type: 'related' as 'prerequisite' | 'related' | 'part_of',
        directed: true,
        weight: 0.5,
    });
    const [relationType, setRelationType] = useState<'prerequisite' | 'related' | 'part_of'>('related');
    const [relationDirected, setRelationDirected] = useState(true);
    const [relationWeight, setRelationWeight] = useState(0.5);

    useEffect(() => {
        if (!course) {
            navigate('/courses');
            return;
        }
        fetchGraphData();
    }, [course, navigate]);

    const fetchGraphData = async () => {
        if (!course) return;
        try {
            setLoading(true);
            const [nodesResponse, relationsResponse] = await Promise.all([
                graphAPI.getNodes(course.id),
                graphAPI.getRelations(course.id)
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
            
            setSelectedRelation(prev => {
                if (prev) {
                    const updatedRelation = fetchedRelations.find(r => r.id === prev.id);
                    return updatedRelation || null;
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
            // 生成唯一的默认节点名称
            const getUniqueNodeLabel = (): string => {
                const baseLabel = '新节点';
                const existingLabels = nodes.map(n => n.label || '').filter(label => label.startsWith(baseLabel));
                
                if (existingLabels.length === 0) {
                    return baseLabel;
                }
                
                // 提取所有数字后缀
                const numbers = existingLabels.map(label => {
                    const match = label.match(/^新节点(\d+)$/);
                    return match ? parseInt(match[1], 10) : 0;
                });
                
                // 找到下一个可用的数字
                const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
                return `${baseLabel}${maxNumber + 1}`;
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
            if (!course) return;
            await graphAPI.createRelation(course.id, {
                from,
                to,
                type: relationType,
                directed: relationDirected,
                weight: relationWeight,
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
                if (!course) return;
                await graphAPI.deleteNode(course.id, deleteConfirm.id);
                if (selectedNode?.id === deleteConfirm.id) {
                    setSelectedNode(null);
                    setEditingNode(null);
                }
                success('节点删除成功');
            } else if (deleteConfirm.type === 'relation') {
                if (!course) return;
                await graphAPI.deleteRelation(course.id, deleteConfirm.id);
                if (selectedRelation?.id === deleteConfirm.id) {
                    setSelectedRelation(null);
                }
                success('关系删除成功');
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
        if (!editingNode || !course) return;
        
        try {
            const nodeData: Partial<Node> = {
                label: editNodeForm.label.trim() || '新节点',
            };
            if (editNodeForm.type) nodeData.type = editNodeForm.type;
            if (editNodeForm.description) nodeData.description = editNodeForm.description;

            await graphAPI.updateNode(course.id, editingNode.id!, nodeData);
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

    const handleRelationClick = (relation: Relation) => {
        setSelectedRelation(relation);
        setSelectedNode(null);
    };

    const handleDeleteRelation = (relationId: string) => {
        setDeleteConfirm({ isOpen: true, type: 'relation', id: relationId });
    };

    const handleStartEditRelation = (relation: Relation) => {
        setEditingRelation(relation);
        setEditRelationForm({
            type: (relation.type as 'prerequisite' | 'related' | 'part_of') || 'related',
            directed: relation.directed ?? true,
            weight: relation.weight ?? 0.5,
        });
    };

    const handleCancelEditRelation = () => {
        setEditingRelation(null);
        setEditRelationForm({
            type: 'related',
            directed: true,
            weight: 0.5,
        });
    };

    const handleSaveEditRelation = async () => {
        if (!editingRelation || !course) return;
        
        try {
            await graphAPI.updateRelation(course.id, editingRelation.id!, {
                type: editRelationForm.type,
                directed: editRelationForm.directed,
                weight: editRelationForm.weight,
            });
            success('关系更新成功');
            setEditingRelation(null);
            setEditRelationForm({
                type: 'related',
                directed: true,
                weight: 0.5,
            });
            fetchGraphData();
            if (selectedRelation?.id === editingRelation.id) {
                const updatedRelation = { ...selectedRelation, ...editRelationForm };
                setSelectedRelation(updatedRelation);
            }
        } catch (err: any) {
            const errorMsg = '更新关系失败: ' + (err.response?.data?.message || err.message);
            setError(errorMsg);
            showError(errorMsg);
        }
    };

    if (!course) {
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
                        onNodeCreate={isAdmin ? handleCreateNodeByPosition : undefined}
                        onRelationCreate={isAdmin ? handleCreateRelationByNodes : undefined}
                        selectedNodeId={selectedNode?.id}
                        selectedRelationId={selectedRelation?.id}
                        editable={isAdmin}
                        relationType={relationType}
                        relationDirected={relationDirected}
                        relationWeight={relationWeight}
                        onRelationTypeChange={setRelationType}
                        onRelationDirectedChange={setRelationDirected}
                        onRelationWeightChange={setRelationWeight}
                        onNodeUpdate={async (nodeId, position) => {
                            if (!course) return;
                            try {
                                const node = nodes.find(n => n.id === nodeId);
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
                                console.error('Failed to update node position:', err);
                            }
                        }}
                    />
                </div>

                {/* 节点 / 关系详情浮动面板 */}
                {(selectedNode || selectedRelation) && (
                    <div className="node-details-panel">
                        <div className="node-details-header">
                            <h3>{selectedNode ? '节点详情' : '关系详情'}</h3>
                            <button
                                onClick={() => {
                                    setSelectedNode(null);
                                    setEditingNode(null);
                                    setSelectedRelation(null);
                                }}
                                className="btn-icon"
                                aria-label="关闭"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {selectedNode ? (
                            editingNode && editingNode.id === selectedNode.id ? (
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
                            )
                        ) : selectedRelation ? (
                            editingRelation && editingRelation.id === selectedRelation.id ? (
                                <div className="node-edit-form">
                                    <div className="form-group">
                                        <label className="form-label">关系类型:</label>
                                        <select
                                            value={editRelationForm.type}
                                            onChange={(e) => setEditRelationForm({ ...editRelationForm, type: e.target.value as 'prerequisite' | 'related' | 'part_of' })}
                                            className="form-input"
                                        >
                                            <option value="prerequisite">前置 (prerequisite)</option>
                                            <option value="related">相关 (related)</option>
                                            <option value="part_of">包含 (part_of)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                id="relation-directed"
                                                checked={editRelationForm.directed}
                                                onChange={(e) => setEditRelationForm({ ...editRelationForm, directed: e.target.checked })}
                                                style={{ margin: 0, cursor: 'pointer', width: 'auto' }}
                                            />
                                            <label htmlFor="relation-directed" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>
                                                有向关系
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">权重:</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            value={editRelationForm.weight}
                                            onChange={(e) => setEditRelationForm({ ...editRelationForm, weight: Math.max(0, Math.min(1, Number(e.target.value) || 0)) })}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">从:</label>
                                        <span className="node-info-value">
                                            {nodes.find(n => n.id === selectedRelation.from)?.label || selectedRelation.from}
                                        </span>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">到:</label>
                                        <span className="node-info-value">
                                            {nodes.find(n => n.id === selectedRelation.to)?.label || selectedRelation.to}
                                        </span>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            onClick={handleSaveEditRelation}
                                            className="btn btn-primary btn-small"
                                        >
                                            保存
                                        </button>
                                        <button
                                            onClick={handleCancelEditRelation}
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
                                            <span className="node-info-label">类型:</span>
                                            <span className="node-info-value">
                                                {{
                                                    prerequisite: '前置 (prerequisite)',
                                                    related: '相关 (related)',
                                                    part_of: '包含 (part_of)',
                                                }[selectedRelation.type] || selectedRelation.type}
                                            </span>
                                        </div>
                                        <div className="node-info-item">
                                            <span className="node-info-label">方向:</span>
                                            <span className="node-info-value">
                                                {selectedRelation.directed ? '有向' : '无向'}
                                            </span>
                                        </div>
                                        <div className="node-info-item">
                                            <span className="node-info-label">权重:</span>
                                            <span className="node-info-value">{selectedRelation.weight ?? 0}</span>
                                        </div>
                                        <div className="node-info-item">
                                            <span className="node-info-label">从:</span>
                                            <span className="node-info-value">
                                                {nodes.find(n => n.id === selectedRelation.from)?.label || selectedRelation.from}
                                            </span>
                                        </div>
                                        <div className="node-info-item">
                                            <span className="node-info-label">到:</span>
                                            <span className="node-info-value">
                                                {nodes.find(n => n.id === selectedRelation.to)?.label || selectedRelation.to}
                                            </span>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="node-actions">
                                            <button
                                                onClick={() => handleStartEditRelation(selectedRelation)}
                                                className="btn btn-primary btn-small"
                                            >
                                                <Edit2 size={16} />
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRelation(selectedRelation.id!)}
                                                className="btn btn-danger btn-small"
                                            >
                                                <Trash2 size={16} />
                                                删除
                                            </button>
                                        </div>
                                    )}
                                </>
                            )
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraphView;
