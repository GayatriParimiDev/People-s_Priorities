import React, { useState } from "react";
import { 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Download, 
  Users, 
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";

export default function StatusTimeline() {
  const [downloading, setDownloading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setShowReport(true);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#071D32]/40 min-h-screen text-[#F3E4C9]">
      
      {/* Editorial Serif Header Block */}
      <div className="border-b border-[#D3D4C0]/20 pb-6">
        <span className="font-mono text-[10px] text-[#8B5E3C] uppercase tracking-widest block mb-1">
          Initiative Status Tracker
        </span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-[#F3E4C9]">
          Arterial Road Repair
        </h1>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#D3D4C0]/35 rounded font-mono text-[10px] uppercase">
            <MapPin className="w-3.5 h-3.5 text-[#8B5E3C]" />
            <span>Sector 4</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#D3D4C0]/35 rounded font-mono text-[10px] uppercase text-[#D05A3F] border-[#D05A3F]/40 bg-[#D05A3F]/5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Priority: Critical</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#D3D4C0]/35 rounded font-mono text-[10px] uppercase text-emerald-400 border-emerald-400/40 bg-emerald-400/5">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Active Construction Phase</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Civic Timeline (Left 2-Columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-lg font-bold tracking-widest text-[#F3E4C9] uppercase border-b border-[#D3D4C0]/15 pb-2">
            Civic Timeline
          </h2>

          <div className="relative border-l-2 border-[#D3D4C0]/20 pl-8 ml-4 space-y-12">
            
            {/* Phase 1 */}
            <div className="relative">
              {/* Timeline bubble */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-[#071D32] border-2 border-[#8B5E3C] rounded flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#8B5E3C] rounded-sm"></div>
              </div>

              <div>
                <span className="font-mono text-[10px] text-[#D3D4C0]/50 uppercase tracking-widest block mb-1">
                  Phase 1 • 2024-01-15
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-[#F3E4C9] mb-4">
                  Demands Logged
                </h3>

                {/* Info Ledger card */}
                <div className="bg-[#F3E4C9] text-[#071D32] border border-[#D3D4C0]/30 rounded p-5 max-w-xl font-sans text-xs">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-b border-[#071D32]/10 pb-3 mb-3">
                    <div>
                      <span className="text-[#071D32]/60 text-[10px] uppercase tracking-wider block">Signatures Collected</span>
                      <strong className="text-sm font-mono text-[#071D32]">4,208</strong>
                    </div>
                    <div>
                      <span className="text-[#071D32]/60 text-[10px] uppercase tracking-wider block">Primary Concern</span>
                      <strong className="text-sm text-[#071D32]">Pothole Density</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#071D32]/60 uppercase">Verification Status</span>
                    <span className="text-[#8B5E3C] font-bold uppercase tracking-wider bg-[#8B5E3C]/10 px-2 py-0.5 rounded border border-[#8B5E3C]/20">Audited</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative">
              {/* Timeline bubble */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-[#071D32] border-2 border-[#8B5E3C] rounded flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#8B5E3C] rounded-sm"></div>
              </div>

              <div>
                <span className="font-mono text-[10px] text-[#D3D4C0]/50 uppercase tracking-widest block mb-1">
                  Phase 2 • 2024-02-20
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-[#F3E4C9] mb-4">
                  Engineering Assessment
                </h3>

                {/* Info Ledger card */}
                <div className="bg-[#F3E4C9] text-[#071D32] border border-[#D3D4C0]/30 rounded p-5 max-w-xl font-sans text-xs">
                  <div className="grid grid-cols-3 gap-4 border-b border-[#071D32]/10 pb-3 mb-3">
                    <div>
                      <span className="text-[#071D32]/60 text-[10px] uppercase tracking-wider block">Survey Team</span>
                      <strong className="text-sm text-[#071D32]">Unit B-4</strong>
                    </div>
                    <div>
                      <span className="text-[#071D32]/60 text-[10px] uppercase tracking-wider block">Damage Rating</span>
                      <strong className="text-sm text-[#D05A3F]">Severe (8.4/10)</strong>
                    </div>
                    <div>
                      <span className="text-[#071D32]/60 text-[10px] uppercase tracking-wider block">Est. Repair Span</span>
                      <strong className="text-sm text-[#071D32]">14 km</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#071D32]/60 uppercase">Assessment Registry</span>
                    <span className="text-[#8B5E3C] font-bold uppercase tracking-wider bg-[#8B5E3C]/10 px-2 py-0.5 rounded border border-[#8B5E3C]/20">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative">
              {/* Timeline bubble active */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-[#071D32] border-2 border-emerald-500 rounded flex items-center justify-center animate-pulse">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
              </div>

              <div>
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block mb-1">
                  Current Phase • In Progress
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-[#F3E4C9] mb-4">
                  Construction & Repair
                </h3>
                <p className="text-[#D3D4C0] text-xs font-sans font-light leading-relaxed max-w-lg">
                  Heavy machinery is on-site. Asphalt paving laying sequence is initiated from Section A through Sector 4 central node.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Resource Allocation Sidebar Card (Right Column) */}
        <div className="space-y-6">
          <h2 className="font-serif text-lg font-bold tracking-widest text-[#F3E4C9] uppercase border-b border-[#D3D4C0]/15 pb-2">
            Resource Status
          </h2>

          <div className="bg-[#071D32]/80 border border-[#D3D4C0]/25 rounded p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-4 right-4 text-[#8B5E3C]">
              <Building2 className="w-5 h-5 opacity-60" />
            </div>

            <h3 className="font-serif text-base font-bold text-[#F3E4C9] mb-6 border-b border-[#D3D4C0]/10 pb-3 flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#8B5E3C]" />
              <span>Resource Allocation</span>
            </h3>

            {/* Allocation sliders tracking percentages */}
            <div className="space-y-6">
              
              {/* Progress 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#D3D4C0]">Labor Force Secured</span>
                  <span className="text-[#F3E4C9] font-bold">45%</span>
                </div>
                {/* Horizontal slider bar display */}
                <div className="w-full bg-[#071D32] h-2 border border-[#D3D4C0]/20 rounded overflow-hidden">
                  <div className="bg-[#8B5E3C] h-full" style={{ width: "45%" }}></div>
                </div>
              </div>

              {/* Progress 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#D3D4C0]">Materials Procured</span>
                  <span className="text-[#F3E4C9] font-bold">80%</span>
                </div>
                <div className="w-full bg-[#071D32] h-2 border border-[#D3D4C0]/20 rounded overflow-hidden">
                  <div className="bg-[#8B5E3C] h-full" style={{ width: "80%" }}></div>
                </div>
              </div>

              {/* Progress 3 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#D3D4C0]">Permits Cleared</span>
                  <span className="text-[#F3E4C9] font-bold">100%</span>
                </div>
                <div className="w-full bg-[#071D32] h-2 border border-[#D3D4C0]/20 rounded overflow-hidden">
                  <div className="bg-[#8B5E3C] h-full" style={{ width: "100%" }}></div>
                </div>
              </div>

            </div>

            {/* Generate Report Button */}
            <div className="mt-8 pt-6 border-t border-[#D3D4C0]/10">
              <button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="w-full py-3 bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-[#F3E4C9] rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer text-center flex items-center justify-center space-x-2"
              >
                {downloading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Signing Ledger Cert...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate Ledger Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report popup status display */}
          {showReport && (
            <div className="p-4 border border-emerald-500/40 bg-emerald-950/20 rounded flex items-start space-x-3 text-xs leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-400 font-mono text-[10px] block uppercase tracking-wider mb-1">
                  Report Certified & Secure
                </strong>
                <p className="font-sans text-[11px] text-[#D3D4C0]">
                  Ledger Report <strong>#LGR-REPAIR-74-B</strong> successfully compiled. Digital signature <code>SHA-256//789A_SEC4</code> registered with constituency database.
                </p>
                <button 
                  onClick={() => setShowReport(false)}
                  className="font-mono text-[10px] text-emerald-400 hover:underline mt-2 block"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
