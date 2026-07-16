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
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 py-3" role="navigation" aria-label="Main Navigation">
      <div className="max-width-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-wider text-white hover:opacity-90 accessible-focus" aria-label="StadiumPulse Home">
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">StadiumPulse</span>
          <span className="text-emerald-500 font-extrabold text-sm border border-emerald-500/30 px-1.5 py-0.2 rounded bg-emerald-500/5 uppercase">AI</span>
        </Link>

        {/* Desktop Links */}
        <div className="flex items-center space-x-6">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-emerald-400 accessible-focus ${isActive('/') ? 'text-emerald-400' : 'text-gray-300'}`}>
            Home
          </Link>
          
          {isAuthenticated && (
            <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-emerald-400 accessible-focus ${isActive('/dashboard') ? 'text-emerald-400' : 'text-gray-300'}`}>
              Fan Guide
            </Link>
          )}

          {isAuthenticated && user?.role === 'organizer' && (
            <Link to="/organizer" className={`text-sm font-medium transition-colors hover:text-emerald-400 flex items-center gap-1.5 accessible-focus ${isActive('/organizer') ? 'text-emerald-400 font-semibold' : 'text-gray-300'}`}>
              <Shield className="w-4 h-4 text-emerald-500" />
              Organizer
            </Link>
          )}
        </div>

        {/* Control Actions (Accessibility & Auth) */}
        <div className="flex items-center space-x-3">
          
          {/* Accessibility Dropdown Toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              className="p-2 rounded-full glass-panel-light hover:bg-gray-800 text-emerald-400 accessible-focus flex items-center gap-1 border border-emerald-500/20"
              aria-label="Accessibility Options Menu"
              aria-expanded={showAccessMenu}
              aria-haspopup="true"
            >
              <Accessibility className="w-5 h-5" />
              <span className="text-xs font-semibold hidden md:inline">Accessibility</span>
            </button>

            {showAccessMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-xl p-4 shadow-xl border border-white/10 bg-gray-900/95 backdrop-blur-md z-50"
                role="dialog"
                aria-label="Accessibility Preferences"
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <Accessibility className="w-4 h-4" /> Preferences
                  </h3>
                  <button 
                    onClick={() => setShowAccessMenu(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  {/* High Contrast Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> High Contrast
                    </span>
                    <button 
                      onClick={() => setHighContrast(!highContrast)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${highContrast ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {highContrast ? 'Active' : 'Turn On'}
                    </button>
                  </div>

                  {/* Dyslexia Font Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5" /> Dyslexic Font
                    </span>
                    <button 
                      onClick={() => setDyslexiaFont(!dyslexiaFont)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${dyslexiaFont ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {dyslexiaFont ? 'Active' : 'Turn On'}
                    </button>
                  </div>

                  {/* Speak AI text (Text to Speech) */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 flex items-center gap-1.5">
                      {speakText ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />} Voice Reader
                    </span>
                    <button 
                      onClick={() => setSpeakText(!speakText)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${speakText ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {speakText ? 'Active' : 'Turn On'}
                    </button>
                  </div>

                  {/* Text Size Scale Selector */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-400 block mb-2 font-medium">Font Scaling</span>
                    <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-lg">
                      <button 
                        onClick={() => setFontSize('normal')}
                        className={`py-1 text-xs rounded transition-all ${fontSize === 'normal' ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
                      >
                        Default
                      </button>
                      <button 
                        onClick={() => setFontSize('large')}
                        className={`py-1 text-xs rounded transition-all ${fontSize === 'large' ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
                      >
                        Large
                      </button>
                      <button 
                        onClick={() => setFontSize('xlarge')}
                        className={`py-1 text-xs rounded transition-all ${fontSize === 'xlarge' ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
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
            <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
              <span className="text-xs text-gray-300 hidden lg:inline-block">
                Welcome, <strong className="text-emerald-400 font-semibold">{user?.username}</strong>
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full glass-panel-light hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all border border-red-500/20 flex items-center justify-center accessible-focus"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 accessible-focus"
            >
              <User className="w-3.5 h-3.5" />
              Log In
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
