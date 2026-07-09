import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Navigation, Shield, Compass, ChevronRight, Award, Zap, HelpCircle } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div class="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-24 relative overflow-hidden">
      
      {/* Hero Banner Section */}
      <div class="max-w-4xl text-center space-y-6 z-10">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-bounce">
          <Award class="w-4 h-4 text-emerald-400" /> Official FIFA World Cup 2026 Tech Entry
        </div>
        
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-sans">
          Navigate the Pulse of the <br />
          <span class="bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-500 text-transparent bg-clip-text">
            FIFA Stadium Operations
          </span>
        </h1>

        <p class="max-w-2xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed font-medium">
          Say goodbye to restroom queues, congested ticket gates, and complex accessibility detours. StadiumPulse AI uses live queue metrics and Google Gemini Generative AI to guide fans through dynamic route predictions.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                class="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 accessible-focus"
              >
                Go to Fan Guide <Compass class="w-4 h-4" />
              </Link>
              {user?.role === 'organizer' && (
                <Link 
                  to="/organizer" 
                  class="px-6 py-3 rounded-xl bg-gray-900 border border-white/10 hover:border-emerald-500/50 hover:bg-gray-800 text-white font-extrabold text-sm transition-all flex items-center gap-1.5 accessible-focus"
                >
                  Organizer Board <Shield class="w-4 h-4 text-emerald-500" />
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                to="/register" 
                class="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 accessible-focus"
              >
                Get Started <ChevronRight class="w-4 h-4" />
              </Link>
              <Link 
                to="/login" 
                class="px-6 py-3 rounded-xl bg-gray-900 border border-white/10 hover:bg-gray-800 text-gray-300 font-extrabold text-sm transition-all accessible-focus"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlighting Grid */}
      <div class="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 md:mt-24 z-10">
        
        {/* Card 1: AI Chat assistant */}
        <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between glass-card-hover group">
          <div class="space-y-4">
            <div class="p-3 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bot class="w-6 h-6" />
            </div>
            <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Gemini Concierge bot
            </h3>
            <p class="text-xs text-gray-400 leading-relaxed font-medium">
              Resolve restroom search requests, locate specific beverage booths, and read active alerts instantly. Multilingual support translations and speech feedback overlays out of the box.
            </p>
          </div>
          <span class="text-[10px] text-emerald-400 font-extrabold tracking-wider mt-4 flex items-center gap-0.5 uppercase">
            Powered by GenAI <Zap class="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Card 2: Dynamic Map */}
        <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between glass-card-hover group">
          <div class="space-y-4">
            <div class="p-3 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Navigation class="w-6 h-6" />
            </div>
            <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Least-Congested Pathfinding
            </h3>
            <p class="text-xs text-gray-400 leading-relaxed font-medium">
              Our Dijkstra routing algorithm recalculates edge distances based on live ticket counter occupancy and gate queues. Bypass heavy spectator sections with single-click routes.
            </p>
          </div>
          <span class="text-[10px] text-emerald-400 font-extrabold tracking-wider mt-4 flex items-center gap-0.5 uppercase">
            SVG Live Heatmap <Zap class="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Card 3: Organizer Shield */}
        <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between glass-card-hover group">
          <div class="space-y-4">
            <div class="p-3 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield class="w-6 h-6" />
            </div>
            <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Operational Decision Support
            </h3>
            <p class="text-xs text-gray-400 leading-relaxed font-medium">
              Organizers access live attendance metrics, toggle gate security rules, receive AI-generated dispatch guidelines with confidence scores, and broadcast stadium evacuations.
            </p>
          </div>
          <span class="text-[10px] text-emerald-400 font-extrabold tracking-wider mt-4 flex items-center gap-0.5 uppercase">
            Staff Dispatch Room <Zap class="w-3.5 h-3.5" />
          </span>
        </div>

      </div>

      {/* Decorative Football graphic/shape back-shadow */}
      <div class="absolute bottom-[-10%] opacity-5 w-[400px] h-[400px] border-[30px] border-white rounded-full pointer-events-none"></div>
    </div>
  );
}
