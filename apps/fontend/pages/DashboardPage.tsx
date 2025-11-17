import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setView } from '../store/navigationSlice';
import { loadWorkflows, createWorkflow, deleteWorkflow, duplicateWorkflow } from '../store/workflowsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Copy, Search, Sun, Bell, MoreHorizontal, Dot, Briefcase,
    Workflow as WorkflowIcon, Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Workflow } from '../types';
import DashboardSidebar from '../components/DashboardSidebar';

const StatCard = ({ title, value, description, icon }: { title: string, value: string | number, description: string, icon: React.ReactNode }) => (
    <motion.div 
        className="bg-[#2a2d30] p-5 rounded-xl border border-gray-700 flex flex-col justify-between"
        whileHover={{ scale: 1.05, backgroundColor: '#373a3d' }}
    >
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-400">{title}</span>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </motion.div>
);

const RecentActivityItem = ({ activity }: { activity: any }) => {
    const statusConfig: { [key: string]: { color: string, dotColor: string, text: string } } = {
        success: { color: 'bg-green-500/10 text-green-400', dotColor: 'bg-green-500', text: 'SUCCESS' },
        error: { color: 'bg-red-500/10 text-red-400', dotColor: 'bg-red-500', text: 'ERROR' },
        running: { color: 'bg-yellow-500/10 text-yellow-400', dotColor: 'bg-yellow-500', text: 'RUNNING' },
    };
    const { color, dotColor, text } = statusConfig[activity.status];
    return (
        <div className="flex items-start justify-between py-3">
            <div className="flex items-start gap-3">
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                <div>
                    <p className="font-semibold text-gray-200">{activity.name}</p>
                    <p className="text-xs text-gray-500">{activity.time} &middot; {activity.details}</p>
                </div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-md ${color}`}>{text}</div>
        </div>
    );
};

const WorkflowListItem = ({ wf, onEdit, onDelete, onDuplicate }: { wf: Workflow, onEdit: (id: string) => void, onDelete: (id: string) => void, onDuplicate: (id: string) => void }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    return(
         <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-700 rounded-lg">
                    <WorkflowIcon className="w-5 h-5 text-gray-400"/>
                </div>
                <div>
                    <p className="font-bold text-white">{wf.name}</p>
                    <p className="text-sm text-gray-500">
                        Updated {formatDistanceToNow(new Date(wf.updated), { addSuffix: true })}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onEdit(wf.id)}
                    className="px-4 py-2 text-sm font-semibold bg-[#4295f1] text-white rounded-md hover:bg-[#57a1f2]"
                >
                    Open
                </button>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md hover:bg-gray-600">
                        <MoreHorizontal className="w-5 h-5"/>
                    </button>
                    <AnimatePresence>
                    {menuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-10 w-40 bg-[#373a3d] border border-gray-700 rounded-lg shadow-xl z-10"
                        >
                            <button onClick={() => { onDuplicate(wf.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-white/5"><Copy size={14}/> Duplicate</button>
                            <button onClick={() => { onDelete(wf.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-white/5"><Trash2 size={14}/> Delete</button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const workflows = useSelector((state: RootState) => state.workflows.workflows);
  const user = useSelector((state: RootState) => state.auth.user);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleEdit = (workflowId: string) => {
    dispatch(setView({ view: 'editor', workflowId }));
  };
  
  const handleDelete = (workflowId: string) => dispatch(deleteWorkflow(workflowId));
  const handleDuplicate = (workflowId: string) => dispatch(duplicateWorkflow(workflowId));
  
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  const stats = [
    { title: 'Workflows', value: workflows.length, description: 'active workflows', icon: <Briefcase className="w-5 h-5 text-gray-500" /> },
    { title: 'Total Triggers', value: '4', description: 'active triggers', icon: <Dot className="w-5 h-5 text-gray-500" /> },
    { title: 'Executions', value: '16', description: 'past 24h', icon: <WorkflowIcon className="w-5 h-5 text-gray-500" /> },
    { title: 'Total Nodes', value: workflows.reduce((acc, wf) => acc + Object.keys(wf.nodes).length, 0), description: 'in all workflows', icon: <Settings className="w-5 h-5 text-gray-500" /> }
  ];
  
  const mockActivity = [
    { id: 1, name: 'Email Newsletter Automation', status: 'success', time: 'Jan 15, 10:30 AM', details: 'trigger • 2m 15s' },
    { id: 2, name: 'Customer Support Ticket Handler', status: 'success', time: 'Jan 15, 02:20 PM', details: 'webhook • 45s' },
    { id: 3, name: 'Data Backup & Sync', status: 'success', time: 'Jan 15, 02:00 AM', details: 'trigger • 15m 30s' },
    { id: 4, name: 'Lead Generation Pipeline', status: 'error', time: 'Jan 15, 11:45 AM', details: 'webhook • 12s' },
    { id: 5, name: 'Email Newsletter Automation', status: 'running', time: 'Jan 15, 03:30 PM', details: 'manual' },
  ];

  return (
    <div className="flex h-screen bg-[#1c1e20]">
        <DashboardSidebar activeView="overview" />
        
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Overview</h1>
                    <p className="text-gray-400">All the workflows, credentials and executions you have access to</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                        <input type="text" placeholder="Search Workflows..." className="bg-[#2a2d30] border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4295f1]"/>
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
            
            {/* Stats */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                {stats.map((stat, i) => (
                    <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }} exit={{ opacity: 0 }}>
                        <StatCard title={stat.title} value={stat.value} description={stat.description} icon={stat.icon} />
                    </motion.div>
                ))}
                </AnimatePresence>
            </motion.div>

            {/* Recent Section */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="xl:col-span-3 bg-[#2a2d30] p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Recent Workflows</h2>
                        <button onClick={() => dispatch(setView({ view: 'workflows' }))} className="text-sm font-semibold text-[#81b8f5] hover:underline">View all &rarr;</button>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-700">
                         {workflows.slice(0, 5).map(wf => (
                            <WorkflowListItem key={wf.id} wf={wf} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                         ))}
                         {workflows.length === 0 && <p className="text-gray-500 text-center py-8">No workflows found.</p>}
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} className="xl:col-span-2 bg-[#2a2d30] p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                        <a href="#" className="text-sm font-semibold text-[#81b8f5] hover:underline">View all &rarr;</a>
                    </div>
                    <div className="flex flex-col divide-y divide-gray-700">
                        {mockActivity.map(act => <RecentActivityItem key={act.id} activity={act} />)}
                    </div>
                </motion.div>
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

export default DashboardPage;