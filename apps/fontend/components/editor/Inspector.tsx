import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { updateNode, deleteNode } from '../../store/editorSlice';
import { Trash2 } from 'lucide-react';
import { Node } from '../../types';

const Inspector: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedNodeId, nodes } = useSelector((state: RootState) => state.editor);
  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  const handleUpdate = (data: Partial<Node>) => {
    if (selectedNodeId) {
      dispatch(updateNode({ id: selectedNodeId, data }));
    }
  };
  
  const handleDelete = () => {
    if (selectedNodeId) {
        dispatch(deleteNode(selectedNodeId));
    }
  }

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-80 bg-gray-900/50 p-4 border-l border-white/10 flex flex-col z-20"
        >
          <h2 className="text-xl font-bold text-white mb-6">Inspector</h2>
          <div className="flex-grow space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">Node ID</label>
              <p className="text-xs text-gray-500 bg-gray-800 p-2 rounded">{selectedNode.id}</p>
            </div>
            <div>
              <label htmlFor="node-label" className="text-sm font-medium text-gray-400 block mb-1">Label</label>
              <input
                id="node-label"
                type="text"
                value={selectedNode.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">Type</label>
              <p className="text-sm text-white bg-gray-800 p-2 rounded">{selectedNode.type}</p>
            </div>
             {/* Add more fields here based on node type */}
          </div>
          <motion.button 
            onClick={handleDelete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-red-500/80 hover:bg-red-500 text-white font-semibold rounded-lg"
           >
            <Trash2 className="w-4 h-4" />
            Delete Node
           </motion.button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Inspector;