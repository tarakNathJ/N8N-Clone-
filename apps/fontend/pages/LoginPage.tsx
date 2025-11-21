import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setView } from "../store/navigationSlice";
import { setUser } from "../store/authSlice";
import { getUsers } from "../utils/localStorage";
import { motion } from "framer-motion";
import {api_instance} from "@/hooks/api.js";
import {useNavigate} from "react-router-dom"
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password);
    try {
      console.log("here");
      const responce = await api_instance.post("/api/auth/login", {
        email: email,
        password: password,
      });

      console.log(responce.data.data.access_token);

      localStorage.setItem("access_token", responce.data.data.access_token);
      sessionStorage.setItem("user_id", responce.data.data.id);
      navigate("/dashboard");

    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 rounded-2xl glassmorphism border border-white/10"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400">Log in to continue to FlowCraft</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <p className="text-red-400 text-center">{error}</p>}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300 block mb-2"
            >
              Email address
            </label>
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
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300 block mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Log In
          </motion.button>
        </form>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => dispatch(setView({ view: "signup" }))}
            className="font-medium text-[#81b8f5] hover:underline"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
