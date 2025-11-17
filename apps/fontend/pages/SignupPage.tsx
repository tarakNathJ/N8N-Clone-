import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setView } from '../store/navigationSlice';
import { setUser } from '../store/authSlice';
import { getUsers, saveUsers } from '../utils/localStorage';
import { generateId } from '../utils/id';
import { motion } from 'framer-motion';

const SignupPage: React.FC = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser = { id: generateId(), email, password };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    dispatch(setUser({ id: newUser.id, email: newUser.email }));
    dispatch(setView({ view: 'dashboard' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 rounded-2xl glassmorphism border border-white/10"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create an Account</h1>
          <p className="text-gray-400">Start building your workflows today</p>
        </div>
        <form className="space-y-6" onSubmit={handleSignup}>
          {error && <p className="text-red-400 text-center">{error}</p>}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300 block mb-2">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-300 block mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
            />
          </div>
          <div>
             <label htmlFor="confirm-password"  className="text-sm font-medium text-gray-300 block mb-2">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-[#4295f1] to-[#6cacf4] text-white font-semibold rounded-lg shadow-lg hover:shadow-[#4295f1]/50 transition-shadow duration-300"
          >
            Sign Up
          </motion.button>
        </form>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <button onClick={() => dispatch(setView({ view: 'login' }))} className="font-medium text-[#81b8f5] hover:underline">
            Log in
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;