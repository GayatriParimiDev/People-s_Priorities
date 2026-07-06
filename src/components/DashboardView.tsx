import React, { useState } from "react";
import { 
  Filter, 
  Maximize2, 
  MapPin, 
  Layers, 
  Calendar, 
  Activity, 
  CheckCircle,
  Eye
} from "lucide-react";
import { LedgerItem, ThemeStat, ViewState } from "../types";

interface DashboardViewProps {
  ledger: LedgerItem[];
  themes: ThemeStat[];
  totalDemands: number;
  setView: (view: ViewState) => void;
}

export default function DashboardView({ ledger, themes, totalDemands, setView }: DashboardViewProps) {
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<LedgerItem | null>(null);

  // Filter ledger items to plot on the map
  const filteredMapPoints = selectedThemeFilter 
    ? ledger.filter(item => item.theme === selectedThemeFilter)
    : ledger;

  // Let's compute some nice coordinates scaled onto an SVG container of size 500x400
  // Soho region bounding box (Lat: 51.508 to 51.517, Long: -0.141 to -0.130)
  const getMapCoordinates = (lat: number, lng: number) => {
    const minLat = 51.507;
    const maxLat = 51.518;
    const minLng = -0.142;
    const maxLng = -0.129;

    // Map to 10% - 90% space inside the SVG
    const x = 50 + ((lng - minLng) / (maxLng - minLng)) * 400;
    // SVGs draw from top to bottom, so invert Y
    const y = 350 - ((lat - minLat) / (maxLat - minLat)) * 300;

    return { x, y };
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#071D32]/40 min-h-screen">
      {/* Three Top-Tier Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Demands */}
        <div className="bg-[#F3E4C9] text-[#071D32] border border-[#D3D4C0] rounded p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#071D32]/70">
              Total Demands Logged
            </span>
            <Activity className="w-4 h-4 text-[#8B5E3C]" />
          </div>
          <div className="my-6">
            <h3 className="font-vampiro text-5xl md:text-6xl tracking-tighter text-[#071D32]">
              {totalDemands.toLocaleString()}
            </h3>
          </div>
          {/* Progress Indicator track */}
          <div className="w-full bg-[#071D32]/10 h-1 rounded overflow-hidden">
            <div className="bg-[#8B5E3C] h-full" style={{ width: "82%" }}></div>
          </div>
        </div>

        {/* Card 2: Critical Resolutions */}
        <div className="bg-[#F3E4C9] text-[#071D32] border border-[#D3D4C0] rounded p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#071D32]/70">
              Critical Resolutions
            </span>
            <CheckCircle className="w-4 h-4 text-[#D05A3F]" />
          </div>
          <div className="my-6">
            <h3 className="font-vampiro text-5xl md:text-6xl tracking-tighter text-[#071D32]">
              384
            </h3>
          </div>
          {/* Progress Indicator track */}
          <div className="w-full bg-[#071D32]/10 h-1 rounded overflow-hidden">
            <div className="bg-[#D05A3F] h-full" style={{ width: "58%" }}></div>
          </div>
        </div>

        {/* Card 3: Pending Allocation */}
        <div className="bg-[#F3E4C9] text-[#071D32] border border-[#D3D4C0] rounded p-6 flex flex-col justify-between shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#071D32]/70">
              Pending Allocation
            </span>
            <span className="font-mono text-xs font-bold text-[#8B5E3C]">USD</span>
          </div>
          <div className="my-6">
            <h3 className="font-vampiro text-5xl md:text-6xl tracking-tighter text-[#071D32]">
              8.4M
            </h3>
          </div>
          {/* Progress Indicator track */}
          <div className="w-full bg-[#071D32]/10 h-1 rounded overflow-hidden">
            <div className="bg-[#8B5E3C] h-full" style={{ width: "70%" }}></div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Demand Hotspot Map Block (Left 2-Columns wide) */}
        <div className="lg:col-span-2 bg-[#071D32]/80 border border-[#D3D4C0]/25 rounded flex flex-col justify-between relative overflow-hidden shadow-md">
          {/* Map Header */}
          <div className="p-4 border-b border-[#D3D4C0]/15 flex items-center justify-between bg-[#071D32]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5E3C] animate-pulse"></span>
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#F3E4C9]">
                Demand Hotspot Map
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Clear Filter Indicator */}
              {selectedThemeFilter && (
                <button 
                  onClick={() => setSelectedThemeFilter(null)}
                  className="font-mono text-[9px] text-[#D3D4C0] hover:text-[#F3E4C9] border border-[#D3D4C0]/30 px-2 py-0.5 rounded uppercase"
                >
                  Clear Filter
                </button>
              )}
              <button className="p-1 text-[#D3D4C0] hover:text-[#F3E4C9] transition-colors" title="Toggle Filters">
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 text-[#D3D4C0] hover:text-[#F3E4C9] transition-colors" title="Maximize Map View">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Tactical Map Area */}
          <div className="relative w-full aspect-video min-h-[350px] bg-neutral-950 flex items-center justify-center">
            {/* Ambient grid system background */}
            <div className="absolute inset-0 grid-bg opacity-25"></div>

            {/* Dark Tactical Cartography SVG Drawing (representing Soho Streets and Blocks) */}
            <svg viewBox="0 0 500 400" className="absolute inset-0 w-full h-full select-none opacity-40 pointer-events-none">
              {/* Central parks */}
              <rect x="50" y="50" width="80" height="120" fill="#D3D4C0" fillOpacity="0.05" stroke="#D3D4C0" strokeWidth="0.5" />
              <rect x="350" y="240" width="100" height="90" fill="#D3D4C0" fillOpacity="0.05" stroke="#D3D4C0" strokeWidth="0.5" />
              
              {/* Arterial main streets */}
              <line x1="100" y1="0" x2="100" y2="400" stroke="#D3D4C0" strokeWidth="1" strokeDasharray="5 5" />
              <line x1="280" y1="0" x2="280" y2="400" stroke="#D3D4C0" strokeWidth="1.5" />
              <line x1="420" y1="0" x2="420" y2="400" stroke="#D3D4C0" strokeWidth="1" />

              <line x1="0" y1="120" x2="500" y2="120" stroke="#D3D4C0" strokeWidth="1.5" />
              <line x1="0" y1="260" x2="500" y2="260" stroke="#D3D4C0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="340" x2="500" y2="340" stroke="#D3D4C0" strokeWidth="1" />

              {/* Minor grids */}
              <line x1="100" y1="120" x2="280" y2="260" stroke="#D3D4C0" strokeWidth="0.5" />
              <line x1="280" y1="120" x2="420" y2="260" stroke="#D3D4C0" strokeWidth="0.5" />

              {/* Bounding box coords */}
              <text x="12" y="22" fill="#D3D4C0" fillOpacity="0.3" fontSize="8" fontFamily="monospace">CITIES OF LONDON (E14001055)</text>
              <text x="12" y="385" fill="#D3D4C0" fillOpacity="0.3" fontSize="8" fontFamily="monospace">GRID REGION: 74-B // ACTIVE DATASET</text>
            </svg>

            {/* Glowing Map Hotspots */}
            <div className="absolute inset-0">
              {filteredMapPoints.map((item) => {
                const { x, y } = getMapCoordinates(item.latitude, item.longitude);
                const isCritical = item.priorityLevel === "CRITICAL";
                const isElevated = item.priorityLevel === "ELEVATED";
                
                let colorClass = "bg-[#8B5E3C]"; // standard
                if (isCritical) colorClass = "bg-[#D05A3F]"; // coral critical
                else if (isElevated) colorClass = "bg-[#F3E4C9]"; // cream elevated

                return (
                  <button
                    key={item.id}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onMouseEnter={() => setHoveredPoint(item)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => setView("LEDGER")}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer group focus:outline-none z-10"
                  >
                    {/* Ring pulsing glow */}
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 map-point-pulse ${
                      isCritical ? "bg-[#D05A3F]" : isElevated ? "bg-[#F3E4C9]" : "bg-[#8B5E3C]"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-[#071D32] ${colorClass}`}></span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Map Point Tooltip Overlay */}
            {hoveredPoint && (
              <div 
                className="absolute bg-[#071D32] border border-[#D3D4C0]/40 p-4 rounded shadow-2xl max-w-xs z-20 pointer-events-none"
                style={{ 
                  left: `${Math.min(getMapCoordinates(hoveredPoint.latitude, hoveredPoint.longitude).x + 2, 60)}%`, 
                  top: `${Math.min(getMapCoordinates(hoveredPoint.latitude, hoveredPoint.longitude).y - 12, 65)}%` 
                }}
              >
                <div className="flex justify-between items-center font-mono text-[9px] mb-1.5">
                  <span className="text-[#8B5E3C] uppercase tracking-widest">{hoveredPoint.id}</span>
                  <span className="text-[#D3D4C0]/70">{hoveredPoint.submissionDate.split(" ")[0]}</span>
                </div>
                <h4 className="font-serif text-xs font-bold text-[#F3E4C9] mb-1">{hoveredPoint.title}</h4>
                <p className="text-[10px] text-[#D3D4C0] font-sans leading-relaxed truncate mb-2">{hoveredPoint.description}</p>
                <div className="flex justify-between items-center pt-1.5 border-t border-[#D3D4C0]/10 font-mono text-[9px]">
                  <span className="text-[#D3D4C0]/60">RANK: {hoveredPoint.priorityLevel}</span>
                  <span className="text-emerald-400">STATUS: {hoveredPoint.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Map Footer coordinates readouts */}
          <div className="p-3 bg-neutral-950 border-t border-[#D3D4C0]/15 flex justify-between items-center font-mono text-[9px] text-[#D3D4C0]/40">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3 h-3 text-[#D05A3F]" />
              <span>LAT: 51.51268° N // LNG: 0.13601° W (DISTRICT CENTER)</span>
            </span>
            <span>ACTIVE MARKERS: {filteredMapPoints.length}</span>
          </div>
        </div>

        {/* Recurring Themes Panel (Right Block) */}
        <div className="bg-[#071D32]/80 border border-[#D3D4C0]/25 rounded flex flex-col justify-between shadow-md relative overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#D3D4C0]/15 bg-[#071D32]">
            <h2 className="font-serif text-base font-bold tracking-tight text-[#F3E4C9]">
              Recurring Themes
            </h2>
          </div>

          {/* List of Themes */}
          <div className="p-6 flex-1 space-y-6">
            {themes.map((theme, index) => {
              const isSelected = selectedThemeFilter === theme.name;
              // Normalize progress percentage relative to maximum count
              const maxCount = Math.max(...themes.map(t => t.count));
              const progressPct = maxCount > 0 ? (theme.count / maxCount) * 100 : 0;

              return (
                <div 
                  key={theme.id}
                  onClick={() => setSelectedThemeFilter(isSelected ? null : theme.name)}
                  className={`group p-3 border rounded transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? "border-[#8B5E3C] bg-[#8B5E3C]/10" 
                      : "border-[#D3D4C0]/15 hover:border-[#8B5E3C] bg-[#F3E4C9]/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-xs text-[#8B5E3C] group-hover:text-[#F3E4C9] transition-colors">
                        {theme.name}
                      </span>
                      <p className="text-[10px] text-[#D3D4C0]/60 font-mono mt-0.5">
                        {theme.count} Demands Logged
                      </p>
                    </div>
                    <span className="font-serif text-lg font-bold text-[#D3D4C0]/35 group-hover:text-[#F3E4C9] transition-colors">
                      {theme.id}
                    </span>
                  </div>

                  {/* Horizontal Progress Track */}
                  <div className="w-full bg-[#071D32] h-1.5 rounded overflow-hidden">
                    <div 
                      className="bg-[#8B5E3C] h-full transition-all duration-500" 
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View Full Ledger Button */}
          <div className="p-4 border-t border-[#D3D4C0]/15 bg-[#071D32]">
            <button
              onClick={() => setView("LEDGER")}
              className="w-full py-3 bg-[#F3E4C9] hover:bg-[#8B5E3C] hover:text-[#F3E4C9] text-[#0A2947] rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer text-center"
            >
              View Full Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
