import React, { useRef, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { addNode, moveNode, loadWorkflow } from "../../store/editorSlice";
import {NodeComponent} from "./NodeComponent";
import EdgeComponent from "./Edge";
import { NodeType, Node } from "../../types";

import ReactFlow, {
  Node as node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from "reactflow";

const nodeTypes = {
  custom: [],
};

const WorkflowCanvas: React.FC = () => {
  const dispatch = useDispatch();
  const { nodes, edges } = useSelector((state: RootState) => state.editor);

  const canvasRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------
        ZOOM + PAN STATE
  ------------------------------------ */
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));

  //===============================================

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback((connection: Connection) => {
    setRfEdges((eds) => addEdge(connection, eds));
  }, []);

  const onNodeClick = useCallback((event: any, node: any) => {
    console.log("Node clicked:", node);
  }, []);

  const nodeTypes = {
    customNode: NodeComponent, // Use your custom Node here
  };

  //=============================================

  /* ------------------------------------
        FIXED: WHEEL ZOOM (mouse-centered)
  ------------------------------------ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.min(Math.max(zoom + delta, 0.3), 2.5);

      // Keep zoom centered on mouse
      setOffset((prev) => ({
        x: mouseX - ((mouseX - prev.x) * newZoom) / zoom,
        y: mouseY - ((mouseY - prev.y) * newZoom) / zoom,
      }));

      setZoom(newZoom);
    };

    canvas.addEventListener("wheel", wheelHandler, { passive: false });
    return () => canvas.removeEventListener("wheel", wheelHandler);
  }, [zoom, offset]);

  /* ------------------------------------
        PAN CANVAS (drag background)
  ------------------------------------ */
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".node")) return;

    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    lastPos.current = { x: e.clientX, y: e.clientY };

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  /* ------------------------------------
        LOAD WORKFLOW FROM SESSION
  ------------------------------------ */
  function convertStepsToWorkflow(sortedArray: any[]) {
    const nodes: Record<string, any> = {};
    const edges: any[] = [];

    const startX = 1000;
    const startY = 80;
    const xGap = 300;
    const yGap = 160;

    sortedArray.forEach((step, index) => {
      const id = String(step.id);
      nodes[id] = {
        id,
        type: step.name,
        label:
          step.index === 0 ? `${step.name} TRIGGER` : `${step.name} ACTION`,
        x: startX + (index * xGap - (sortedArray.length * xGap) / 2),
        y: startY + index * yGap,
        metadata: step.meta_data || {},
      };

      if (index > 0) {
        const prevId = String(sortedArray[index - 1].id);
        edges.push({
          id: `edge-${prevId}-${id}`,
          from: prevId,
          to: id,
        });
      }
    });

    return {
      workflowId: null,
      workflowName: "Untitled Workflow",
      nodes,
      edges,
      selectedNodeId: null,
      connectMode: null,
    };
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("user_privious_step");
    if (!raw) return;

    const sorted = JSON.parse(raw)?.sort((a, b) => a.index - b.index);
    const workflowState = convertStepsToWorkflow(sorted);

    // @ts-ignore
    dispatch(loadWorkflow(workflowState));
  }, []);

  /* ------------------------------------
        ADD NODE BY DROP
  ------------------------------------ */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const bounds = canvasRef.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;

      if (!type || !bounds) return;

      const position = {
        x: (event.clientX - bounds.left - offset.x) / zoom,
        y: (event.clientY - bounds.top - offset.y) / zoom,
      };

      dispatch(addNode({ type, x: position.x, y: position.y }));
    },
    [dispatch, zoom, offset]
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleNodeMove = useCallback(
    (id: string, x: number, y: number) => {
      const node = nodes[id];
      if (node) {
        const deltaX = x - node.x;
        const deltaY = y - node.y;
        const newX = node.x + deltaX / zoom;
        const newY = node.y + deltaY / zoom;
        dispatch(moveNode({ id, x: newX, y: newY }));
      }
    },
    [dispatch, nodes, zoom]
  );

  /* ------------------------------------
        RENDER
  ------------------------------------ */
  return (
    <div className="relative w-full h-full">
      {/* Zoom Buttons */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl"
        ></button>
      </div>
      
      
      <ReactFlow
        ref={canvasRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full overflow-hidden bg-grid relative"
        style={{
          cursor: dragging.current ? "grabbing" : "grab",
        }}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "0 0", // 🔥 FIX
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <svg className="absolute w-full h-full top-0 left-0 pointer-events-none">
            {edges.map((edge) => {
              const fromNode = nodes[edge.from];
              const toNode = nodes[edge.to];
              if (!fromNode || !toNode) return null;
              return (
                <EdgeComponent
                  key={edge.id}
                  edge={edge}
                  fromNode={fromNode}
                  toNode={toNode}
                />
              );
            })}
          </svg>

          {Object.values(nodes).map((node: Node) => (
            //@ts-ignore
            <NodeComponent key={node.id} node={node} onMove={handleNodeMove} />
          ))}
        </div>
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;


