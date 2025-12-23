import React, { useState } from 'react';
import { Node } from '../../types';

interface NodeGroup {
    id: string;
    name: string;
    color: string;
    nodeIds: string[];
}

interface GroupPanelProps {
    nodes: Node[];
    onGroupCreate?: (group: NodeGroup) => void;
    onGroupDelete?: (groupId: string) => void;
}

const GroupPanel: React.FC<GroupPanelProps> = ({
    nodes,
    onGroupCreate,
    onGroupDelete,
}) => {
    const [groups, setGroups] = useState<NodeGroup[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3498db');
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

    const colors = [
        { name: '蓝色', value: '#3498db' },
        { name: '紫色', value: '#9b59b6' },
        { name: '绿色', value: '#2ecc71' },
        { name: '橙色', value: '#e67e22' },
        { name: '红色', value: '#e74c3c' },
        { name: '青色', value: '#1abc9c' },
        { name: '黄色', value: '#f39c12' },
        { name: '灰色', value: '#95a5a6' },
    ];

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) {
            alert('请输入分组名称');
            return;
        }
        if (selectedNodes.length === 0) {
            alert('请至少选择一个节点');
            return;
        }

        const newGroup: NodeGroup = {
            id: Date.now().toString(),
            name: newGroupName,
            color: selectedColor,
            nodeIds: selectedNodes,
        };

        setGroups([...groups, newGroup]);
        if (onGroupCreate) onGroupCreate(newGroup);

        // 重置表单
        setNewGroupName('');
        setSelectedNodes([]);
        setShowCreateForm(false);
    };

    const handleDeleteGroup = (groupId: string) => {
        // 简单的确认，因为这是本地状态管理
        if (confirm('确定要删除这个分组吗？')) {
            setGroups(groups.filter(g => g.id !== groupId));
            if (onGroupDelete) onGroupDelete(groupId);
        }
    };

    const toggleNodeSelection = (nodeId: string) => {
        setSelectedNodes(prev =>
            prev.includes(nodeId)
                ? prev.filter(id => id !== nodeId)
                : [...prev, nodeId]
        );
    };

    return (
        <div className="group-panel">
            <div className="group-panel-header">
                <h3>节点分组管理</h3>
                <button
                    className="btn btn-small btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? '取消' : '+ 创建分组'}
                </button>
            </div>

            {showCreateForm && (
                <div className="group-create-form">
                    <div className="form-group">
                        <label>分组名称:</label>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="例如：第一章核心概念"
                        />
                    </div>

                    <div className="form-group">
                        <label>分组颜色:</label>
                        <div className="color-picker">
                            {colors.map(color => (
                                <div
                                    key={color.value}
                                    className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                                    onClick={() => setSelectedColor(color.value)}
                                    title={color.name}
                                >
                                    <div className="color-circle" style={{ background: color.value }}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>选择节点 ({selectedNodes.length}):</label>
                        <div className="node-selector">
                            {nodes.map(node => (
                                <div
                                    key={node.id}
                                    className={`node-selector-item ${selectedNodes.includes(node.id!) ? 'selected' : ''}`}
                                    onClick={() => toggleNodeSelection(node.id!)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedNodes.includes(node.id!)}
                                        onChange={() => {}}
                                        aria-label={`选择节点 ${node.label}`}
                                    />
                                    <span>{node.label}</span>
                                    {node.type && <span className="node-type-badge">{node.type}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleCreateGroup}
                    >
                        创建分组
                    </button>
                </div>
            )}

            <div className="groups-list">
                {groups.length === 0 ? (
                    <p className="empty-message">暂无分组，点击"创建分组"开始</p>
                ) : (
                    groups.map(group => (
                        <div key={group.id} className="group-item">
                            <div className="group-header">
                                <div className="group-info">
                                    <div
                                        className="group-color-indicator"
                                        style={{ background: group.color }}
                                    ></div>
                                    <strong>{group.name}</strong>
                                    <span className="group-count">({group.nodeIds.length} 个节点)</span>
                                </div>
                                <button
                                    className="btn btn-small btn-danger"
                                    onClick={() => handleDeleteGroup(group.id)}
                                >
                                    删除
                                </button>
                            </div>
                            <div className="group-nodes">
                                {group.nodeIds.map(nodeId => {
                                    const node = nodes.find(n => n.id === nodeId);
                                    return node ? (
                                        <span key={nodeId} className="group-node-tag">
                                            {node.label}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GroupPanel;
