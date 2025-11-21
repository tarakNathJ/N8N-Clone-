import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { getWorkflows } from '../utils/localStorage';
import { loadWorkflow, setSelectedNodeId, cancelConnect, setWorkflowName } from '../store/editorSlice';
import { setView } from '../store/navigationSlice';
import Sidebar from '../components/editor/Sidebar';
import WorkflowCanvas from '../components/editor/WorkflowCanvas';
import Inspector from '../components/editor/Inspector';
import { useAutoSave } from '../hooks/useAutoSave';
import { ArrowLeft, Play, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


interface EditorPageProps {
  workflowId: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ workflowId }) => {
  const navigator = useNavigate();
  const dispatch = useDispatch();
  const workflowName = useSelector((state: RootState) => state.editor.workflowName);
  useAutoSave();

  useEffect(() => {
    const workflows = getWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      dispatch(loadWorkflow(workflow));
    } else {
      dispatch(setView({ view: 'dashboard' }));
    }
  }, [workflowId, dispatch]);

  const handleCanvasClick = useCallback(() => {
    dispatch(setSelectedNodeId(null));
    dispatch(cancelConnect());
  }, [dispatch]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      <header className="flex items-center justify-between p-3 bg-gray-900/80 backdrop-blur-sm border-b border-white/10 z-30">
        <div className="flex items-center gap-4">
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigator("/dashboard")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => dispatch(setWorkflowName(e.target.value))}
            className="bg-transparent text-lg font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#4295f1] rounded px-2"
          />
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-green-400 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                Auto-saved
            </span>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4295f1] to-[#57a1f2] rounded-lg font-semibold"
          >
            <Play className="w-5 h-5" />
            Run
          </motion.button>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <Sidebar />
        <main className="flex-grow relative" onClick={handleCanvasClick}>
          <WorkflowCanvas />
        </main>
        <Inspector />
      </div>
    </div>
  );
};

export default EditorPage;