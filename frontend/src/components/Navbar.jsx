import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Shield, User, LogOut, Accessibility, Sun, Moon, Volume2, VolumeX, Type, Eye } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { 
    highContrast, setHighContrast, 
    dyslexiaFont, setDyslexiaFont, 
    speakText, setSpeakText, 
    fontSize, setFontSize 
  } = useAccessibility();
  
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav class="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 py-3" role="navigation" aria-label="Main Navigation">
      <div class="max-width-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" class="flex items-center space-x-2 text-xl font-bold tracking-wider text-white hover:opacity-90 accessible-focus" aria-label="StadiumPulse Home">
          <span class="bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">StadiumPulse</span>
          <span class="text-emerald-500 font-extrabold text-sm border border-emerald-500/30 px-1.5 py-0.2 rounded bg-emerald-500/5 uppercase">AI</span>
        </Link>

        {/* Desktop Links */}
        <div class="flex items-center space-x-6">
          <Link to="/" class={`text-sm font-medium transition-colors hover:text-emerald-400 accessible-focus ${isActive('/') ? 'text-emerald-400' : 'text-gray-300'}`}>
            Home
          </Link>
          
          {isAuthenticated && (
            <Link to="/dashboard" class={`text-sm font-medium transition-colors hover:text-emerald-400 accessible-focus ${isActive('/dashboard') ? 'text-emerald-400' : 'text-gray-300'}`}>
              Fan Guide
            </Link>
          )}

          {isAuthenticated && user?.role === 'organizer' && (
            <Link to="/organizer" class={`text-sm font-medium transition-colors hover:text-emerald-400 flex items-center gap-1.5 accessible-focus ${isActive('/organizer') ? 'text-emerald-400 font-semibold' : 'text-gray-300'}`}>
              <Shield class="w-4 h-4 text-emerald-500" />
              Organizer
            </Link>
          )}
        </div>

        {/* Control Actions (Accessibility & Auth) */}
        <div class="flex items-center space-x-3">
          
          {/* Accessibility Dropdown Toggle */}
          <div class="relative">
            <button 
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              class="p-2 rounded-full glass-panel-light hover:bg-gray-800 text-emerald-400 accessible-focus flex items-center gap-1 border border-emerald-500/20"
              aria-label="Accessibility Options Menu"
              aria-expanded={showAccessMenu}
              aria-haspopup="true"
            >
              <Accessibility class="w-5 h-5" />
              <span class="text-xs font-semibold hidden md:inline">Accessibility</span>
            </button>

            {showAccessMenu && (
              <div 
                class="absolute right-0 mt-2 w-72 rounded-xl p-4 shadow-xl border border-white/10 bg-gray-900/95 backdrop-blur-md z-50"
                role="dialog"
                aria-label="Accessibility Preferences"
              >
                <div class="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <h3 class="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <Accessibility class="w-4 h-4" /> Preferences
                  </h3>
                  <button 
                    onClick={() => setShowAccessMenu(false)}
                    class="text-xs text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div class="space-y-4">
                  {/* High Contrast Mode */}
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-300 flex items-center gap-1.5">
                      <Eye class="w-3.5 h-3.5" /> High Contrast
                    </span>
                    <button 
                      onClick={() => setHighContrast(!highContrast)}
                      class={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${highContrast ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {highContrast ? 'Active' : 'Turn On'}
                    </button>
                  </div>

                  {/* Dyslexia Font Mode */}
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-300 flex items-center gap-1.5">
                      <Type class="w-3.5 h-3.5" /> Dyslexic Font
                    </span>
                    <button 
                      onClick={() => setDyslexiaFont(!dyslexiaFont)}
                      class={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${dyslexiaFont ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {dyslexiaFont ? 'Active' : 'Turn On'}
                    </button>
                  </div>

                  {/* Speak AI text (Text to Speech) */}
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-300 flex items-center gap-1.5">
                      {speakText ? <Volume2 class="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX class="w-3.5 h-3.5" />} Voice Reader
                    </span>
                    <button 
                      onClick={() => setSpeakText(!speakText)}
                      class={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${speakText ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {speakText ? 'Active' : 'Turn On'}
                    </button>
                  </div>

                  {/* Text Size Scale Selector */}
                  <div class="pt-2 border-t border-white/5">
                    <span class="text-xs text-gray-400 block mb-2 font-medium">Font Scaling</span>
                    <div class="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-lg">
                      <button 
                        onClick={() => setFontSize('normal')}
                        class={`py-1 text-xs rounded transition-all ${fontSize === 'normal' ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
                      >
                        Default
                      </button>
                      <button 
                        onClick={() => setFontSize('large')}
                        class={`py-1 text-xs rounded transition-all ${fontSize === 'large' ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
                      >
                        Large
                      </button>
                      <button 
                        onClick={() => setFontSize('xlarge')}
                        class={`py-1 text-xs rounded transition-all ${fontSize === 'xlarge' ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
                      >
                        XL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Section / Login */}
          {isAuthenticated ? (
            <div class="flex items-center space-x-2 pl-2 border-l border-white/10">
              <span class="text-xs text-gray-300 hidden lg:inline-block">
                Welcome, <strong class="text-emerald-400 font-semibold">{user?.username}</strong>
              </span>
              <button 
                onClick={handleLogout}
                class="p-2 rounded-full glass-panel-light hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all border border-red-500/20 flex items-center justify-center accessible-focus"
                aria-label="Logout"
              >
                <LogOut class="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              class="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 accessible-focus"
            >
              <User class="w-3.5 h-3.5" />
              Log In
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
