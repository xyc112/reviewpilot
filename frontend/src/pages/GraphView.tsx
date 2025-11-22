import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Node, Relation } from '../types';
import { graphAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
            // 直接创建对象，不使用 Partial<Node> 类型注解
            const nodeData = {
                label: nodeForm.label,
                ...(nodeForm.type && { type: nodeForm.type }),
                ...(nodeForm.description && { description: nodeForm.description }),
            };

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
        if (window.confirm('确定要删除这个节点吗？')) {
            try {
                await graphAPI.deleteNode(courseId, nodeId);
                fetchGraphData();
            } catch (err: any) {
                setError('删除节点失败: ' + (err.response?.data?.message || err.message));
            }
        }
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
                <div className="graph-sidebar">
                    <h3>节点列表</h3>
                    <div className="nodes-list">
                        {nodes.map(node => (
                            <div
                                key={node.id}
                                className={`node-item ${selectedNode?.id === node.id ? 'selected' : ''}`}
                                onClick={() => setSelectedNode(node)}
                            >
                                <div className="node-label">{node.label}</div>
                                {node.type && <div className="node-type">{node.type}</div>}
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
                        ))}
                    </div>
                </div>

                <div className="graph-main">
                    <div className="graph-visualization">
                        {/* 这里可以集成 D3.js、ECharts 或其他图形库 */}
                        <div className="graph-placeholder">
                            <h3>知识图谱可视化区域</h3>
                            <p>节点数量: {nodes.length}</p>
                            <p>关系数量: {relations.length}</p>
                            <p>这里将显示图形化的知识图谱</p>
                            <div className="graph-stats">
                                <div className="stat">
                                    <strong>节点类型分布:</strong>
                                    {Object.entries(
                                        nodes.reduce((acc: { [key: string]: number }, node) => {
                                            const type = node.type || '未分类';
                                            acc[type] = (acc[type] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([type, count]) => (
                                        <div key={type}>{type}: {count}</div>
                                    ))}
                                </div>
                                <div className="stat">
                                    <strong>关系类型分布:</strong>
                                    {Object.entries(
                                        relations.reduce((acc: { [key: string]: number }, rel) => {
                                            acc[rel.type] = (acc[rel.type] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([type, count]) => (
                                        <div key={type}>{type}: {count}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
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
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="btn btn-outline"
                            >
                                关闭
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GraphView;