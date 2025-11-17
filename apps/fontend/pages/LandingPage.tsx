import React from 'react';
import { useDispatch } from 'react-redux';
import { setView } from '../store/navigationSlice';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Code, Share2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4295f1]/20 via-gray-900 to-gray-900 z-0"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#6cacf4]/30 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#4295f1]/30 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center flex flex-col items-center"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-[#81b8f5] to-[#c0dcfa] text-transparent bg-clip-text">FlowCraft</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-300">
          Visually build, manage, and automate complex workflows with ease. Your entire creative studio, right in your browser.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(setView({ view: 'signup' }))}
            className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#4295f1] to-[#6cacf4] text-white font-semibold rounded-lg shadow-lg hover:shadow-[#4295f1]/50 transition-all duration-300"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(setView({ view: 'login' }))}
            className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors duration-300"
          >
            Log In
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="z-10 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
      >
        <div className="p-6 rounded-xl glassmorphism border border-white/10">
            <Zap className="w-8 h-8 text-[#81b8f5] mb-4" />
            <h3 className="text-xl font-bold text-white">Intuitive Visual Editor</h3>
            <p className="text-gray-400 mt-2">Drag, drop, and connect nodes to build powerful workflows without writing a single line of code.</p>
        </div>
        <div className="p-6 rounded-xl glassmorphism border border-white/10">
            <Code className="w-8 h-8 text-[#6cacf4] mb-4" />
            <h3 className="text-xl font-bold text-white">Powerful Nodes</h3>
            <p className="text-gray-400 mt-2">From HTTP requests to custom functions, FlowCraft provides the building blocks you need.</p>
        </div>
        <div className="p-6 rounded-xl glassmorphism border border-white/10">
            <Share2 className="w-8 h-8 text-[#96c4f7] mb-4" />
            <h3 className="text-xl font-bold text-white">Local & Secure</h3>
            <p className="text-gray-400 mt-2">All your workflows are saved directly in your browser. No cloud, no data sharing.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;