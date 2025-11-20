import React, { useRef, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { addNode, moveNode, loadWorkflow ,type EditorState } from "../../store/editorSlice";
import NodeComponent from "./Node";
import EdgeComponent from "./Edge";
import { NodeType, Node } from "../../types";

const WorkflowCanvas: React.FC = () => {
  const dispatch = useDispatch();
  const { nodes, edges } = useSelector((state: RootState) => state.editor);

  const canvasRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------
      🔍 ZOOM STATE
  ------------------------------------ */
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => {
      const next = e.deltaY > 0 ? z - 0.05 : z + 0.05;
      return Math.min(Math.max(next, 0.3), 2.5);
    });
  };

  /* ------------------------------------
      CONVERT SESSION-STORED STEPS
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
        label: step.index === 0 ? `${step.name} TRIGGER` : `${step.name} ACTION`,
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
      NODE DRAG&DROP
  ------------------------------------ */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const bounds = canvasRef.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow") as NodeType;

      if (!type || !bounds) return;

      const position = {
        x: (event.clientX - bounds.left - 75) / zoom,
        y: (event.clientY - bounds.top - 25) / zoom,
      };

      dispatch(addNode({ type, x: position.x, y: position.y }));
    },
    [dispatch, zoom]
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleNodeMove = (id: string, x: number, y: number) => {
    dispatch(moveNode({ id, x, y }));
  };

  return (
    <div className="relative w-full h-full">
      {/* 🔍 ZOOM BUTTONS */}
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
        >
          –
        </button>
      </div>

      <div
        ref={canvasRef}
        onWheel={handleWheelZoom}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="w-full h-full overflow-hidden bg-grid relative"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* ZOOM WRAPPER */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "left top",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* EDGES */}
          <svg className="absolute w-full h-full top-0 left-0 pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
              </marker>
            </defs>

            {edges.map((edge) => (
              <EdgeComponent key={edge.id} edge={edge} />
            ))}
          </svg>

          {/* NODES */}
          {Object.values(nodes).map((node: Node) => (
            <NodeComponent key={node.id} node={node} onMove={handleNodeMove} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
