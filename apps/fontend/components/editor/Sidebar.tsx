import React from 'react';
import { NodeType } from '../../types';
import { motion } from 'framer-motion';
import { Zap, ArrowRightLeft, Code, Settings, Clock } from 'lucide-react';

const nodeTypes = [
  { type: NodeType.Trigger, icon: <Zap className="w-5 h-5 text-yellow-400" />, color: 'border-yellow-400' },
  { type: NodeType.HttpRequest, icon: <ArrowRightLeft className="w-5 h-5 text-sky-400" />, color: 'border-sky-400' },
  { type: NodeType.Function, icon: <Code className="w-5 h-5 text-emerald-400" />, color: 'border-emerald-400' },
  { type: NodeType.Set, icon: <Settings className="w-5 h-5 text-purple-400" />, color: 'border-purple-400' },
  { type: NodeType.Delay, icon: <Clock className="w-5 h-5 text-orange-400" />, color: 'border-orange-400' },
];

const Sidebar: React.FC = () => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
        e.dataTransfer.setData('application/reactflow', nodeType);
        e.dataTransfer.effectAllowed = 'move';
    };

  return (
    <aside className="w-60 bg-gray-900/50 p-4 border-r border-white/10 flex flex-col gap-4 z-20">
      <h2 className="text-lg font-bold text-white">Nodes</h2>
      <div className="flex flex-col gap-3">
        {nodeTypes.map(({ type, icon, color }) => (
          <motion.div
            key={type}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed ${color} bg-gray-800/50 cursor-grab active:cursor-grabbing`}
            draggable
            // FIX: Framer Motion's `onDragStart` type conflicts with the native `draggable`
            // attribute's event. Casting the event to `any` resolves the TypeScript error.
            onDragStart={(e: any) => handleDragStart(e, type)}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(55, 65, 81, 1)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {icon}
            <span className="font-semibold">{type}</span>
          </motion.div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;