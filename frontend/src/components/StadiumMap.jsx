import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

export default function StadiumMap({ onNodeSelect }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Routing settings
  const [startNode, setStartNode] = useState('gate_b');
  const [endNode, setEndNode] = useState('seat_n');
  const { highContrast } = useAccessibility();
  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState('');
  
  // Accessibility filters for routing path
  const [useAccessibleRoute, setUseAccessibleRoute] = useState(false);

  // SVG dimensions
  const viewBoxWidth = 500;
  const viewBoxHeight = 500;

  // Fixed coordinates of intermediate junction nodes for rendering graph lines
  const junctionCoords = {
    "junc_nw": { x: 120, y: 120 },
    "junc_ne": { x: 380, y: 120 },
    "junc_sw": { x: 120, y: 380 },
    "junc_se": { x: 380, y: 380 },
    "seat_n": { x: 250, y: 170 },
    "seat_s": { x: 250, y: 330 },
    "seat_e": { x: 330, y: 250 },
    "seat_w": { x: 170, y: 250 }
  };

  const getCoordinates = (pointId) => {
    const point = points.find(p => p.id === pointId);
    if (point) return { x: point.x, y: point.y };
    return junctionCoords[pointId] || { x: 250, y: 250 };
  };

  const fetchPoints = async () => {
    try {
      const res = await api.get('/api/stadium/points');
      setPoints(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stadium points:', err.message);
    }
  };

  const handleFetchRoute = async () => {
    if (!startNode || !endNode) return;
    setRouteError('');
    try {
      const res = await api.get('/api/stadium/route', {
        params: {
          start: startNode,
          end: endNode,
          accessibility: useAccessibleRoute
        }
      });
      setRoute(res.data);
    } catch (err) {
      console.error('Error finding route:', err.response?.data?.message || err.message);
      setRoute(null);
      setRouteError(err.response?.data?.message || 'Could not find a route matching these options.');
    }
  };

  useEffect(() => {
    fetchPoints();
    const interval = setInterval(fetchPoints, 12000); // refresh every 12 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (points.length > 0) {
      handleFetchRoute();
    }
  }, [startNode, endNode, useAccessibleRoute, points]);

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    if (onNodeSelect) {
      onNodeSelect(point);
    }
  };

  // Color mapping based on crowd status
  const getStatusColor = (status) => {
    if (highContrast) return '#ffffff';
    switch (status) {
      case 'clear': return '#10b981'; // Green
      case 'moderate': return '#f59e0b'; // Yellow/Gold
      case 'congested': return '#ea580c'; // Orange
      case 'critical': return '#ef4444'; // Red
      default: return '#9ca3af';
    }
  };

  const getStatusBgClass = (status) => {
    switch (status) {
      case 'clear': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'moderate': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'congested': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'critical': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Map Canvas Section */}
      <div className="lg:col-span-2 glass-panel p-4 rounded-2xl flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-emerald-400" /> Interactive Stadium Heatmap & Navigation
          </h2>
          <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 animate-pulse-slow">
            Live Feed
          </span>
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center min-h-[350px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="relative flex-grow flex items-center justify-center bg-gray-950/60 rounded-xl p-2 border border-white/5">
            <svg 
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
              className="w-full max-h-[460px] select-none"
              role="img"
              aria-label="Stadium interactive map visualizer showing entrances, food blocks, and toilets colored by crowd level."
            >
              <defs>
                {/* Glow Filter for Active Routes */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* A. Outer Stadium Boundary */}
              <ellipse 
                cx="250" 
                cy="250" 
                rx="230" 
                ry="215" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.08)" 
                strokeWidth="10" 
              />
              <ellipse 
                cx="250" 
                cy="250" 
                rx="225" 
                ry="210" 
                fill="rgba(17, 24, 39, 0.4)" 
                stroke="rgba(255, 255, 255, 0.03)" 
                strokeWidth="1.5" 
              />

              {/* B. Soccer Pitch / Field of Play */}
              <rect 
                x="150" 
                y="180" 
                width="200" 
                height="140" 
                rx="10"
                fill="rgba(16, 185, 129, 0.05)" 
                stroke="rgba(16, 185, 129, 0.2)" 
                strokeWidth="2.5" 
              />
              <line x1="250" y1="180" x2="250" y2="320" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" />
              <circle cx="250" cy="250" r="28" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" />

              {/* C. Render Graph Paths (Corridors) */}
              <g opacity="0.3" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5">
                {/* Main Outer corridor ring lines */}
                <line x1="250" y1="50" x2="120" y2="120" />
                <line x1="250" y1="50" x2="380" y2="120" />
                <line x1="120" y1="120" x2="50" y2="250" />
                <line x1="380" y1="120" x2="450" y2="250" />
                <line x1="50" y1="250" x2="120" y2="380" />
                <line x1="450" y1="250" x2="380" y2="380" />
                <line x1="120" y1="380" x2="250" y2="450" />
                <line x1="380" y1="380" x2="250" y2="450" />
                
                {/* Radial corridor lines to pitch entry sectors */}
                <line x1="120" y1="120" x2="180" y2="120" />
                <line x1="380" y1="380" x2="320" y2="380" />
                <line x1="170" y1="250" x2="250" y2="170" />
                <line x1="250" y1="170" x2="330" y2="250" />
                <line x1="330" y1="250" x2="250" y2="330" />
                <line x1="250" y1="330" x2="170" y2="250" />
              </g>

              {/* D. Draw Computed Route Overlay */}
              {route && route.path && (
                <path
                  d={route.path.map((node, i) => `${i === 0 ? 'M' : 'L'} ${getCoordinates(node.id).x} ${getCoordinates(node.id).y}`).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
              )}

              {/* E. Render Nodes / Points of Interest */}
              {points.map((point) => {
                const color = getStatusColor(point.crowdLevel > 80 ? 'critical' : point.crowdLevel > 60 ? 'congested' : point.crowdLevel > 30 ? 'moderate' : 'clear');
                const isSelected = selectedPoint?.id === point.id;
                const isStart = startNode === point.id;
                const isEnd = endNode === point.id;

                return (
                  <g 
                    key={point.id} 
                    transform={`translate(${point.x}, ${point.y})`}
                    className="cursor-pointer group"
                    onClick={() => handlePointClick(point)}
                  >
                    {/* Ripple animation ring for critical/selected nodes */}
                    {(point.crowdLevel > 80 || isSelected) && (
                      <circle 
                        r="18" 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="1.5" 
                        className="animate-ping opacity-25" 
                      />
                    )}

                    {/* Outer highlight ring */}
                    <circle 
                      r={isSelected ? "14" : "10"} 
                      fill="rgba(15, 23, 42, 0.85)" 
                      stroke={isStart ? "#3b82f6" : isEnd ? "#10b981" : color} 
                      strokeWidth={isSelected || isStart || isEnd ? "3" : "1.5"} 
                      className="transition-all duration-300 group-hover:scale-125"
                    />

                    {/* Inner color center */}
                    <circle 
                      r="5" 
                      fill={isStart ? "#3b82f6" : isEnd ? "#10b981" : color} 
                    />

                    {/* Simple Label text representation */}
                    <text 
                      y="-16" 
                      textAnchor="middle" 
                      className="text-[9px] fill-gray-300 font-bold hidden group-hover:block bg-gray-900 border px-1"
                      pointerEvents="none"
                    >
                      {point.name.split(' (')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Junction helper markers for route rendering (only if route passes through) */}
              {Object.entries(junctionCoords).map(([key, coord]) => (
                <circle 
                  key={key}
                  cx={coord.x} 
                  cy={coord.y} 
                  r="3.5" 
                  fill="#4b5563" 
                  opacity="0.65" 
                />
              ))}
            </svg>

            {/* Navigation Route Path Indicators */}
            {route && (
              <div className="absolute bottom-3 left-3 bg-gray-900/90 border border-white/10 rounded-lg p-2.5 flex items-center gap-3 backdrop-blur max-w-[90%]">
                <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-[11px]">
                  <div className="font-bold text-gray-200">Optimal Dynamic Route Found</div>
                  <div className="text-gray-400 mt-0.5">
                    Est. Walk: <span className="text-emerald-400 font-semibold">{Math.round(route.distance / 10)} min</span> • 
                    Queue Congestion Cost: <span className="text-amber-400 font-semibold">x{parseFloat(route.totalCost / route.distance).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
            {routeError && (
              <div className="absolute bottom-3 left-3 bg-red-950/90 border border-red-500/40 rounded-lg p-2.5 flex items-center gap-2 backdrop-blur text-red-200 max-w-[90%]">
                <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0" />
                <span className="text-[10px] font-medium">{routeError}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Route Settings & Point Detail Panel */}
      <div className="flex flex-col gap-6">
        
        {/* Route Planner Card */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" /> Route Finder
          </h3>
          
          <div className="space-y-3">
            {/* Start Node Selection */}
            <div>
              <label htmlFor="start-node" className="text-[11px] font-semibold text-gray-400 block mb-1">START POINT</label>
              <select 
                id="start-node"
                value={startNode} 
                onChange={(e) => setStartNode(e.target.value)}
                className="w-full text-xs bg-gray-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 accessible-focus"
              >
                {points.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* End Node Selection */}
            <div>
              <label htmlFor="end-node" className="text-[11px] font-semibold text-gray-400 block mb-1">DESTINATION SECTOR</label>
              <select 
                id="end-node"
                value={endNode} 
                onChange={(e) => setEndNode(e.target.value)}
                className="w-full text-xs bg-gray-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500 accessible-focus"
              >
                {points.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                {/* Allow routing to seating sections too */}
                <option value="seat_n">North Seating Entry</option>
                <option value="seat_s">South Seating Entry</option>
                <option value="seat_e">East Seating Entry</option>
                <option value="seat_w">West Seating Entry</option>
              </select>
            </div>

            {/* Accessibility Checkbox */}
            <div className="flex items-center gap-2 pt-2 pb-1">
              <input 
                id="accessibility-route"
                type="checkbox" 
                checked={useAccessibleRoute}
                onChange={(e) => setUseAccessibleRoute(e.target.checked)}
                className="rounded bg-gray-950 border-white/10 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="accessibility-route" className="text-[11px] font-medium text-gray-300 cursor-pointer">
                Wheelchair-accessible route only
              </label>
            </div>

            <button
              onClick={handleFetchRoute}
              className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 accessible-focus"
            >
              <Navigation className="w-3.5 h-3.5" /> Recompute Optimal Route
            </button>
          </div>
        </div>

        {/* Selected POI Details Panel */}
        <div className="glass-panel p-4 rounded-2xl flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> Location Details
            </h3>

            {selectedPoint ? (
              <div className="space-y-3.5 animate-fadeIn">
                <div>
                  <h4 className="text-sm font-extrabold text-white">{selectedPoint.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{selectedPoint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-950 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-gray-500 font-semibold block uppercase">CROWD STATUS</span>
                    <span className={`inline-block text-xs font-extrabold mt-0.5 px-2 py-0.5 rounded ${getStatusBgClass(selectedPoint.status)}`}>
                      {selectedPoint.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-950 p-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-gray-500 font-semibold block uppercase">QUEUE LENGTH</span>
                    <span className="text-xs font-bold text-gray-200 block mt-0.5">
                      {selectedPoint.queueSize} people
                    </span>
                  </div>
                </div>

                <div className="bg-gray-950 p-2 rounded-lg border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Wait Time Prediction</span>
                  <span className="font-bold text-emerald-400">
                    ~{Math.round(selectedPoint.queueSize / 15) || 1} min
                  </span>
                </div>

                <div className="bg-gray-950 p-2 rounded-lg border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Wheelchair Accessible</span>
                  <span className={`font-bold ${selectedPoint.accessible ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedPoint.accessible ? 'YES (Step-free)' : 'NO (Stairs-only)'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-10">
                Click any gate, food concession, or restroom point on the heatmap to view live queues and wheelchair access options.
              </div>
            )}
          </div>

          {selectedPoint && (
            <div className="pt-3 border-t border-white/5 flex gap-2">
              <button 
                onClick={() => setStartNode(selectedPoint.id)}
                className="flex-1 py-1.5 bg-gray-900 border border-white/10 hover:border-blue-500/50 hover:bg-blue-950/20 text-gray-300 text-[11px] rounded transition-all font-semibold"
              >
                Set as Start
              </button>
              <button 
                onClick={() => setEndNode(selectedPoint.id)}
                className="flex-1 py-1.5 bg-gray-900 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-gray-300 text-[11px] rounded transition-all font-semibold"
              >
                Set as Destination
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
