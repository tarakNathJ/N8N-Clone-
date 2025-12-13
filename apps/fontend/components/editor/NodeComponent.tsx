import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Node } from '../../types';
import { motion } from 'framer-motion';
import { RootState } from '../../store/store';
import { setSelectedNodeId, startConnect, completeConnect } from '../../store/editorSlice';
import { Zap, ArrowRightLeft, Code, Settings, Clock, Link } from 'lucide-react';
import { NodeType } from '../../types';

interface NodeProps {
  node: Node;
  onMove: (id: string, x: number, y: number) => void;
}

const nodeIcons: Record<NodeType, React.ReactElement> = {
    [NodeType.Trigger]: <Zap className="w-5 h-5 text-yellow-400" />,
    [NodeType.HttpRequest]: <ArrowRightLeft className="w-5 h-5 text-sky-400" />,
    [NodeType.Function]: <Code className="w-5 h-5 text-emerald-400" />,
    [NodeType.Set]: <Settings className="w-5 h-5 text-purple-400" />,
    [NodeType.Delay]: <Clock className="w-5 h-5 text-orange-400" />,
};

const nodeColors: Record<NodeType, string> = {
    [NodeType.Trigger]: 'border-yellow-400',
    [NodeType.HttpRequest]: 'border-sky-400',
    [NodeType.Function]: 'border-emerald-400',
    [NodeType.Set]: 'border-purple-400',
    [NodeType.Delay]: 'border-orange-400',
};

export const NodeComponent: React.FC<NodeProps> = React.memo(({ node, onMove }) => {
  const dispatch = useDispatch();
  const { selectedNodeId, connectMode } = useSelector((state: RootState) => state.editor);
  const isSelected = selectedNodeId === node.id;
  const isConnectingFrom = connectMode?.fromNodeId === node.id;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectMode) {
      dispatch(completeConnect(node.id));
    } else {
      dispatch(setSelectedNodeId(node.id));
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => onMove(node.id, node.x + info.offset.x, node.y + info.offset.y)}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group absolute w-48 h-16 p-3 rounded-lg shadow-lg cursor-pointer flex items-center gap-3 border-2 ${nodeColors[node.type]} ${isSelected ? 'shadow-[#4295f1]/50 ring-2 ring-[#6cacf4]' : 'shadow-black/50'}`}
      style={{
        left: node.x,
        top: node.y,
        backgroundColor: '#2d3748', // bg-gray-700
      }}
      onClick={handleNodeClick}
    >
      <div className="flex-shrink-0">{nodeIcons[node.type]}</div>
      <div className="flex-grow">
        <p className="font-bold text-white truncate">{node.label}</p>
        <p className="text-xs text-gray-400">{node.type}</p>
      </div>

      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          dispatch(startConnect(node.id));
        }}
        className={`absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full border-2 border-gray-500 bg-gray-700 hover:bg-[#4295f1] hover:border-[#81b8f5] transition-all ${isConnectingFrom ? 'bg-[#57a1f2] animate-pulse' : ''}`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <Link className="w-3 h-3 text-white" />
      </motion.button>
    </motion.div>
  );
});
