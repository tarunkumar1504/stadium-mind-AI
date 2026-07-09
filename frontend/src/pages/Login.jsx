import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div class="flex-grow flex items-center justify-center px-4 py-12 relative">
      <div class="max-w-md w-full glass-panel p-8 rounded-2xl shadow-2xl relative z-10">
        
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
          <p class="text-xs text-gray-400 mt-1.5">Sign in to check live stadium wait times & chat with AI</p>
        </div>

        {error && (
          <div class="mb-4 p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" class="text-[11px] font-semibold text-gray-400 block mb-1">EMAIL ADDRESS</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail class="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                class="w-full bg-gray-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 accessible-focus"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" class="text-[11px] font-semibold text-gray-400 block mb-1">PASSWORD</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <KeyRound class="w-4 h-4" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full bg-gray-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 accessible-focus"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 accessible-focus"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-gray-500">
          New to the stadium?{' '}
          <Link to="/register" class="text-emerald-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}
