import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setView } from '../store/navigationSlice';
import { logoutAndRedirect } from '../store/authSlice';
import { RootState } from '../store/store';
import { LayoutGrid, Workflow as WorkflowIcon, KeyRound, Settings, HelpCircle, LogOut } from 'lucide-react';

interface NavLinkProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-[#4295f1] text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

interface DashboardSidebarProps {
    activeView: 'overview' | 'workflows';
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeView }) => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        <aside className="w-60 flex flex-col bg-[#131517] p-4 border-r border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-[#4295f1] rounded-lg flex items-center justify-center font-bold text-white">F</div>
                <h1 className="text-xl font-bold">FlowCraft</h1>
            </div>
            <nav className="flex-grow flex flex-col justify-between">
                <div>
                    <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</h2>
                    <div className="space-y-1">
                        <NavLink icon={<LayoutGrid size={18}/>} label="Overview" active={activeView === 'overview'} onClick={() => dispatch(setView({ view: 'dashboard' }))} />
                        <NavLink icon={<WorkflowIcon size={18}/>} label="Workflows" active={activeView === 'workflows'} onClick={() => dispatch(setView({ view: 'workflows' }))} />
                    </div>
                    <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Resources</h2>
                    <div className="space-y-1">
                        <NavLink icon={<KeyRound size={18}/>} label="Credentials" onClick={() => {}} />
                    </div>
                </div>
                <div>
                    <div className="space-y-1">
                        <NavLink icon={<Settings size={18}/>} label="Settings" onClick={() => {}} />
                        <NavLink icon={<HelpCircle size={18}/>} label="Help" onClick={() => {}} />
                    </div>
                    <div className="border-t border-gray-800 mt-4 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-bold text-[#96c4f7]">{userInitial}</div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                            </div>
                             <button onClick={() => dispatch(logoutAndRedirect() as any)} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white" title="Logout"><LogOut size={16}/></button>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export default DashboardSidebar;