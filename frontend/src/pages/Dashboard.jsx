import React, { useState } from 'react';
import AlertBanner from '../components/AlertBanner';
import StadiumMap from '../components/StadiumMap';
import ChatAssistant from '../components/ChatAssistant';
import { HelpCircle, Star, Sparkles, Navigation, Info } from 'lucide-react';

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6 md:py-10 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
            StadiumPulse Fan Navigator ⚽
          </h1>
          <p className="text-xs text-gray-400 mt-1">Smart World Cup stadium crowd maps, queue estimates and AI assistance.</p>
        </div>

        {/* Accessibility quick-notice */}
        <div className="flex items-center gap-2 bg-gray-900 border border-white/5 rounded-xl px-3.5 py-1.5 max-w-sm">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[10px] text-gray-300 leading-normal">
            Need wheelchair routes or voice guidance? Click <strong>Accessibility</strong> in the navbar top right.
          </span>
        </div>
      </div>

      {/* Real-time Alerts Banner */}
      <AlertBanner refreshTrigger={refreshTrigger} />

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns: Interactive Map Heatmap & Routing */}
        <div className="xl:col-span-2 space-y-6">
          <StadiumMap onNodeSelect={(node) => console.log('Selected node:', node)} />
        </div>

        {/* Right Column: AI Assistant Chat */}
        <div className="xl:col-span-1">
          <ChatAssistant />
        </div>

      </div>

      {/* Tips section */}
      <div className="glass-panel p-4 rounded-xl flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-xs">
          <h4 className="font-bold text-white mb-0.5">How Queue Estimates Work</h4>
          <p className="text-gray-400 leading-relaxed font-medium">
            Queue waiting times are estimated based on crowd size count. Green indicators represent wait times under 3 minutes, Yellow represents 4-10 minutes, Orange indicates 11-20 minutes, and Red alerts indicate wait times exceeding 20 minutes or terminal gate congestion.
          </p>
        </div>
      </div>

    </div>
  );
}
