import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AlertBanner({ refreshTrigger }) {
  const [alerts, setAlerts] = useState([]);
  const { user } = useAuth();

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/stadium/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err.message);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Set up polling for mock real-time updates (every 8 seconds)
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleDismiss = async (alertId) => {
    try {
      await axios.put(`/api/stadium/alerts/${alertId}/dismiss`);
      setAlerts(prev => prev.filter(a => (a.id || a._id) !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err.message);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div class="space-y-2.5 w-full mb-6" role="alert" aria-live="assertive">
      {alerts.map((alert) => {
        const id = alert.id || alert._id;
        const isEmergency = alert.type === 'emergency';
        const isWarning = alert.type === 'warning';
        
        return (
          <div 
            key={id}
            class={`relative overflow-hidden p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${
              isEmergency 
                ? 'bg-red-950/45 border-red-500/40 text-red-100 shadow-md shadow-red-950/20 animate-pulse'
                : isWarning
                  ? 'bg-amber-950/40 border-amber-500/35 text-amber-100 shadow-md shadow-amber-950/20'
                  : 'bg-blue-950/40 border-blue-500/30 text-blue-100'
            }`}
          >
            {/* Glowing Accent Bar */}
            <div class={`absolute left-0 top-0 bottom-0 w-1 ${
              isEmergency ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
            }`} />

            {/* Icon */}
            <div class="mt-0.5">
              {isEmergency && <ShieldAlert class="w-5 h-5 text-red-400" />}
              {isWarning && <AlertTriangle class="w-5 h-5 text-amber-400" />}
              {!isEmergency && !isWarning && <Info class="w-5 h-5 text-blue-400" />}
            </div>

            {/* Content */}
            <div class="flex-grow pr-6">
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase font-extrabold tracking-wider opacity-75">
                  {alert.type} • {alert.source}
                </span>
                <span class="text-[10px] opacity-50">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p class="text-sm font-medium mt-1 leading-relaxed">
                {alert.message}
              </p>
            </div>

            {/* Organizer Dismiss Button */}
            {user?.role === 'organizer' && (
              <button
                onClick={() => handleDismiss(id)}
                class="absolute right-3 top-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all accessible-focus"
                aria-label="Dismiss Alert"
              >
                <X class="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
