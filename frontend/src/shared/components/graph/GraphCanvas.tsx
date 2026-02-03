import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Node, Relation } from "@/shared/types";

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
  const token = {
    padding: 16,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    paddingLG: 24,
    marginXXS: 4,
    marginXS: 8,
    marginSM: 12,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    fontSizeSM: 14,
    colorText: "rgba(0,0,0,0.88)",
    colorTextSecondary: "rgba(0,0,0,0.65)",
    colorBorder: "rgba(0,0,0,0.15)",
    colorBgContainer: "oklch(0.985 0.012 85)",
  } as const;

  const svgRef = useRef<SVGSVGElement>(null);
  const [, setTransform] = useState({ x: 0, y: 0, k: 1 });
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
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        container.attr("transform", String(event.transform));
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        });
      })
      .filter((event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
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
      svg.on("dblclick.create-node", function (event: MouseEvent) {
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
        const svgEl = svgRef.current;
        if (!svgEl) return;
        const [x, y] = d3.pointer(event, svgEl);
        const zoomTransform = d3.zoomTransform(svgEl);
        const worldX = (x - zoomTransform.x) / zoomTransform.k;
        const worldY = (y - zoomTransform.y) / zoomTransform.k;
        onNodeCreate({ x: worldX, y: worldY });
      });
    }

    // 转换数据格式，从meta中读取位置信息
    const d3Nodes: D3Node[] = nodes.map((node) => {
      const meta = node.meta ?? {};
      const nodeId = node.id ?? "";
      const d3Node: D3Node = {
        id: nodeId,
        label: node.label,
        type: node.type,
        description: node.description,
        group: node.type ?? "default",
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
      id: rel.id ?? "",
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
        (d) =>
          (arrowColors[d.type as keyof typeof arrowColors] as
            | string
            | undefined) ?? "#999",
      )
      .attr("stroke-width", (d) => {
        const base = (d.weight ?? 0.5) * 4;
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
        const typeMap: Record<string, string> = {
          prerequisite: "前置",
          related: "相关",
          part_of: "包含",
        };
        return typeMap[d.type] ?? d.type;
      });

    links.on("click", function (event: MouseEvent, d: D3Link) {
      event.stopPropagation();
      handleRelationSelect(d.id);
    });

    linkLabels.on("click", function (event: MouseEvent, d: D3Link) {
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
          .on("end", dragended),
      );

    // 节点圆圈
    nodeGroups
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => colorScale(d.group ?? "default"))
      .attr("stroke", (d) =>
        d.id === selectedNodeId ? "#f39c12" : "oklch(0.97 0.01 85)",
      )
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
      .text((d) => d.type ?? "")
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

    nodeGroups.on("mousedown", function (event: MouseEvent, d: D3Node) {
      // 如果是右键或中键，不处理
      if (event.button !== 0) return;

      event.stopPropagation();

      // 如果按住Ctrl键，准备创建关系
      if (event.ctrlKey && editable && onRelationCreate) {
        const node = d3Nodes.find((n) => n.id === d.id);
        draggingFromRef.current = d.id;
        if (node?.x !== undefined && node.y !== undefined) {
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
    nodeGroups.on("click", function (event: MouseEvent, d: D3Node) {
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
    nodeGroups.on("mouseenter", function (_event: MouseEvent, d: D3Node) {
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
            ? (link.weight ?? 0.5) * 6
            : (link.weight ?? 0.5) * 4;
        });
    });

    nodeGroups.on("mouseleave", function (_event: MouseEvent, d: D3Node) {
      if (draggingFromRef.current && draggingFromRef.current !== d.id) {
        // 恢复目标节点样式
        d3.select(this)
          .select("circle")
          .transition()
          .duration(150)
          .attr("r", 20)
          .attr(
            "stroke",
            d.id === selectedNodeId ? "#f39c12" : "oklch(0.97 0.01 85)",
          )
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
        .attr("stroke-width", (d) => (d.weight ?? 0.5) * 4);
    });

    // 处理Ctrl+点击创建关系
    if (editable && onRelationCreate) {
      // 在节点上释放鼠标时创建关系
      nodeGroups.on("mouseup", function (event: MouseEvent, d: D3Node) {
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
      const getX = (n: D3Node): number => n.x ?? 0;
      const getY = (n: D3Node): number => n.y ?? 0;
      links
        .attr("x1", (d) => getX(d.source as D3Node))
        .attr("y1", (d) => getY(d.source as D3Node))
        .attr("x2", (d) => getX(d.target as D3Node))
        .attr("y2", (d) => getY(d.target as D3Node));

      linkLabels
        .attr(
          "x",
          (d) => (getX(d.source as D3Node) + getX(d.target as D3Node)) / 2,
        )
        .attr(
          "y",
          (d) => (getY(d.source as D3Node) + getY(d.target as D3Node)) / 2,
        );

      nodeGroups.attr(
        "transform",
        (d) => `translate(${String(d.x ?? 0)},${String(d.y ?? 0)})`,
      );
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
        if (fromNode?.x !== undefined && fromNode.y !== undefined) {
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
      svg.on("mousemove.temp", function (event: MouseEvent) {
        const svgEl = svgRef.current;
        if (!draggingFromRef.current || !svgEl) return;
        const [x, y] = d3.pointer(event, svgEl);
        const zoomTransform = d3.zoomTransform(svgEl);
        const worldX = (x - zoomTransform.x) / zoomTransform.k;
        const worldY = (y - zoomTransform.y) / zoomTransform.k;
        const fromNode = d3Nodes.find((n) => n.id === draggingFromRef.current);
        if (fromNode?.x !== undefined && fromNode.y !== undefined) {
          tempLineRef.current = {
            x1: fromNode.x,
            y1: fromNode.y,
            x2: worldX,
            y2: worldY,
          };
          updateTempLine();
        }
      });

      svg.on("click.temp", function (event: MouseEvent) {
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
    svg.on("click.deselect", function (event: MouseEvent) {
      const target = event.target as Element;
      const svgEl = svgRef.current;
      // 如果点击的是画布背景（不是节点、边或标签）
      if (
        !svgEl ||
        (target !== svgEl &&
          target.tagName !== "svg" &&
          !(
            target.tagName === "g" &&
            target.classList.contains("graph-container")
          ))
      ) {
        return;
      }
      const [x, y] = d3.pointer(event, svgEl);
      const rect = svgEl.getBoundingClientRect();
      const clickedElement = document.elementFromPoint(
        x + rect.left,
        y + rect.top,
      );
      if (clickedElement) {
        const isBackground =
          !clickedElement.closest(".node-group") &&
          !clickedElement.closest(".link") &&
          !clickedElement.closest(".link-label") &&
          !clickedElement.closest(".graph-controls") &&
          !clickedElement.closest(".node-details-panel") &&
          !clickedElement.closest(".graph-legend") &&
          !clickedElement.closest(".graph-help");
        if (isBackground) onDeselect?.();
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
    background: "oklch(0.97 0.012 85)",
    borderRadius: token.borderRadiusLG,
    overflow: "hidden",
  };

  const canvasStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: "oklch(0.97 0.012 85)",
    borderRadius: token.borderRadiusLG,
  };

  const bottomPanelStyle: React.CSSProperties = {
    position: "absolute",
    bottom: token.padding,
    left: token.padding,
    background: "oklch(0.985 0.012 85 / 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
    zIndex: 100,
    maxWidth: 360,
    fontSize: token.fontSizeSM,
    lineHeight: 1.6,
    color: "#475569",
  };

  const legendColorStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "2px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  };

  const legendTitleStyle: React.CSSProperties = {
    marginBottom: token.marginSM,
    fontWeight: 600,
    color: token.colorText,
  };

  const legendDotWrapStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: token.paddingXS,
    marginRight: token.marginSM,
    fontSize: token.fontSizeSM,
    color: "#475569",
  };

  const legendDotWrapStyleRight: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: token.paddingXS,
    fontSize: token.fontSizeSM,
    color: "#475569",
  };

  const legendHelpTextStyle: React.CSSProperties = {
    color: "#64748b",
    fontSize: token.fontSizeSM,
  };

  return (
    <div style={containerStyle}>
      <svg ref={svgRef} style={canvasStyle} />

      <div style={bottomPanelStyle}>
        <div style={legendTitleStyle}>图例与操作</div>
        <div style={{ marginBottom: token.marginXS }}>
          <span style={{ color: "#64748b", marginRight: token.marginXS }}>
            节点类型：
          </span>
          <span style={legendDotWrapStyle}>
            <span style={{ ...legendColorStyle, background: "#3498db" }} /> 概念
          </span>
          <span style={legendDotWrapStyle}>
            <span style={{ ...legendColorStyle, background: "#9b59b6" }} /> 主题
          </span>
          <span style={legendDotWrapStyleRight}>
            <span style={{ ...legendColorStyle, background: "#e67e22" }} /> 技能
          </span>
        </div>
        <div style={legendHelpTextStyle}>
          拖拽移动节点 · 滚轮缩放 · 点击节点查看详情
          {editable ? " · 双击画布新建节点 · Ctrl+点击两节点创建关系" : ""}
        </div>
      </div>
    </div>
  );
};

export default GraphCanvas;
