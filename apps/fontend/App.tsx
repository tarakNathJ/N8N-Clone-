
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import WorkflowsPage from './pages/WorkflowsPage';
import { setAuthFromLocalStorage } from './store/authSlice';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { view, currentWorkflowId } = useSelector((state: RootState) => state.navigation);
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.user);

  useEffect(() => {
    dispatch(setAuthFromLocalStorage());
  }, [dispatch]);
  
  const renderView = () => {
    if (!isAuthenticated) {
      switch (view) {
        case 'login':
          return <LoginPage key="login" />;
        case 'signup':
          return <SignupPage key="signup" />;
        default:
          return <LandingPage key="landing" />;
      }
    } else {
      switch (view) {
        case 'dashboard':
          return <DashboardPage key="dashboard" />;
        case 'editor':
          return <EditorPage key={`editor-${currentWorkflowId}`} workflowId={currentWorkflowId!} />;
        case 'workflows':
          return <WorkflowsPage key="workflows" />;
        default:
          return <DashboardPage key="dashboard-default" />;
      }
    }
  };

  return (
    <div className="min-h-screen">
       <AnimatePresence mode="wait">
        <motion.div
          key={view + String(isAuthenticated)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;