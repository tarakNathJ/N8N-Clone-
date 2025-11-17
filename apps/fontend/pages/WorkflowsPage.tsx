import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setView } from '../store/navigationSlice';
import { loadWorkflows, createWorkflow, deleteWorkflow, duplicateWorkflow } from '../store/workflowsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Copy, Search, Sun, Bell, MoreVertical, Play, Filter, ChevronDown,
    Workflow as WorkflowIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { Workflow, NodeType } from '../types';
import DashboardSidebar from '../components/DashboardSidebar';

// Dropdown Menu Component
const Dropdown = ({ trigger, children }: { trigger: React.ReactNode, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMouseEnter = () => setIsOpen(true);
    const handleMouseLeave = () => setIsOpen(false);
    
    return (
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div>
                {trigger}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#373a3d] border border-gray-700 rounded-lg shadow-xl z-20"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const WorkflowCard = ({ wf, onEdit, onDelete, onDuplicate }: { wf: Workflow, onEdit: (id: string) => void, onDelete: (id: string) => void, onDuplicate: (id: string) => void }) => {
    
    const getTriggerInfo = () => {
        const triggerNode = Object.values(wf.nodes).find(node => node.type === NodeType.Trigger);
        if (triggerNode || Object.values(wf.nodes).some(n => n.type === NodeType.HttpRequest)) {
            if (wf.name.toLowerCase().includes('email')) return { tag: 'RESERVE_EMAIL', color: 'text-orange-400' };
            return { tag: 'WEBHOOK', color: 'text-red-400' };
        }
        return null;
    }
    const triggerInfo = getTriggerInfo();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="bg-[#2a2d30] p-4 rounded-xl border border-gray-700/50 hover:border-[#6cacf4]/50 transition-all group"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-[#81b8f5] transition-colors">{wf.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{format(new Date(wf.updated), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}</span>
                        {triggerInfo && (
                            <>
                                <span>&middot;</span>
                                <span className={`font-mono font-bold ${triggerInfo.color}`}>{triggerInfo.tag}</span>
                            </>
                        )}
                    </div>
                    {triggerInfo?.tag === 'WEBHOOK' && (
                        <p className="font-mono text-xs text-gray-400 mt-2 bg-[#1c1e20] inline-block px-2 py-1 rounded">http://localhost:3000/api/hooks/1/{wf.id.substring(0,4)}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-all">
                        <Play size={18}/>
                    </button>
                    <Dropdown
                        trigger={
                            <button className="p-2 rounded-lg text-gray-400 hover:bg-[#4295f1]/20 hover:text-[#81b8f5] transition-all">
                                <MoreVertical size={18}/>
                            </button>
                        }
                    >
                         <button onClick={() => onEdit(wf.id)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-white/5">Edit</button>
                         <button onClick={() => onDuplicate(wf.id)} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-white/5"><Copy size={14}/> Duplicate</button>
                         <button onClick={() => onDelete(wf.id)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-white/5"><Trash2 size={14}/> Delete</button>
                    </Dropdown>
                </div>
            </div>
        </motion.div>
    );
}


const WorkflowsPage: React.FC = () => {
    const dispatch = useDispatch();
    const allWorkflows = useSelector((state: RootState) => state.workflows.workflows);
    const user = useSelector((state: RootState) => state.auth.user);
    const [newWorkflowName, setNewWorkflowName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(loadWorkflows());
    }, [dispatch]);

    const handleCreateWorkflow = () => {
        if (newWorkflowName.trim()) {
            dispatch(createWorkflow({ name: newWorkflowName }));
            setNewWorkflowName('');
            setIsModalOpen(false);
        }
    };

    const handleEdit = (workflowId: string) => dispatch(setView({ view: 'editor', workflowId }));
    const handleDelete = (workflowId: string) => dispatch(deleteWorkflow(workflowId));
    const handleDuplicate = (workflowId: string) => dispatch(duplicateWorkflow(workflowId));
    
    const filteredWorkflows = useMemo(() => {
        return allWorkflows
            .filter(wf => wf.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    }, [allWorkflows, searchTerm]);

    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        <div className="flex h-screen bg-[#1c1e20]">
            <DashboardSidebar activeView="workflows" />
            <main className="flex-1 flex flex-col p-8 overflow-y-auto">
                {/* Header */}
                 <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Workflows</h1>
                        <p className="text-gray-400">Manage and monitor your automation workflows</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                            <input type="text" placeholder="Search Workflows..." className="bg-[#2a2d30] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4295f1] transition-all"/>
                        </div>
                        <button className="p-2.5 rounded-lg bg-[#2a2d30] border border-gray-700 text-gray-400 hover:text-white"><Sun size={20}/></button>
                        <button className="p-2.5 rounded-lg bg-[#2a2d30] border border-gray-700 text-gray-400 hover:text-white"><Bell size={20}/></button>
                        <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-bold text-[#96c4f7]">{userInitial}</div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#4295f1] text-white rounded-lg font-semibold hover:bg-[#57a1f2] transition-colors">
                            <Plus className="w-5 h-5" />
                            Create Workflow
                        </motion.button>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                        <input 
                            type="text" 
                            placeholder="Search workflows..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#2a2d30] border border-gray-700 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4295f1] transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2d30] border border-gray-700 rounded-lg text-gray-300 hover:border-gray-600">
                        <Filter size={16}/>
                        <span>All Status</span>
                        <ChevronDown size={16}/>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2d30] border border-gray-700 rounded-lg text-gray-300 hover:border-gray-600">
                        <span>Last Updated</span>
                        <ChevronDown size={16}/>
                    </button>
                </div>

                {/* Workflow List */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    <AnimatePresence>
                        {filteredWorkflows.map(wf => (
                            <WorkflowCard key={wf.id} wf={wf} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate}/>
                        ))}
                    </AnimatePresence>
                    {filteredWorkflows.length === 0 && (
                        <div className="text-center py-16">
                             <WorkflowIcon className="mx-auto w-16 h-16 text-gray-600"/>
                            <h3 className="mt-4 text-xl font-semibold text-white">No Workflows Found</h3>
                            <p className="mt-2 text-gray-400">Get started by creating a new workflow.</p>
                        </div>
                    )}
                </div>

            </main>

            {/* Modal */}
            <AnimatePresence>
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: -20 }}
                  className="bg-[#2a2d30] p-6 rounded-lg w-full max-w-sm border border-gray-700"
                  onClick={e => e.stopPropagation()}
                >
                  <h2 className="text-xl font-bold mb-4">Create New Workflow</h2>
                  <input
                    type="text"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="My Awesome Workflow"
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white mb-4 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
                  />
                  <button
                    onClick={handleCreateWorkflow}
                    className="w-full py-2 bg-[#4295f1] rounded-lg font-semibold hover:bg-[#57a1f2] transition-colors"
                  >
                    Create
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    );
};

export default WorkflowsPage;