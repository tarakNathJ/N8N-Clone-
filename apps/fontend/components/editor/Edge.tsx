import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edge } from '../../types';
import { RootState } from '../../store/store';
import { motion } from 'framer-motion';
import { deleteEdge } from '../../store/editorSlice';
import { X } from 'lucide-react';

interface EdgeProps {
  edge: Edge;
}

const EdgeComponent: React.FC<EdgeProps> = ({ edge }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const { from, to } = edge;
  const fromNode = useSelector((state: RootState) => state.editor.nodes[from]);
  const toNode = useSelector((state: RootState) => state.editor.nodes[to]);

  if (!fromNode || !toNode) {
    return null;
  }

  const nodeWidth = 192; // 12rem (w-48)
  const nodeHeight = 64; // 4rem (h-16)

  const startX = fromNode.x + nodeWidth;
  const startY = fromNode.y + nodeHeight / 2;
  const endX = toNode.x;
  const endY = toNode.y + nodeHeight / 2;

  const dx = endX - startX;
  const path = `M ${startX} ${startY} C ${startX + dx * 0.5} ${startY}, ${endX - dx * 0.5} ${endY}, ${endX} ${endY}`;

  const midX = (startX + endX) / 2 + (dx * 0.5 * 0.75 - dx * 0.5 * 0.75) / 2;
  const midY = startY + (endY - startY) * 0.5;


  return (
    <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <motion.path
        d={path}
        fill="none"
        stroke={isHovered ? '#81b8f5' : '#6b7280'}
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
       <path d={path} fill="none" stroke="transparent" strokeWidth="20" className="cursor-pointer" onClick={() => dispatch(deleteEdge(edge.id))} />
      
      {isHovered && (
        <foreignObject x={midX - 12} y={midY - 12} width="24" height="24">
            <button
              onClick={() => dispatch(deleteEdge(edge.id))}
              className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
            >
              <X size={16} />
            </button>
        </foreignObject>
      )}
    </g>
  );
};

export default EdgeComponent;