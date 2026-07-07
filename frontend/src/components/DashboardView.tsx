import React, { useState, useEffect, useRef } from "react";
import { 
  Filter, 
  MapPin, 
  Layers, 
  Calendar, 
  Activity, 
  CheckCircle,
  Eye,
  AlertTriangle,
  TrendingUp,
  Terminal,
  Database,
  ShieldCheck,
  AlertCircle,
  Building,
  HelpCircle
} from "lucide-react";
import L from "leaflet";
import { LedgerItem, ThemeStat, ViewState, User } from "../types";

interface DashboardViewProps {
  ledger: LedgerItem[];
  themes: ThemeStat[];
  totalDemands: number;
  setView: (view: ViewState) => void;
  currentUser: User;
}

export default function DashboardView({ ledger, themes, totalDemands, setView, currentUser }: DashboardViewProps) {
  // Stats states from backend
  const [stats, setStats] = useState<any>(null);
  const [biasFlags, setBiasFlags] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Map settings
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapLayer, setMapLayer] = useState<"complaints" | "population" | "literacy" | "infrastructure">("complaints");

  // Rollup settings (MP vs MLA segment groupings)
  const [rollupBySegment, setRollupBySegment] = useState(currentUser.role === "MP");

  const token = localStorage.getItem("auth_token");
  const constituencyId = currentUser.districtId || "74-B";

  useEffect(() => {
    async function loadStats() {
      try {
        const statsRes = await fetch(`/api/proposals/dashboard/stats?constituency_id=${constituencyId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const biasRes = await fetch(`/api/proposals/dashboard/bias-flags?constituency_id=${constituencyId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const anomalyRes = await fetch(`/api/ai/anomalies/${constituencyId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (biasRes.ok) {
          const biasData = await biasRes.json();
          setBiasFlags(biasData);
        }
        if (anomalyRes.ok) {
          const anomalyData = await anomalyRes.json();
          setAnomalies(anomalyData);
        }
      } catch (err) {
        console.error("Error loading dashboard stats and anomalies:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [currentUser]);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapRef.current) return;

    let lat = 12.971598; // Default Bangalore center
    let lng = 77.594566;
    if (ledger && ledger.length > 0) {
      const validPoints = ledger.filter(item => typeof item.latitude === 'number' && typeof item.longitude === 'number');
      if (validPoints.length > 0) {
        lat = validPoints.reduce((sum, item) => sum + item.latitude, 0) / validPoints.length;
        lng = validPoints.reduce((sum, item) => sum + item.longitude, 0) / validPoints.length;
      }
    }

    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 13);
      return;
    }

    const map = L.map(mapRef.current).setView([lat, lng], 13);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    mapInstance.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [ledger]);

  // Update map layer polygons and markers
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing GeoJSON layer
    if (geojsonLayerRef.current) {
      mapInstance.current.removeLayer(geojsonLayerRef.current);
    }
    // Clear markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Generate dynamic polygon features around map center
    let centerLat = 12.971598;
    let centerLng = 77.594566;
    if (ledger && ledger.length > 0) {
      const validPoints = ledger.filter(item => typeof item.latitude === 'number' && typeof item.longitude === 'number');
      if (validPoints.length > 0) {
        centerLat = validPoints.reduce((sum, item) => sum + item.latitude, 0) / validPoints.length;
        centerLng = validPoints.reduce((sum, item) => sum + item.longitude, 0) / validPoints.length;
      }
    }

    const d = 0.015; // offset size
    const wardPolygons: any = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": { "name": "Ward Segment A", "complaints": 88, "population": 25000, "literacy": 82 },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [centerLng - d, centerLat + d],
              [centerLng, centerLat + d],
              [centerLng, centerLat],
              [centerLng - d, centerLat],
              [centerLng - d, centerLat + d]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Ward Segment B", "complaints": 72, "population": 18000, "literacy": 90 },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [centerLng, centerLat + d],
              [centerLng + d, centerLat + d],
              [centerLng + d, centerLat],
              [centerLng, centerLat],
              [centerLng, centerLat + d]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Ward Segment C", "complaints": 94, "population": 30000, "literacy": 74 },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [centerLng - d, centerLat],
              [centerLng, centerLat],
              [centerLng, centerLat - d],
              [centerLng - d, centerLat - d],
              [centerLng - d, centerLat]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Ward Segment D", "complaints": 65, "population": 12000, "literacy": 88 },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [centerLng, centerLat],
              [centerLng + d, centerLat],
              [centerLng + d, centerLat - d],
              [centerLng, centerLat - d],
              [centerLng, centerLat]
            ]]
          }
        }
      ]
    };

    // Get color based on layer toggle
    const getStyleColor = (feature: any) => {
      const prop = feature.properties;
      if (mapLayer === "complaints") {
        return prop.complaints > 85 ? "#ef4444" : prop.complaints > 70 ? "#f97316" : "#eab308";
      } else if (mapLayer === "population") {
        return prop.population > 20000 ? "#3b82f6" : "#60a5fa";
      } else if (mapLayer === "literacy") {
        return prop.literacy > 85 ? "#10b981" : "#059669";
      }
      return "#64748b"; // infrastructure points layer style
    };

    // Add GeoJSON to Map
    geojsonLayerRef.current = L.geoJSON(wardPolygons, {
      style: (feature) => ({
        fillColor: getStyleColor(feature),
        fillOpacity: 0.25,
        color: "#cbd5e1",
        weight: 1.5
      }),
      onEachFeature: (feature, layer) => {
        const prop = feature.properties;
        layer.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; color: #1e293b; padding: 4px;">
            <strong style="font-size: 13px;">${prop.name}</strong>
            <hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;"/>
            Demand Score Density: <strong>${prop.complaints}</strong>
            <br/>Population: <strong>${prop.population.toLocaleString()}</strong>
            <br/>Literacy Rate: <strong>${prop.literacy}%</strong>
          </div>
        `);
      }
    }).addTo(mapInstance.current);

    // 2. Plot infrastructure markers or complaints pin points
    if (mapLayer === "infrastructure") {
      const infraPoints = [
        { lat: 51.5135, lng: -0.1372, name: "Soho Science Secondary Academy", type: "School" },
        { lat: 51.5112, lng: -0.1345, name: "Soho Primary Health Clinic", type: "Hospital" },
        { lat: 51.5158, lng: -0.1312, name: "Water Distribution Reservoir", type: "Utility" },
      ];
      infraPoints.forEach(p => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 7,
          fillColor: "#3b82f6",
          color: "#ffffff",
          weight: 2,
          fillOpacity: 0.95
        }).addTo(markersGroupRef.current!);
        
        marker.bindPopup(`<strong>${p.name}</strong><br/>Type: ${p.type}`);
      });
    } else {
      // Plot project proposals markers
      ledger.forEach(item => {
        const marker = L.circleMarker([item.latitude, item.longitude], {
          radius: 6,
          fillColor: item.priorityLevel === "CRITICAL" ? "#ef4444" : "#eab308",
          color: "#ffffff",
          weight: 1.5,
          fillOpacity: 0.9
        }).addTo(markersGroupRef.current!);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong>${item.title}</strong><br/>
            Priority: ${item.priorityLevel}<br/>
            Status: ${item.status}
          </div>
        `);
      });
    }

  }, [mapLayer, ledger]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0B4F92] mb-3"></div>
        <span className="font-mono text-xs text-[#4F5A6D] uppercase">Synchronizing Command Center...</span>
      </div>
    );
  }

  // WoW spike detector trend calculation mock
  const trendingTopics = [
    { category: "Water interlink", increase: "WoW +84%", urgency: "spike" },
    { category: "Street lighting", increase: "WoW +15%", urgency: "moderate" },
    { category: "Road potholes", increase: "WoW +42%", urgency: "high" }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F4F6F8] min-h-screen text-[#000000] font-sans">
      
      {/* Bias Detection Warning Banner */}
      {biasFlags.length > 0 && (
        <div className="border border-[#C92A2A]/25 bg-[#C92A2A]/5 p-4 rounded-lg flex items-center space-x-3 text-xs font-mono text-[#C92A2A] animate-fadeIn font-bold">
          <AlertCircle className="w-5 h-5 text-[#C92A2A] shrink-0" />
          <div>
            <span className="font-bold uppercase block text-[#C92A2A]">Bias-Detection Flag: Underserved Areas</span>
            Historical allocation audit indicates that <strong className="text-[#C92A2A]">{biasFlags.map(f => f.ward_id).join(", ")}</strong> has top-tercile citizen demands but bottom-tercile funding approvals. Neutralize favoritism warnings active.
          </div>
        </div>
      )}

      {/* AI Anomaly & Manipulation Alert Card */}
      {anomalies.length > 0 && (
        <div className="space-y-3">
          {anomalies.map((anom, idx) => (
            <div 
              key={idx} 
              className="border border-[#6F32CF]/20 bg-white p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans text-[#000000] accent-bar-ai"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-[#6F32CF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase block text-[#6F32CF] text-[10px] font-mono tracking-wider">
                    Manipulation Alert // Anomaly Watch Agent
                  </span>
                  <h4 className="font-display font-bold text-sm text-[#000000] mt-0.5">
                    Coordinated Campaign: {anom.anomaly_type.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <p className="text-[#4F5A6D] mt-1 leading-relaxed">
                    {anom.explanation}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end justify-center shrink-0">
                <span className="bg-[#6F32CF] text-white px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider shadow-sm">
                  Threat score: {anom.score}%
                </span>
                <span className="text-[8px] text-[#4F5A6D] font-mono mt-1 font-bold">
                  Detected: {new Date(anom.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top row stats deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Composite Health Gauge (4 cols) */}
        <div className="lg:col-span-4 bg-white text-[#000000] border border-[#E2E8F0] rounded-lg p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start border-b border-[#E2E8F0] pb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#4F5A6D]">Constituency Health Score</span>
            <Activity className="w-4 h-4 text-[#0B4F92]" />
          </div>

          <div className="my-6 flex flex-col items-center justify-center space-y-2 relative">
            {/* SVG composite gauge */}
            <svg viewBox="0 0 100 60" className="w-full max-w-[180px]">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#0B4F92" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeDasharray="125" 
                strokeDashoffset={125 - (125 * (stats?.healthScore || 75)) / 100}
              />
              <text x="50" y="46" textAnchor="middle" className="font-display text-2xl font-bold" fill="#000000">
                {stats?.healthScore || 75}
              </text>
              <text x="50" y="58" textAnchor="middle" className="font-mono text-[6px] uppercase tracking-widest" fill="#4F5A6D" opacity="0.8">
                Score / 100
              </text>
            </svg>
          </div>

          <div className="font-mono text-[10px] text-[#4F5A6D] space-y-1.5 border-t border-[#E2E8F0] pt-3">
            <div className="flex justify-between">
              <span>Unresolved Backlog:</span>
              <strong className="text-[#000000]">{stats?.unresolvedCount} projects</strong>
            </div>
            <div className="flex justify-between">
              <span>Average Proposal Age:</span>
              <strong className="text-[#000000]">{stats?.avgAgeDays} days</strong>
            </div>
            <div className="flex justify-between">
              <span>Sentiment Trend:</span>
              <strong className="text-[#12776D]">Optimistic</strong>
            </div>
          </div>
        </div>

        {/* Live Heatmap display (8 cols) */}
        <div className="lg:col-span-8 bg-white text-[#000000] border border-[#E2E8F0] rounded-lg flex flex-col justify-between shadow-sm overflow-hidden relative">
          
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F4F6F8] flex justify-between items-center flex-wrap gap-4 z-10">
            <div>
              <h2 className="font-display text-base font-bold tracking-tight text-[#000000]">Live Demand Heatmap</h2>
              <span className="text-[9px] font-mono text-[#4F5A6D] uppercase">Geographical demand plot // color-coded per ward</span>
            </div>
            {/* Layer toggles */}
            <div className="flex bg-[#EBF0F5] border border-[#E2E8F0] rounded p-0.5 space-x-1 text-[9px] font-mono font-bold">
              <button 
                onClick={() => setMapLayer("complaints")}
                className={`px-2 py-1 rounded cursor-pointer uppercase ${mapLayer === "complaints" ? "bg-[#0B4F92] text-white" : "text-[#4F5A6D] hover:text-[#000000]"}`}
              >
                Complaints
              </button>
              <button 
                onClick={() => setMapLayer("population")}
                className={`px-2 py-1 rounded cursor-pointer uppercase ${mapLayer === "population" ? "bg-[#0B4F92] text-white" : "text-[#4F5A6D] hover:text-[#000000]"}`}
              >
                Density
              </button>
              <button 
                onClick={() => setMapLayer("literacy")}
                className={`px-2 py-1 rounded cursor-pointer uppercase ${mapLayer === "literacy" ? "bg-[#0B4F92] text-white" : "text-[#4F5A6D] hover:text-[#000000]"}`}
              >
                Literacy
              </button>
              <button 
                onClick={() => setMapLayer("infrastructure")}
                className={`px-2 py-1 rounded cursor-pointer uppercase ${mapLayer === "infrastructure" ? "bg-[#0B4F92] text-white" : "text-[#4F5A6D] hover:text-[#000000]"}`}
              >
                Infra points
              </button>
            </div>
          </div>

          {/* Leaflet DOM Anchor */}
          <div ref={mapRef} className="flex-1 min-h-[320px] bg-[#EBF0F5] z-0"></div>

          <div className="p-3 bg-white border-t border-[#E2E8F0] flex justify-between items-center text-[9px] font-mono text-[#4F5A6D]">
            <span>LAT: 51.51268° N // LNG: 0.13601° W (DISTRICT CENTER)</span>
            <span>ACTIVE SEGMENTS: 4 WARDS</span>
          </div>

        </div>

      </div>

      {/* Middle row: Category donut breakdown, trending spike panel, pending actions with aging badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Category breakdown */}
        <div className="bg-white text-[#000000] border border-[#E2E8F0] rounded-lg p-6 flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#4F5A6D] block border-b border-[#E2E8F0] pb-2 font-bold">
            Proposals Category Breakdown
          </span>

          <div className="p-4 flex-1 space-y-3 pt-4">
            {stats?.themesBreakdown.map((theme: any) => {
              const maxVal = Math.max(...stats.themesBreakdown.map((t: any) => t.count));
              const pct = maxVal > 0 ? (theme.count / maxVal) * 100 : 0;
              return (
                <div key={theme.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#0B4F92] uppercase font-bold">{theme.name}</span>
                    <span className="text-[#000000] font-bold">{theme.count}</span>
                  </div>
                  <div className="w-full bg-[#EBF0F5] h-1.5 rounded overflow-hidden">
                    <div className="bg-[#0B4F92] h-full rounded" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spike detector WoW */}
        <div className="bg-white text-[#000000] border border-[#E2E8F0] rounded-lg p-6 flex flex-col justify-between shadow-sm">
          <div className="border-b border-[#E2E8F0] pb-2 flex justify-between items-center">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#4F5A6D]">Trending Spike Detector</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#C92A2A]" />
          </div>

          <div className="flex-1 space-y-4 pt-4 font-mono text-xs">
            {trendingTopics.map((topic, i) => (
              <div key={i} className="p-3 bg-[#F4F6F8] border border-[#E2E8F0] rounded flex justify-between items-center">
                <div>
                  <span className="text-[#000000] font-bold block">{topic.category}</span>
                  <span className="text-[9px] text-[#4F5A6D] uppercase font-bold">Sudden Spike alert</span>
                </div>
                <span className="px-2.5 py-1 rounded tag-urgent font-bold font-mono text-[10px]">
                  {topic.increase}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Actions aging badges */}
        <div className="bg-white text-[#000000] border border-[#E2E8F0] rounded-lg p-6 flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#4F5A6D] block border-b border-[#E2E8F0] pb-2 font-bold">
            Pending Action Aging Badges
          </span>

          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-3 pt-4 scrollbar-thin">
            {stats?.pendingActions.map((action: any) => (
              <div key={action.id} className="p-2.5 bg-[#F4F6F8] border border-[#E2E8F0] rounded flex justify-between items-center">
                <div className="max-w-[70%]">
                  <h4 className="font-display text-xs font-bold text-[#000000] truncate">{action.title}</h4>
                  <span className="font-mono text-[8px] text-[#4F5A6D] uppercase block mt-0.5 font-bold">Category: {action.category}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                  action.urgency_badge === 'RED' ? 'tag-urgent border-[#C92A2A]/15' :
                  action.urgency_badge === 'YELLOW' ? 'tag-progress border-[#B97F00]/15' :
                  'tag-resolved border-[#12776D]/15'
                }`}>
                  {action.age_days}d aging
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MP vs MLA constituency rollup options */}
      {currentUser.role === "MP" && (
        <div className="border border-[#E2E8F0] bg-white p-4 rounded-lg flex justify-between items-center flex-wrap gap-4 text-[#000000] shadow-sm">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-[#0B4F92]" />
            <div>
              <span className="font-display text-sm font-bold block text-[#000000]">Elected Member Rollup Controls</span>
              <p className="text-[10px] text-[#4F5A6D]">Group analytics by assembly segments (MLA sub-divisions) within your parliamentary Lok Sabha boundary.</p>
            </div>
          </div>
          <button
            onClick={() => setRollupBySegment(!rollupBySegment)}
            className="btn-primary"
          >
            {rollupBySegment ? "Disable MLA rollup" : "Rollup by assembly segment"}
          </button>
        </div>
      )}

    </div>
  );
}
