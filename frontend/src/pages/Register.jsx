import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fan');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password, role);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-2xl relative z-10">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-xs text-gray-400 mt-1.5">Join StadiumPulse AI for smart World Cup guidance</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="text-[11px] font-semibold text-gray-400 block mb-1">USERNAME</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <User className="w-4 h-4" />
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="soccerfan99"
                className="w-full bg-gray-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 accessible-focus"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-[11px] font-semibold text-gray-400 block mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fan@fifacup.com"
                className="w-full bg-gray-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 accessible-focus"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-[11px] font-semibold text-gray-400 block mb-1">PASSWORD</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 chars)"
                className="w-full bg-gray-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 accessible-focus"
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label htmlFor="role" className="text-[11px] font-semibold text-gray-400 block mb-1.5">ACCOUNT TYPE</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1.5 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setRole('fan')}
                className={`py-2 text-xs rounded-lg transition-all font-semibold ${role === 'fan' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                FIFA Fan
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`py-2 text-xs rounded-lg transition-all font-semibold flex items-center justify-center gap-1 ${role === 'organizer' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Staff Organizer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 accessible-focus"
          >
            {loading ? 'Registering...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
