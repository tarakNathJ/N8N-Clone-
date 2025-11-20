import React, { useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { addNode, moveNode } from '../../store/editorSlice';
import NodeComponent from './Node';
import EdgeComponent from './Edge';
// FIX: Import 'Node' type to explicitly type the iterated node object.
import { NodeType, Node } from '../../types';
import { motion } from 'framer-motion';

const WorkflowCanvas: React.FC = () => {
  const dispatch = useDispatch();
  const { nodes, edges } = useSelector((state: RootState) => state.editor);
  console.log(nodes);
  console.log(edges);

  const canvasRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = canvasRef.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
  
      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }
  
      const position = {
        x: event.clientX - reactFlowBounds.left - 75, // Adjust for node width
        y: event.clientY - reactFlowBounds.top - 25, // Adjust for node height
      };
      
      dispatch(addNode({ type, x: position.x, y: position.y }));
    },
    [dispatch]
  );
  
  const onDragOver = (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
  };

  const handleNodeMove = (id: string, x: number, y: number) => {
    dispatch(moveNode({ id, x, y }));
  };

  return (
    <div
        ref={canvasRef}
        className="w-full h-full relative overflow-hidden bg-grid"
        style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
    >
      
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

      {/* FIX: Explicitly type 'node' as 'Node' to resolve type inference error. */}
      {Object.values(nodes).map((node: Node) => (
        <NodeComponent key={node.id} node={node} onMove={handleNodeMove} />
      ))}
    </div>
  );
};

export default WorkflowCanvas;
