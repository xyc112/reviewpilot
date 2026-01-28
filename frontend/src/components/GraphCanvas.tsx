import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { theme } from "antd";
import { Node, Relation } from "../types";

interface GraphCanvasProps {
  nodes: Node[];
  relations: Relation[];
  onNodeClick?: (node: Node) => void;
  onRelationClick?: (relation: Relation) => void;
  onDeselect?: () => void;
  onNodeUpdate?: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeCreate?: (position: { x: number; y: number }) => void;
  onRelationCreate?: (from: string, to: string) => void;
  selectedNodeId?: string;
  selectedRelationId?: string;
  editable?: boolean;
  relationType?: "prerequisite" | "related" | "part_of";
  relationDirected?: boolean;
  relationWeight?: number;
  onRelationTypeChange?: (type: "prerequisite" | "related" | "part_of") => void;
  onRelationDirectedChange?: (directed: boolean) => void;
  onRelationWeightChange?: (weight: number) => void;
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

const GraphCanvas = ({
  nodes,
  relations,
  onNodeClick,
  onRelationClick,
  onDeselect,
  onNodeUpdate,
  onNodeCreate,
  onRelationCreate,
  selectedNodeId,
  selectedRelationId,
  editable = false,
  relationType = "related",
  relationDirected = true,
  relationWeight = 0.5,
  onRelationTypeChange,
  onRelationDirectedChange,
  onRelationWeightChange,
}: GraphCanvasProps) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgLayout === "#000000";
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const draggingFromRef = useRef<string | null>(null);
  const tempLineRef = useRef<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // 创建主容器组
    const container = svg.append("g").attr("class", "graph-container");

    // 设置缩放行为
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        });
      })
      .filter((event) => {
        // 允许滚轮和拖拽，但阻止在拖拽节点时缩放
        // 双击事件不在filter中处理，由专门的双击处理器处理
        return (
          event.type === "wheel" ||
          (event.type === "mousedown" &&
            event.button === 0 &&
            !draggingFromRef.current)
        );
      });

    svg.call(zoom);

    // 双击创建节点
    if (editable && onNodeCreate) {
      svg.on("dblclick.create-node", function (event) {
        // 检查是否点击在节点上
        const target = event.target as Element;
        // 如果点击的是节点相关的元素，不创建新节点
        if (
          target.classList.contains("node-circle") ||
          target.classList.contains("node-group") ||
          target.closest(".node-group")
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        const [x, y] = d3.pointer(event, svgRef.current);
        const transform = d3.zoomTransform(svgRef.current!);
        const worldX = (x - transform.x) / transform.k;
        const worldY = (y - transform.y) / transform.k;
        onNodeCreate({ x: worldX, y: worldY });
      });
    }

    // 转换数据格式，从meta中读取位置信息
    const d3Nodes: D3Node[] = nodes.map((node) => {
      const meta = node.meta || {};
      const d3Node: D3Node = {
        id: node.id!,
        label: node.label,
        type: node.type,
        description: node.description,
        group: node.type || "default",
      };
      // 如果meta中有x和y坐标，使用它们
      if (typeof meta.x === "number" && typeof meta.y === "number") {
        d3Node.x = meta.x;
        d3Node.y = meta.y;
        d3Node.fx = meta.x; // 固定位置
        d3Node.fy = meta.y;
      }
      return d3Node;
    });

    const d3Links: D3Link[] = relations.map((rel) => ({
      id: rel.id!,
      source: rel.from,
      target: rel.to,
      type: rel.type,
      directed: rel.directed,
      weight: rel.weight,
    }));

    // 创建力导向图模拟
    const simulation = d3
      .forceSimulation<D3Node>(d3Nodes)
      .force(
        "link",
        d3
          .forceLink<D3Node, D3Link>(d3Links)
          .id((d) => d.id)
          .distance(150)
          .strength(0.5),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // 创建箭头标记
    const defs = container.append("defs");

    // 不同类型的箭头
    const arrowTypes = ["prerequisite", "related", "part_of"];
    const arrowColors = {
      prerequisite: "#e74c3c",
      related: "#3498db",
      part_of: "#2ecc71",
    };

    arrowTypes.forEach((type) => {
      defs
        .append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", arrowColors[type as keyof typeof arrowColors] || "#999");
    });

    // 绘制连接线
    const links = container
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(d3Links)
      .join("line")
      .attr("class", "link")
      .attr(
        "stroke",
        (d) => arrowColors[d.type as keyof typeof arrowColors] || "#999",
      )
      .attr("stroke-width", (d) => {
        const base = (d.weight || 0.5) * 4;
        return d.id === selectedRelationId ? base + 2 : base;
      })
      .attr("stroke-opacity", (d) => (d.id === selectedRelationId ? 0.9 : 0.6))
      .attr("marker-end", (d) => (d.directed ? `url(#arrow-${d.type})` : null));

    const handleRelationSelect = (relationId: string) => {
      if (!onRelationClick) return;
      const rel = relations.find((r) => r.id === relationId);
      if (rel) onRelationClick(rel);
    };

    // 临时线条（用于创建关系）
    const tempLinkGroup = container.append("g").attr("class", "temp-links");

    // 连接线标签
    const linkLabels = container
      .append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(d3Links)
      .join("text")
      .attr("class", "link-label")
      .attr("font-size", "10px")
      .attr("fill", (d) => (d.id === selectedRelationId ? "#2c3e50" : "#666"))
      .attr("font-weight", (d) =>
        d.id === selectedRelationId ? "bold" : "normal",
      )
      .attr("text-anchor", "middle")
      .text((d) => {
        const typeMap: { [key: string]: string } = {
          prerequisite: "前置",
          related: "相关",
          part_of: "包含",
        };
        return typeMap[d.type] || d.type;
      });

    links.on("click", function (event, d) {
      event.stopPropagation();
      handleRelationSelect(d.id);
    });

    linkLabels.on("click", function (event, d) {
      event.stopPropagation();
      handleRelationSelect(d.id);
    });

    // 节点分组颜色
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(["concept", "topic", "skill", "default"])
      .range(["#3498db", "#9b59b6", "#e67e22", "#95a5a6"]);

    // 绘制节点组
    const nodeGroups = container
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(d3Nodes)
      .join("g")
      .attr("class", "node-group")
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any,
      );

    // 节点圆圈
    nodeGroups
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => colorScale(d.group || "default"))
      .attr("stroke", (d) => (d.id === selectedNodeId ? "#f39c12" : "#fff"))
      .attr("stroke-width", (d) => (d.id === selectedNodeId ? 4 : 2))
      .attr("class", "node-circle")
      .style("cursor", "pointer");

    // 节点标签
    nodeGroups
      .append("text")
      .attr("dy", 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#2c3e50")
      .text((d) =>
        d.label.length > 10 ? d.label.substring(0, 10) + "..." : d.label,
      )
      .style("pointer-events", "none");

    // 节点类型标签
    nodeGroups
      .append("text")
      .attr("dy", 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#7f8c8d")
      .text((d) => d.type || "")
      .style("pointer-events", "none");

    // 节点点击和拖拽处理
    const nodeClickData = new Map<
      string,
      {
        startTime: number;
        startPos: { x: number; y: number };
        isDragged: boolean;
      }
    >();

    nodeGroups.on("mousedown", function (event, d) {
      // 如果是右键或中键，不处理
      if (event.button !== 0) return;

      event.stopPropagation();

      // 如果按住Ctrl键，准备创建关系
      if (event.ctrlKey && editable && onRelationCreate) {
        const node = d3Nodes.find((n) => n.id === d.id);
        draggingFromRef.current = d.id;
        if (node && node.x !== undefined && node.y !== undefined) {
          tempLineRef.current = {
            x1: node.x,
            y1: node.y,
            x2: node.x,
            y2: node.y,
          };
          updateTempLine();
        }
        return;
      }

      // 记录点击开始信息
      nodeClickData.set(d.id, {
        startTime: Date.now(),
        startPos: { x: event.clientX, y: event.clientY },
        isDragged: false,
      });
    });

    // 在节点组上添加点击事件处理（在拖拽结束后）
    nodeGroups.on("click", function (event, d) {
      // 如果按住Ctrl键，不处理点击
      if (event.ctrlKey) return;

      const clickInfo = nodeClickData.get(d.id);
      if (clickInfo) {
        const timeDiff = Date.now() - clickInfo.startTime;
        const posDiff =
          Math.abs(event.clientX - clickInfo.startPos.x) +
          Math.abs(event.clientY - clickInfo.startPos.y);

        // 如果时间很短且位置变化很小，认为是点击而不是拖拽
        if (timeDiff < 300 && posDiff < 8 && !clickInfo.isDragged) {
          event.stopPropagation();
          if (onNodeClick) {
            const node = nodes.find((n) => n.id === d.id);
            if (node) onNodeClick(node);
          }
        }
        nodeClickData.delete(d.id);
      }
    });

    // 鼠标悬停效果
    nodeGroups.on("mouseenter", function (event, d) {
      d3.select(this).select("circle").transition().duration(200).attr("r", 25);

      // 显示连接的边
      links
        .transition()
        .duration(200)
        .attr("stroke-opacity", (link) => {
          const source =
            typeof link.source === "object" ? link.source.id : link.source;
          const target =
            typeof link.target === "object" ? link.target.id : link.target;
          return source === d.id || target === d.id ? 1 : 0.1;
        })
        .attr("stroke-width", (link) => {
          const source =
            typeof link.source === "object" ? link.source.id : link.source;
          const target =
            typeof link.target === "object" ? link.target.id : link.target;
          return source === d.id || target === d.id
            ? (link.weight || 0.5) * 6
            : (link.weight || 0.5) * 4;
        });
    });

    nodeGroups.on("mouseleave", function (event, d) {
      if (draggingFromRef.current && draggingFromRef.current !== d.id) {
        // 恢复目标节点样式
        d3.select(this)
          .select("circle")
          .transition()
          .duration(150)
          .attr("r", 20)
          .attr("stroke", d.id === selectedNodeId ? "#f39c12" : "#fff")
          .attr("stroke-width", d.id === selectedNodeId ? 4 : 2);
      } else {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 20);
      }

      links
        .transition()
        .duration(200)
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", (d) => (d.weight || 0.5) * 4);
    });

    // 处理Ctrl+点击创建关系
    if (editable && onRelationCreate) {
      // 在节点上释放鼠标时创建关系
      nodeGroups.on("mouseup", function (event, d) {
        const from = draggingFromRef.current;
        if (from && from !== d.id && event.button === 0 && event.ctrlKey) {
          event.stopPropagation();
          onRelationCreate(from, d.id);
        }
        draggingFromRef.current = null;
        tempLineRef.current = null;
        updateTempLine();
      });
    }

    // 更新位置
    function ticked() {
      links
        .attr("x1", (d) => (d.source as D3Node).x!)
        .attr("y1", (d) => (d.source as D3Node).y!)
        .attr("x2", (d) => (d.target as D3Node).x!)
        .attr("y2", (d) => (d.target as D3Node).y!);

      linkLabels
        .attr(
          "x",
          (d) => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2,
        )
        .attr(
          "y",
          (d) => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2,
        );

      nodeGroups.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }

    // 拖拽函数
    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;

      // 标记为拖拽开始
      const clickInfo = nodeClickData.get(event.subject.id);
      if (clickInfo) {
        clickInfo.isDragged = true;
      }
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;

      // 标记为拖拽中
      const clickInfo = nodeClickData.get(event.subject.id);
      if (clickInfo) {
        clickInfo.isDragged = true;
      }
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
      tempLinkGroup.selectAll(".temp-link").remove();
      const draggingFrom = draggingFromRef.current;
      const tempLine = tempLineRef.current;
      if (tempLine && draggingFrom) {
        const fromNode = d3Nodes.find((n) => n.id === draggingFrom);
        if (fromNode && fromNode.x !== undefined && fromNode.y !== undefined) {
          tempLinkGroup
            .append("line")
            .attr("class", "temp-link")
            .attr("x1", fromNode.x)
            .attr("y1", fromNode.y)
            .attr("x2", tempLine.x2)
            .attr("y2", tempLine.y2)
            .attr("stroke", "#667eea")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.7)
            .attr("pointer-events", "none");
        }
      }
    }

    // 鼠标移动时更新临时线条
    if (editable && onRelationCreate) {
      svg.on("mousemove.temp", function (event) {
        if (draggingFromRef.current) {
          const [x, y] = d3.pointer(event, svgRef.current);
          const transform = d3.zoomTransform(svgRef.current!);
          const worldX = (x - transform.x) / transform.k;
          const worldY = (y - transform.y) / transform.k;
          const fromNode = d3Nodes.find(
            (n) => n.id === draggingFromRef.current,
          );
          if (
            fromNode &&
            fromNode.x !== undefined &&
            fromNode.y !== undefined
          ) {
            tempLineRef.current = {
              x1: fromNode.x,
              y1: fromNode.y,
              x2: worldX,
              y2: worldY,
            };
            updateTempLine();
          }
        }
      });

      svg.on("click.temp", function (event) {
        // 点击空白处取消创建关系
        const target = event.target as Element;
        if (
          draggingFromRef.current &&
          !target.closest(".node-group") &&
          !target.closest(".node-circle")
        ) {
          draggingFromRef.current = null;
          tempLineRef.current = null;
          updateTempLine();
        }
      });
    }

    // 点击空白区域清除选中状态
    svg.on("click.deselect", function (event) {
      const target = event.target as Element;
      // 如果点击的是画布背景（不是节点、边或标签）
      if (
        target === svgRef.current ||
        target.tagName === "svg" ||
        (target.tagName === "g" && target.classList.contains("graph-container"))
      ) {
        const [x, y] = d3.pointer(event, svgRef.current);
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const clickedElement = document.elementFromPoint(
            x + rect.left,
            y + rect.top,
          );
          const isBackground =
            clickedElement &&
            !clickedElement.closest(".node-group") &&
            !clickedElement.closest(".link") &&
            !clickedElement.closest(".link-label") &&
            !clickedElement.closest(".graph-controls") &&
            !clickedElement.closest(".node-details-panel") &&
            !clickedElement.closest(".graph-legend") &&
            !clickedElement.closest(".graph-help");
          if (isBackground) onDeselect?.();
        }
      }
    });

    // 在 tick 中更新临时线条
    function tickedWithTemp() {
      ticked();
      updateTempLine();
    }

    simulation.on("tick", tickedWithTemp);

    // 初始化临时线条
    updateTempLine();

    // 清理
    return () => {
      simulation.stop();
      svg.on("dblclick.create-node", null);
      svg.on("mousemove.temp", null);
      svg.on("click.temp", null);
      svg.on("click.deselect", null);
    };
  }, [
    nodes,
    relations,
    selectedNodeId,
    selectedRelationId,
    editable,
    relationType,
    relationDirected,
    relationWeight,
    onRelationTypeChange,
    onRelationDirectedChange,
    onRelationWeightChange,
    onNodeClick,
    onRelationClick,
    onDeselect,
    onNodeUpdate,
    onNodeCreate,
    onRelationCreate,
  ]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    background: isDark ? "#141414" : "#fafafa",
    borderRadius: token.borderRadiusLG,
    overflow: "hidden",
  };

  const controlsStyle: React.CSSProperties = {
    position: "absolute",
    top: token.padding,
    left: token.padding,
    background: isDark
      ? "rgba(20, 20, 20, 0.95)"
      : "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    boxShadow: isDark
      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.12)",
    display: "flex",
    flexDirection: "column",
    gap: token.paddingSM,
    zIndex: 100,
    minWidth: 200,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: token.fontSizeSM,
    fontWeight: 500,
    color: isDark ? token.colorTextSecondary : "#64748b",
    marginBottom: token.marginXXS,
  };

  const zoomInfoStyle: React.CSSProperties = {
    fontSize: token.fontSizeSM,
    color: isDark ? token.colorTextSecondary : "#64748b",
    padding: `${token.paddingXXS} ${token.paddingXS}`,
    background: isDark
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.04)",
    borderRadius: token.borderRadiusSM,
    textAlign: "center",
  };

  const canvasStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: isDark ? "#141414" : "#fafafa",
    borderRadius: token.borderRadiusLG,
  };

  const legendStyle: React.CSSProperties = {
    position: "absolute",
    bottom: token.padding,
    left: token.padding,
    background: isDark
      ? "rgba(20, 20, 20, 0.95)"
      : "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    boxShadow: isDark
      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.12)",
    zIndex: 100,
  };

  const legendItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: token.paddingXS,
    marginBottom: token.paddingXS,
    fontSize: token.fontSizeSM,
    color: isDark ? token.colorTextSecondary : "#475569",
  };

  const legendColorStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: `2px solid ${isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.8)"}`,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const helpStyle: React.CSSProperties = {
    position: "absolute",
    bottom: token.padding,
    right: token.padding,
    background: isDark
      ? "rgba(20, 20, 20, 0.95)"
      : "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    boxShadow: isDark
      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.12)",
    zIndex: 100,
    maxWidth: 280,
    fontSize: token.fontSizeSM,
    lineHeight: 1.6,
  };

  return (
    <div style={containerStyle}>
      <div style={controlsStyle}>
        {editable && onRelationCreate && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: token.marginXXS }}>
              <label style={labelStyle}>
                关系类型
              </label>
              <select
                value={relationType}
                onChange={(e) =>
                  onRelationTypeChange?.(
                    e.target.value as "prerequisite" | "related" | "part_of",
                  )
                }
                style={{
                  padding: `${token.paddingXXS} ${token.paddingXS}`,
                  borderRadius: token.borderRadiusSM,
                  border: `1px solid ${token.colorBorder}`,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  color: token.colorText,
                  cursor: "pointer",
                }}
              >
                <option value="prerequisite">前置</option>
                <option value="related">相关</option>
                <option value="part_of">包含</option>
              </select>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: token.marginXXS,
                fontSize: token.fontSizeSM,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={relationDirected}
                onChange={(e) => onRelationDirectedChange?.(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ color: isDark ? token.colorTextSecondary : "#64748b" }}>有向</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: token.marginXXS }}>
              <span style={{ fontSize: token.fontSizeSM, color: isDark ? token.colorTextSecondary : "#64748b" }}>权重</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={relationWeight}
                onChange={(e) =>
                  onRelationWeightChange?.(
                    Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                  )
                }
                style={{
                  width: 50,
                  padding: `${token.paddingXXS} ${token.paddingXS}`,
                  borderRadius: token.borderRadiusSM,
                  border: `1px solid ${token.colorBorder}`,
                  fontSize: token.fontSizeSM,
                  background: token.colorBgContainer,
                  color: token.colorText,
                }}
              />
            </div>
          </>
        )}
        <div style={zoomInfoStyle}>缩放: {(transform.k * 100).toFixed(0)}%</div>
      </div>

      <svg
        ref={svgRef}
        style={canvasStyle}
      />

      <div style={legendStyle}>
        <div style={legendItemStyle}>
          <div style={{ ...legendColorStyle, background: "#3498db" }}></div>
          <span>概念 (Concept)</span>
        </div>
        <div style={{ ...legendItemStyle, marginBottom: 0 }}>
          <div style={{ ...legendColorStyle, background: "#9b59b6" }}></div>
          <span>主题 (Topic)</span>
        </div>
        <div style={{ ...legendItemStyle, marginBottom: 0 }}>
          <div style={{ ...legendColorStyle, background: "#e67e22" }}></div>
          <span>技能 (Skill)</span>
        </div>
      </div>

      <div style={helpStyle}>
        <p style={{ margin: `0 0 ${token.marginXS} 0`, fontWeight: 600, color: token.colorText, fontSize: token.fontSizeSM }}>
          💡 <strong>操作提示：</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: token.paddingLG, color: isDark ? token.colorTextSecondary : "#64748b" }}>
          <li style={{ marginBottom: token.marginXXS }}>🖱️ 拖拽节点来重新布局</li>
          <li style={{ marginBottom: token.marginXXS }}>🔍 滚轮缩放画布</li>
          <li style={{ marginBottom: token.marginXXS }}>👆 点击节点查看详情</li>
          {editable && (
            <>
              <li style={{ marginBottom: token.marginXXS }}>🖱️ 双击画布创建新节点</li>
              <li style={{ marginBottom: 0 }}>🔗 Ctrl+点击节点，再点击另一个节点创建关系</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GraphCanvas;
