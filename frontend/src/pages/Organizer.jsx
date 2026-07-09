import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AlertBanner from '../components/AlertBanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Shield, Users, Clock, AlertTriangle, Send, Sparkles, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Organizer() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Alert Dispatcher State
  const [alertType, setAlertType] = useState('warning');
  const [alertMessage, setAlertMessage] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState('');

  // Simulator State
  const [selectedPointId, setSelectedPointId] = useState('gate_d');
  const [simCrowdLevel, setSimCrowdLevel] = useState(90);
  const [simQueueSize, setSimQueueSize] = useState(340);
  const [simStatus, setSimStatus] = useState('');

  // Pre-compiled Mock Analytics Trends
  const occupancyTrendData = [
    { time: '17:00', fans: 12000 },
    { time: '17:30', fans: 28000 },
    { time: '18:00', fans: 49000 },
    { time: '18:30', fans: 68400 },
    { time: '19:00', fans: 74200 },
    { time: '19:30', fans: 79100 },
    { time: '20:00', fans: 79800 }
  ];

  // AI recommendations list
  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      recommendation: "Reroute incoming spectators from Gate D (West Entrance) to Gate B (South Entrance)",
      reason: "Gate D is at critical capacity (90% crowd level, 340 queue size) causing severe entry delay (~22 mins), while Gate B is underutilized (25% crowd level, 45 queue size).",
      confidence: "95%",
      impact: "Reduces ingress congestion at the west corridor and shortens average queue waiting time by 18 minutes."
    },
    {
      id: 2,
      recommendation: "Relocate 6 ticketing support staff members from Gate B to Gate D ticket kiosks",
      reason: "Ticket scanning terminal delays detected at Gate D. Staffing ratios are disproportionate to the load factor.",
      confidence: "88%",
      impact: "Increases ticket check throughput at Gate D by 40% and dissolves outer line overflow."
    },
    {
      id: 3,
      recommendation: "Broadcast accessibility elevator route instructions for Sector East",
      reason: "High volume of wheelchair users seeking restrooms are routing to stairs-only Restroom Block - East. Elevator EL-3 is fully operational.",
      confidence: "91%",
      impact: "Prevents accessibility blockage and routes fans with reduced mobility safely to Tier 1 toilets."
    }
  ]);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/stadium/points');
      setPoints(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard points:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handlePublishAlert = async (e) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;

    setDispatchStatus('');
    try {
      await axios.post('/api/stadium/alerts', {
        type: alertType,
        message: alertMessage,
        source: 'Operations Control Room'
      });
      setAlertMessage('');
      setDispatchStatus('Alert broadcasted successfully!');
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => setDispatchStatus(''), 3000);
    } catch (err) {
      console.error('Error creating alert:', err.message);
      setDispatchStatus('Failed to send alert. Check permissions.');
    }
  };

  const handleApplySim = async (e) => {
    e.preventDefault();
    setSimStatus('');
    try {
      await axios.put(`/api/stadium/points/${selectedPointId}`, {
        crowdLevel: simCrowdLevel,
        queueSize: simQueueSize
      });
      setSimStatus('Metrics synchronized successfully!');
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => setSimStatus(''), 3000);
    } catch (err) {
      console.error('Simulator sync error:', err.message);
      setSimStatus('Failed to update metrics.');
    }
  };

  const handleQuickRecApply = async (rec) => {
    try {
      // Automatically publish alert reflecting the recommendation
      await axios.post('/api/stadium/alerts', {
        type: 'warning',
        message: `STADIUM DECISION: ${rec.recommendation}. Reason: ${rec.reason}`,
        source: 'AI Operations Advisor'
      });
      
      // Remove recommendation from the panel to simulate completion
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
      setRefreshTrigger(prev => prev + 1);
      alert('Recommendation applied: Broadcast alert dispatched to all fans!');
    } catch (err) {
      console.error('Error applying recommendation:', err.message);
    }
  };

  // Compute live averages for header metrics
  const totalQueued = points.reduce((sum, p) => sum + (p.queueSize || 0), 0);
  const avgCrowd = Math.round(points.reduce((sum, p) => sum + (p.crowdLevel || 0), 0) / points.length) || 0;
  const gatesData = points.filter(p => p.type === 'gate').map(p => ({
    name: p.name.split(' (')[0],
    queue: p.queueSize,
    crowd: p.crowdLevel
  }));

  return (
    <div class="max-w-7xl mx-auto w-full px-4 py-6 md:py-10 space-y-6">
      
      {/* Header */}
      <div class="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 class="text-xl md:text-2xl font-extrabold text-white flex items-center gap-1.5 font-sans">
            <Shield class="w-6 h-6 text-emerald-500" /> StadiumPulse Ops Dashboard
          </h1>
          <p class="text-xs text-gray-400 mt-1">Real-time World Cup stadium analytics, simulator triggers and dispatch tools.</p>
        </div>
        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          class="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-white/10 text-emerald-400 transition-all flex items-center gap-1 accessible-focus"
          aria-label="Refresh Dashboard Metrics"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span class="text-xs font-semibold hidden md:inline">Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div class="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 font-semibold block uppercase">Stad. Occupancy</span>
            <span class="text-lg md:text-xl font-bold text-white block mt-1">79,800 / 80,000</span>
          </div>
          <Users class="w-5 h-5 text-emerald-400 opacity-60" />
        </div>

        {/* Metric 2 */}
        <div class="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 font-semibold block uppercase">Total Queued</span>
            <span class="text-lg md:text-xl font-bold text-white block mt-1">{totalQueued} Fans</span>
          </div>
          <Clock class="w-5 h-5 text-blue-400 opacity-60" />
        </div>

        {/* Metric 3 */}
        <div class="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 font-semibold block uppercase">Avg Congestion</span>
            <span class="text-lg md:text-xl font-bold text-white block mt-1">{avgCrowd}% Scale</span>
          </div>
          <Sliders class="w-5 h-5 text-amber-400 opacity-60" />
        </div>

        {/* Metric 4 */}
        <div class="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 font-semibold block uppercase">Operations Mode</span>
            <span class="text-xs font-extrabold text-emerald-400 block mt-2 border border-emerald-500/20 px-2 py-0.5 w-fit rounded bg-emerald-500/5">
              ACTIVE - AI GUIDED
            </span>
          </div>
          <Shield class="w-5 h-5 text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Main Grid: Charts & AI Recommendations */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Charts */}
        <div class="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Ingress Gates queue size */}
          <div class="glass-panel p-4 rounded-2xl">
            <h3 class="text-sm font-bold text-white mb-4">Gate Queue Sizes (Ingress Flow)</h3>
            <div class="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gatesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#10b981', fontSize: 11 }}
                  />
                  <Bar dataKey="queue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Occupancy speed */}
          <div class="glass-panel p-4 rounded-2xl">
            <h3 class="text-sm font-bold text-white mb-4">Stadium Entry Aggregations (Line Trend)</h3>
            <div class="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
                    itemStyle={{ color: '#3b82f6', fontSize: 11 }}
                  />
                  <Line type="monotone" dataKey="fans" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* AI Recommendations Panel */}
        <div class="lg:col-span-1 glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-white mb-3.5 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sparkles class="w-4 h-4 text-emerald-400 animate-pulse" /> AI Operational Advice
            </h3>

            <div class="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map(rec => (
                  <div key={rec.id} class="p-3 bg-gray-950/80 border border-white/5 rounded-xl space-y-2">
                    <div class="flex items-start justify-between gap-1">
                      <h4 class="text-xs font-bold text-white leading-normal pr-4">
                        {rec.recommendation}
                      </h4>
                      <span class="text-[9px] font-extrabold text-emerald-400 border border-emerald-500/20 px-1 rounded uppercase shrink-0">
                        {rec.confidence} Match
                      </span>
                    </div>

                    <p class="text-[10px] text-gray-400 leading-normal">
                      <strong>Reason:</strong> {rec.reason}
                    </p>

                    <div class="text-[10px] bg-emerald-500/5 text-emerald-400 p-1.5 rounded border border-emerald-500/10 leading-normal">
                      <strong>Expected Impact:</strong> {rec.impact}
                    </div>

                    <button
                      onClick={() => handleQuickRecApply(rec)}
                      class="w-full mt-1.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-black text-[10px] font-extrabold rounded transition-all accessible-focus"
                    >
                      Apply & Broadcast Directives
                    </button>
                  </div>
                ))
              ) : (
                <div class="text-xs text-gray-500 text-center py-20 flex flex-col items-center gap-1.5">
                  <CheckCircle2 class="w-8 h-8 text-emerald-500" />
                  No immediate operations adjustments needed. Live metrics are healthy.
                </div>
              )}
            </div>
          </div>

          <div class="mt-4 text-[10px] text-gray-500 text-center leading-normal">
            Recommendations compiled by analyzing live counter wait speeds against layout matrices.
          </div>
        </div>

      </div>

      {/* Simulator & Custom Dispatch Row */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* 1. Dispatch Operations Alerts */}
        <div class="glass-panel p-5 rounded-2xl">
          <h3 class="text-sm font-bold text-white mb-3.5 flex items-center gap-1.5">
            <AlertTriangle class="w-4.5 h-4.5 text-amber-500" /> Dispatch Emergency Alerts
          </h3>

          <form onSubmit={handlePublishAlert} class="space-y-3.5">
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAlertType('info')}
                class={`py-1.5 text-xs rounded-lg font-semibold transition-all border ${alertType === 'info' ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-bold' : 'bg-gray-950 border-white/5 text-gray-400'}`}
              >
                INFO
              </button>
              <button
                type="button"
                onClick={() => setAlertType('warning')}
                class={`py-1.5 text-xs rounded-lg font-semibold transition-all border ${alertType === 'warning' ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' : 'bg-gray-950 border-white/5 text-gray-400'}`}
              >
                WARNING
              </button>
              <button
                type="button"
                onClick={() => setAlertType('emergency')}
                class={`py-1.5 text-xs rounded-lg font-semibold transition-all border ${alertType === 'emergency' ? 'bg-red-500/10 border-red-500 text-red-400 font-bold' : 'bg-gray-950 border-white/5 text-gray-400'}`}
              >
                EMERGENCY
              </button>
            </div>

            <div>
              <label htmlFor="alert-msg" class="text-[10px] text-gray-400 font-semibold block mb-1">ALERT ANNOUNCEMENT MESSAGE</label>
              <textarea
                id="alert-msg"
                rows="2"
                required
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Evacuation notices, escalator shutdowns, or gate re-routing orders..."
                class="w-full bg-gray-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-emerald-400 font-semibold">{dispatchStatus}</span>
              <button
                type="submit"
                class="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all accessible-focus"
              >
                <Send class="w-3.5 h-3.5" /> Broadcast Announcement
              </button>
            </div>
          </form>
        </div>

        {/* 2. Real-Time Crowd Simulator */}
        <div class="glass-panel p-5 rounded-2xl">
          <h3 class="text-sm font-bold text-white mb-3.5 flex items-center gap-1.5">
            <Sliders class="w-4.5 h-4.5 text-blue-500" /> Stadium Crowd Simulator
          </h3>

          <form onSubmit={handleApplySim} class="space-y-3.5">
            <div class="grid grid-cols-2 gap-3">
              {/* Node Select */}
              <div>
                <label htmlFor="sim-node" class="text-[10px] text-gray-400 font-semibold block mb-1">TARGET POINT</label>
                <select
                  id="sim-node"
                  value={selectedPointId}
                  onChange={(e) => {
                    const pointId = e.target.value;
                    setSelectedPointId(pointId);
                    const point = points.find(p => p.id === pointId);
                    if (point) {
                      setSimCrowdLevel(point.crowdLevel);
                      setSimQueueSize(point.queueSize);
                    }
                  }}
                  class="w-full bg-gray-950 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {points.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Crowd Density slider */}
              <div>
                <label htmlFor="sim-crowd" class="text-[10px] text-gray-400 font-semibold block mb-1">CROWD CONGESTION ({simCrowdLevel}%)</label>
                <input
                  id="sim-crowd"
                  type="range"
                  min="0"
                  max="100"
                  value={simCrowdLevel}
                  onChange={(e) => setSimCrowdLevel(parseInt(e.target.value))}
                  class="w-full accent-emerald-400"
                />
              </div>
            </div>

            {/* Queue size selector */}
            <div>
              <label htmlFor="sim-queue" class="text-[10px] text-gray-400 font-semibold block mb-1">QUEUE SIZE (fans count)</label>
              <input
                id="sim-queue"
                type="number"
                min="0"
                max="1000"
                value={simQueueSize}
                onChange={(e) => setSimQueueSize(parseInt(e.target.value) || 0)}
                class="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs text-emerald-400 font-semibold">{simStatus}</span>
              <button
                type="submit"
                class="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs rounded-xl transition-all accessible-focus"
              >
                Sync Simulator State
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
