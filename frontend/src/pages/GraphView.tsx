import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Node, Relation } from '../types';
import { graphAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GraphCanvas from '../components/common/GraphCanvas';
import GroupPanel from '../components/common/GroupPanel';

const GraphView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const courseId = parseInt(id || '0');

    const [nodes, setNodes] = useState<Node[]>([]);
    const [relations, setRelations] = useState<Relation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [showNodeForm, setShowNodeForm] = useState(false);
    const [showRelationForm, setShowRelationForm] = useState(false);
    const [showGroupPanel, setShowGroupPanel] = useState(false);

    const { isAdmin } = useAuth();

    const [nodeForm, setNodeForm] = useState({
        label: '',
        type: '',
        description: '',
    });

    const [relationForm, setRelationForm] = useState({
        from: '',
        to: '',
        type: 'related',
        directed: true,
        weight: 0.5,
    });

    useEffect(() => {
        if (courseId) {
            fetchGraphData();
        }
    }, [courseId]);

    const fetchGraphData = async () => {
        try {
            setLoading(true);
            const [nodesResponse, relationsResponse] = await Promise.all([
                graphAPI.getNodes(courseId),
                graphAPI.getRelations(courseId)
            ]);
            setNodes(nodesResponse.data);
            setRelations(relationsResponse.data);
        } catch (err: any) {
            setError('获取知识图谱数据失败: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching graph data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const nodeData: Partial<Node> = {
                label: nodeForm.label,
            };
            if (nodeForm.type) nodeData.type = nodeForm.type;
            if (nodeForm.description) nodeData.description = nodeForm.description;

            await graphAPI.createNode(courseId, nodeData);
            setShowNodeForm(false);
            setNodeForm({ label: '', type: '', description: '' });
            fetchGraphData();
        } catch (err: any) {
            setError('创建节点失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCreateRelation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await graphAPI.createRelation(courseId, relationForm);
            setShowRelationForm(false);
            setRelationForm({ from: '', to: '', type: 'related', directed: true, weight: 0.5 });
            fetchGraphData();
        } catch (err: any) {
            setError('创建关系失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteNode = async (nodeId: string) => {
        if (window.confirm('确定要删除这个节点吗？这可能会影响相关的关系。')) {
            try {
                await graphAPI.deleteNode(courseId, nodeId);
                setSelectedNode(null);
                fetchGraphData();
            } catch (err: any) {
                setError('删除节点失败: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleDeleteRelation = async (relationId: string) => {
        if (window.confirm('确定要删除这个关系吗？')) {
            try {
                await graphAPI.deleteRelation(courseId, relationId);
                fetchGraphData();
            } catch (err: any) {
                setError('删除关系失败: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const getNodeConnections = (nodeId: string) => {
        const incoming = relations.filter(r => r.to === nodeId);
        const outgoing = relations.filter(r => r.from === nodeId);
        return { incoming, outgoing };
    };

    const getRelationTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            'prerequisite': '前置知识',
            'related': '相关概念',
            'part_of': '组成部分',
        };
        return types[type] || type;
    };

    if (loading) return <div className="loading">加载知识图谱中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="graph-view">
            <div className="page-header">
                <h1>知识图谱</h1>
                <div className="header-actions">
                    <Link to={`/courses/${courseId}`} className="btn btn-outline">
                        返回课程
                    </Link>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setShowNodeForm(true)}
                                className="btn btn-primary"
                            >
                                添加节点
                            </button>
                            <button
                                onClick={() => setShowRelationForm(true)}
                                className="btn btn-primary"
                            >
                                添加关系
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setShowGroupPanel(!showGroupPanel)}
                        className="btn btn-secondary"
                    >
                        {showGroupPanel ? '隐藏分组面板' : '📦 分组管理'}
                    </button>
                </div>
            </div>

            {/* 节点创建表单 */}
            {showNodeForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>创建新节点</h3>
                        <form onSubmit={handleCreateNode}>
                            <div className="form-group">
                                <label>节点标签:</label>
                                <input
                                    type="text"
                                    value={nodeForm.label}
                                    onChange={(e) => setNodeForm({ ...nodeForm, label: e.target.value })}
                                    required
                                    placeholder="输入节点名称"
                                />
                            </div>
                            <div className="form-group">
                                <label>节点类型:</label>
                                <input
                                    type="text"
                                    value={nodeForm.type}
                                    onChange={(e) => setNodeForm({ ...nodeForm, type: e.target.value })}
                                    placeholder="例如: concept, topic"
                                />
                            </div>
                            <div className="form-group">
                                <label>描述:</label>
                                <textarea
                                    value={nodeForm.description}
                                    onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })}
                                    rows={3}
                                    placeholder="输入节点描述（可选）"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">创建</button>
                                <button
                                    type="button"
                                    onClick={() => setShowNodeForm(false)}
                                    className="btn btn-outline"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 关系创建表单 */}
            {showRelationForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>创建新关系</h3>
                        <form onSubmit={handleCreateRelation}>
                            <div className="form-group">
                                <label>起始节点:</label>
                                <select
                                    value={relationForm.from}
                                    onChange={(e) => setRelationForm({ ...relationForm, from: e.target.value })}
                                    required
                                    aria-label="选择起始节点"
                                >
                                    <option value="">选择起始节点</option>
                                    {nodes.map(node => (
                                        <option key={node.id} value={node.id}>{node.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>目标节点:</label>
                                <select
                                    value={relationForm.to}
                                    onChange={(e) => setRelationForm({ ...relationForm, to: e.target.value })}
                                    required
                                    aria-label="选择目标节点"
                                >
                                    <option value="">选择目标节点</option>
                                    {nodes.map(node => (
                                        <option key={node.id} value={node.id}>{node.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>关系类型:</label>
                                <select
                                    value={relationForm.type}
                                    onChange={(e) => setRelationForm({ ...relationForm, type: e.target.value })}
                                    aria-label="选择关系类型"
                                >
                                    <option value="prerequisite">前置知识</option>
                                    <option value="related">相关概念</option>
                                    <option value="part_of">组成部分</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={relationForm.directed}
                                        onChange={(e) => setRelationForm({ ...relationForm, directed: e.target.checked })}
                                        aria-label="有向关系"
                                    />
                                    有向关系
                                </label>
                            </div>
                            <div className="form-group">
                                <label>权重 (0-1):</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={relationForm.weight}
                                    onChange={(e) => setRelationForm({ ...relationForm, weight: parseFloat(e.target.value) })}
                                    placeholder="0.5"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">创建</button>
                                <button
                                    type="button"
                                    onClick={() => setShowRelationForm(false)}
                                    className="btn btn-outline"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="graph-container">
                {showGroupPanel && (
                    <div className="graph-sidebar group-panel-sidebar">
                        <GroupPanel
                            nodes={nodes}
                            onGroupCreate={(group) => console.log('创建分组:', group)}
                            onGroupDelete={(groupId) => console.log('删除分组:', groupId)}
                        />
                    </div>
                )}

                <div className="graph-sidebar">
                    <h3>节点列表 ({nodes.length})</h3>
                    <div className="nodes-list">
                        {nodes.map(node => {
                            const connections = getNodeConnections(node.id!);
                            return (
                                <div
                                    key={node.id}
                                    className={`node-item ${selectedNode?.id === node.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedNode(node)}
                                >
                                    <div className="node-label">{node.label}</div>
                                    {node.type && <div className="node-type">{node.type}</div>}
                                    <div className="node-connections">
                                        入度: {connections.incoming.length} | 出度: {connections.outgoing.length}
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNode(node.id!);
                                            }}
                                            className="btn btn-danger btn-small"
                                        >
                                            删除
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="graph-main">
                    <div className="graph-visualization">
                        <GraphCanvas
                            nodes={nodes}
                            relations={relations}
                            onNodeClick={setSelectedNode}
                            selectedNodeId={selectedNode?.id}
                            editable={isAdmin}
                        />
                    </div>

                    {selectedNode && (
                        <div className="node-details">
                            <h3>节点详情</h3>
                            <div className="detail-item">
                                <strong>标签:</strong> {selectedNode.label}
                            </div>
                            {selectedNode.type && (
                                <div className="detail-item">
                                    <strong>类型:</strong> {selectedNode.type}
                                </div>
                            )}
                            {selectedNode.description && (
                                <div className="detail-item">
                                    <strong>描述:</strong> {selectedNode.description}
                                </div>
                            )}
                            <div className="detail-item">
                                <strong>ID:</strong> {selectedNode.id}
                            </div>

                            {/* 显示相关关系 */}
                            <div className="node-relations">
                                <h4>相关关系</h4>
                                {(() => {
                                    const { incoming, outgoing } = getNodeConnections(selectedNode.id!);
                                    return (
                                        <>
                                            {outgoing.length > 0 && (
                                                <div className="relations-section">
                                                    <strong>出边 ({outgoing.length}):</strong>
                                                    {outgoing.map(rel => {
                                                        const targetNode = nodes.find(n => n.id === rel.to);
                                                        return (
                                                            <div key={rel.id} className="relation-item">
                                                                → {targetNode?.label || rel.to} ({getRelationTypeLabel(rel.type)})
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {incoming.length > 0 && (
                                                <div className="relations-section">
                                                    <strong>入边 ({incoming.length}):</strong>
                                                    {incoming.map(rel => {
                                                        const sourceNode = nodes.find(n => n.id === rel.from);
                                                        return (
                                                            <div key={rel.id} className="relation-item">
                                                                ← {sourceNode?.label || rel.from} ({getRelationTypeLabel(rel.type)})
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {incoming.length === 0 && outgoing.length === 0 && (
                                                <p className="no-relations">此节点暂无关联关系</p>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <button
                                onClick={() => setSelectedNode(null)}
                                className="btn btn-outline"
                            >
                                关闭
                            </button>
                        </div>
                    )}
                </div>

                {/* 关系列表侧边栏 */}
                <div className="graph-sidebar relations-sidebar">
                    <h3>关系列表 ({relations.length})</h3>
                    <div className="relations-list">
                        {relations.length === 0 ? (
                            <p className="empty-message">暂无关系</p>
                        ) : (
                            relations.map(relation => {
                                const fromNode = nodes.find(n => n.id === relation.from);
                                const toNode = nodes.find(n => n.id === relation.to);
                                return (
                                    <div key={relation.id} className="relation-card">
                                        <div className="relation-nodes">
                                            <span className="node-name">{fromNode?.label || relation.from}</span>
                                            <span className="relation-arrow">
                                                {relation.directed ? '→' : '↔'}
                                            </span>
                                            <span className="node-name">{toNode?.label || relation.to}</span>
                                        </div>
                                        <div className="relation-type">
                                            {getRelationTypeLabel(relation.type)}
                                        </div>
                                        {relation.weight !== undefined && (
                                            <div className="relation-weight">
                                                权重: {relation.weight.toFixed(2)}
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteRelation(relation.id!)}
                                                className="btn btn-danger btn-small"
                                            >
                                                删除
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphView;