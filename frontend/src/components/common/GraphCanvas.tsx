import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Node, Relation } from '../../types';

interface GraphCanvasProps {
    nodes: Node[];
    relations: Relation[];
    onNodeClick?: (node: Node) => void;
    onNodeUpdate?: (nodeId: string, position: { x: number; y: number }) => void;
    onNodeCreate?: (position: { x: number; y: number }) => void;
    onRelationCreate?: (from: string, to: string) => void;
    selectedNodeId?: string;
    editable?: boolean;
}

interface D3Node extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    type?: string;
    description?: string;
    group?: string;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
    id: string;
    source: string | D3Node;
    target: string | D3Node;
    type: string;
    directed?: boolean;
    weight?: number;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
    nodes,
    relations,
    onNodeClick,
    onNodeUpdate,
    onNodeCreate,
    onRelationCreate,
    selectedNodeId,
    editable = false,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [groupMode, setGroupMode] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
    const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
    const [tempLine, setTempLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

    useEffect(() => {
        if (!svgRef.current || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        // 创建主容器组
        const container = svg.append('g').attr('class', 'graph-container');

        // 设置缩放行为
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                container.attr('transform', event.transform);
                setTransform({ x: event.transform.x, y: event.transform.y, k: event.transform.k });
            })
            .filter((event) => {
                // 允许双击和拖拽，但阻止在拖拽节点时缩放
                return event.type === 'wheel' || (event.type === 'mousedown' && event.button === 0 && !draggingFrom);
            });

        svg.call(zoom);

        // 双击创建节点
        if (editable && onNodeCreate) {
            svg.on('dblclick', function(event) {
                event.preventDefault();
                const [x, y] = d3.pointer(event, svgRef.current);
                const transform = d3.zoomTransform(svgRef.current!);
                const worldX = (x - transform.x) / transform.k;
                const worldY = (y - transform.y) / transform.k;
                onNodeCreate({ x: worldX, y: worldY });
            });
        }

        // 转换数据格式
        const d3Nodes: D3Node[] = nodes.map(node => ({
            id: node.id!,
            label: node.label,
            type: node.type,
            description: node.description,
            group: node.type || 'default',
        }));

        const d3Links: D3Link[] = relations.map(rel => ({
            id: rel.id!,
            source: rel.from,
            target: rel.to,
            type: rel.type,
            directed: rel.directed,
            weight: rel.weight,
        }));

        // 创建力导向图模拟
        const simulation = d3.forceSimulation<D3Node>(d3Nodes)
            .force('link', d3.forceLink<D3Node, D3Link>(d3Links)
                .id(d => d.id)
                .distance(150)
                .strength(0.5))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(40));

        // 创建箭头标记
        const defs = container.append('defs');
        
        // 不同类型的箭头
        const arrowTypes = ['prerequisite', 'related', 'part_of'];
        const arrowColors = {
            prerequisite: '#e74c3c',
            related: '#3498db',
            part_of: '#2ecc71',
        };

        arrowTypes.forEach(type => {
            defs.append('marker')
                .attr('id', `arrow-${type}`)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 25)
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', arrowColors[type as keyof typeof arrowColors] || '#999');
        });

        // 绘制连接线
        const links = container.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(d3Links)
            .join('line')
            .attr('class', 'link')
            .attr('stroke', d => arrowColors[d.type as keyof typeof arrowColors] || '#999')
            .attr('stroke-width', d => (d.weight || 0.5) * 4)
            .attr('stroke-opacity', 0.6)
            .attr('marker-end', d => d.directed ? `url(#arrow-${d.type})` : null);

        // 临时线条（用于创建关系）
        const tempLinkGroup = container.append('g').attr('class', 'temp-links');

        // 连接线标签
        const linkLabels = container.append('g')
            .attr('class', 'link-labels')
            .selectAll('text')
            .data(d3Links)
            .join('text')
            .attr('class', 'link-label')
            .attr('font-size', '10px')
            .attr('fill', '#666')
            .attr('text-anchor', 'middle')
            .text(d => {
                const typeMap: { [key: string]: string } = {
                    prerequisite: '前置',
                    related: '相关',
                    part_of: '包含',
                };
                return typeMap[d.type] || d.type;
            });

        // 节点分组颜色
        const colorScale = d3.scaleOrdinal<string>()
            .domain(['concept', 'topic', 'skill', 'default'])
            .range(['#3498db', '#9b59b6', '#e67e22', '#95a5a6']);

        // 绘制节点组
        const nodeGroups = container.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(d3Nodes)
            .join('g')
            .attr('class', 'node-group')
            .call(d3.drag<SVGGElement, D3Node>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended) as any);

        // 节点圆圈
        nodeGroups.append('circle')
            .attr('r', 20)
            .attr('fill', d => colorScale(d.group || 'default'))
            .attr('stroke', d => d.id === selectedNodeId ? '#f39c12' : '#fff')
            .attr('stroke-width', d => d.id === selectedNodeId ? 4 : 2)
            .attr('class', 'node-circle')
            .style('cursor', 'pointer');

        // 节点标签
        nodeGroups.append('text')
            .attr('dy', 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#2c3e50')
            .text(d => d.label.length > 10 ? d.label.substring(0, 10) + '...' : d.label)
            .style('pointer-events', 'none');

        // 节点类型标签
        nodeGroups.append('text')
            .attr('dy', 50)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#7f8c8d')
            .text(d => d.type || '')
            .style('pointer-events', 'none');

        // 点击节点事件（使用 mousedown 而不是 click，避免与拖拽冲突）
        nodeGroups.on('mousedown', function(event, d) {
            // 如果是右键或中键，不处理
            if (event.button !== 0) return;
            
            event.stopPropagation();
            
            // 延迟处理，如果用户拖拽了节点，则不触发点击逻辑
            let isDragged = false;
            const startTime = Date.now();
            const startPos = { x: event.x, y: event.y };
            
            const handleMouseUp = (e: MouseEvent) => {
                const timeDiff = Date.now() - startTime;
                const posDiff = Math.abs(e.clientX - startPos.x) + Math.abs(e.clientY - startPos.y);
                
                // 如果时间很短且位置变化很小，认为是点击而不是拖拽
                if (timeDiff < 200 && posDiff < 5 && !isDragged) {
                    if (groupMode) {
                        // 分组模式：选择多个节点
                        const newSelected = new Set(selectedNodes);
                        if (newSelected.has(d.id)) {
                            newSelected.delete(d.id);
                        } else {
                            newSelected.add(d.id);
                        }
                        setSelectedNodes(newSelected);
                        
                        // 更新选中状态的视觉反馈
                        d3.select(event.currentTarget)
                            .select('circle')
                            .attr('stroke', newSelected.has(d.id) ? '#f39c12' : '#fff')
                            .attr('stroke-width', newSelected.has(d.id) ? 4 : 2);
                    } else if (editable && onRelationCreate) {
                        // 编辑模式：点击创建关系
                        if (!draggingFrom) {
                            // 开始创建关系
                            setDraggingFrom(d.id);
                            const node = d3Nodes.find(n => n.id === d.id);
                            if (node && node.x !== undefined && node.y !== undefined) {
                                setTempLine({ x1: node.x, y1: node.y, x2: node.x, y2: node.y });
                            }
                        } else if (draggingFrom !== d.id) {
                            // 点击另一个节点，创建关系
                            onRelationCreate(draggingFrom, d.id);
                            setDraggingFrom(null);
                            setTempLine(null);
                        } else {
                            // 点击同一个节点，取消创建关系
                            setDraggingFrom(null);
                            setTempLine(null);
                        }
                    } else {
                        // 普通模式：单击查看详情
                        if (onNodeClick) {
                            const node = nodes.find(n => n.id === d.id);
                            if (node) onNodeClick(node);
                        }
                    }
                }
                
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('mousemove', handleMouseMove);
            };
            
            const handleMouseMove = () => {
                isDragged = true;
            };
            
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
        });

        // 鼠标悬停效果
        nodeGroups.on('mouseenter', function(event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', 25);

            // 显示连接的边
            links
                .transition()
                .duration(200)
                .attr('stroke-opacity', link => {
                    const source = typeof link.source === 'object' ? link.source.id : link.source;
                    const target = typeof link.target === 'object' ? link.target.id : link.target;
                    return source === d.id || target === d.id ? 1 : 0.1;
                })
                .attr('stroke-width', link => {
                    const source = typeof link.source === 'object' ? link.source.id : link.source;
                    const target = typeof link.target === 'object' ? link.target.id : link.target;
                    return source === d.id || target === d.id ? (link.weight || 0.5) * 6 : (link.weight || 0.5) * 4;
                });
        });

        nodeGroups.on('mouseleave', function() {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', 20);

            links
                .transition()
                .duration(200)
                .attr('stroke-opacity', 0.6)
                .attr('stroke-width', d => (d.weight || 0.5) * 4);
        });

        // 更新位置
        function ticked() {
            links
                .attr('x1', d => (d.source as D3Node).x!)
                .attr('y1', d => (d.source as D3Node).y!)
                .attr('x2', d => (d.target as D3Node).x!)
                .attr('y2', d => (d.target as D3Node).y!);

            linkLabels
                .attr('x', d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
                .attr('y', d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

            nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
        }

        // 拖拽函数
        function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
            if (!event.active) simulation.alphaTarget(0);
            // 如果是可编辑模式，保持节点位置
            if (editable && onNodeUpdate) {
                onNodeUpdate(event.subject.id, { x: event.x, y: event.y });
            } else {
                // 释放固定位置
                event.subject.fx = null;
                event.subject.fy = null;
            }
        }

        // 更新临时线条
        function updateTempLine() {
            tempLinkGroup.selectAll('.temp-link').remove();
            if (tempLine && draggingFrom) {
                const fromNode = d3Nodes.find(n => n.id === draggingFrom);
                if (fromNode && fromNode.x !== undefined && fromNode.y !== undefined) {
                    tempLinkGroup.append('line')
                        .attr('class', 'temp-link')
                        .attr('x1', fromNode.x)
                        .attr('y1', fromNode.y)
                        .attr('x2', tempLine.x2)
                        .attr('y2', tempLine.y2)
                        .attr('stroke', '#667eea')
                        .attr('stroke-width', 3)
                        .attr('stroke-dasharray', '5,5')
                        .attr('opacity', 0.7)
                        .attr('pointer-events', 'none');
                }
            }
        }

        // 鼠标移动时更新临时线条
        if (editable && onRelationCreate) {
            svg.on('mousemove.temp', function(event) {
                if (draggingFrom) {
                    const [x, y] = d3.pointer(event, svgRef.current);
                    const transform = d3.zoomTransform(svgRef.current!);
                    const worldX = (x - transform.x) / transform.k;
                    const worldY = (y - transform.y) / transform.k;
                    setTempLine(prev => {
                        if (prev) {
                            return { ...prev, x2: worldX, y2: worldY };
                        }
                        const fromNode = d3Nodes.find(n => n.id === draggingFrom);
                        if (fromNode && fromNode.x !== undefined && fromNode.y !== undefined) {
                            return { x1: fromNode.x, y1: fromNode.y, x2: worldX, y2: worldY };
                        }
                        return null;
                    });
                }
            });

            svg.on('click.temp', function(event) {
                // 点击空白处取消创建关系
                const target = event.target as Element;
                if (draggingFrom && !target.closest('.node-group') && !target.closest('.node-circle')) {
                    setDraggingFrom(null);
                    setTempLine(null);
                }
            });
        }

        // 在 tick 中更新临时线条
        function tickedWithTemp() {
            ticked();
            updateTempLine();
        }

        simulation.on('tick', tickedWithTemp);

        // 初始化临时线条
        updateTempLine();

        // 清理
        return () => {
            simulation.stop();
            svg.on('dblclick', null);
            svg.on('mousemove.temp', null);
            svg.on('click.temp', null);
        };
    }, [nodes, relations, selectedNodeId, groupMode, editable, draggingFrom, tempLine, onNodeClick, onNodeUpdate, onNodeCreate, onRelationCreate]);

    const handleResetZoom = () => {
        const svg = d3.select(svgRef.current);
        svg.transition()
            .duration(750)
            .call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
    };

    const handleGroupSelected = () => {
        if (selectedNodes.size < 2) {
            alert('请至少选择两个节点进行分组');
            return;
        }
        // 这里可以实现分组逻辑，例如创建一个虚拟的分组节点
        console.log('分组节点:', Array.from(selectedNodes));
        setSelectedNodes(new Set());
        setGroupMode(false);
    };

    return (
        <div className="graph-canvas-container">
            <div className="graph-controls">
                <button
                    className={`control-btn ${groupMode ? 'active' : ''}`}
                    onClick={() => setGroupMode(!groupMode)}
                    title="分组模式"
                >
                    {groupMode ? '✓ 分组模式' : '分组模式'}
                </button>
                {groupMode && selectedNodes.size > 0 && (
                    <button
                        className="control-btn"
                        onClick={handleGroupSelected}
                        title="创建分组"
                    >
                        创建分组 ({selectedNodes.size})
                    </button>
                )}
                <button
                    className="control-btn"
                    onClick={handleResetZoom}
                    title="重置视图"
                >
                    🔄 重置视图
                </button>
                <div className="zoom-info">
                    缩放: {(transform.k * 100).toFixed(0)}%
                </div>
            </div>

            <svg
                ref={svgRef}
                className="graph-canvas"
                style={{ width: '100%', height: '100%' }}
            />

            <div className="graph-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#3498db' }}></div>
                    <span>概念 (Concept)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#9b59b6' }}></div>
                    <span>主题 (Topic)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: '#e67e22' }}></div>
                    <span>技能 (Skill)</span>
                </div>
            </div>

            <div className="graph-help">
                <p>💡 <strong>操作提示：</strong></p>
                <ul>
                    <li>🖱️ 拖拽节点来重新布局</li>
                    <li>🔍 滚轮缩放画布</li>
                    <li>👆 点击节点查看详情</li>
                    {editable && (
                        <>
                            <li>🖱️ 双击画布创建新节点</li>
                            <li>🔗 点击一个节点，再点击另一个节点创建关系</li>
                        </>
                    )}
                    <li>📦 开启分组模式后可选择多个节点</li>
                </ul>
            </div>
        </div>
    );
};

export default GraphCanvas;
