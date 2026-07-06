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
    <div className="p-6 md:p-8 space-y-8 bg-navy/40 min-h-screen text-cream">
      
      {/* Editorial Serif Header Block */}
      <div className="border-b border-sage/20 pb-6">
        <span className="font-mono text-[10px] text-ochre uppercase tracking-widest block mb-1">
          Initiative Status Tracker
        </span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-cream">
          Arterial Road Repair
        </h1>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 border border-sage/35 rounded font-mono text-[10px] uppercase">
            <MapPin className="w-3.5 h-3.5 text-ochre" />
            <span>Sector 4</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 border border-sage/35 rounded font-mono text-[10px] uppercase text-coral border-coral/40 bg-coral/5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Priority: Critical</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 border border-sage/35 rounded font-mono text-[10px] uppercase text-emerald-400 border-emerald-400/40 bg-emerald-400/5">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Active Construction Phase</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Civic Timeline (Left 2-Columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-lg font-bold tracking-widest text-cream uppercase border-b border-sage/15 pb-2">
            Civic Timeline
          </h2>

          <div className="relative border-l-2 border-sage/20 pl-8 ml-4 space-y-12">
            
            {/* Phase 1 */}
            <div className="relative">
              {/* Timeline bubble */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-navy border-2 border-ochre rounded flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-ochre rounded-sm"></div>
              </div>

              <div>
                <span className="font-mono text-[10px] text-sage/50 uppercase tracking-widest block mb-1">
                  Phase 1 • 2024-01-15
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-cream mb-4">
                  Demands Logged
                </h3>

                {/* Info Ledger card */}
                <div className="bg-cream text-navy border border-sage/30 rounded p-5 max-w-xl font-sans text-xs">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 border-b border-navy/10 pb-3 mb-3">
                    <div>
                      <span className="text-navy/60 text-[10px] uppercase tracking-wider block">Signatures Collected</span>
                      <strong className="text-sm font-mono text-navy">4,208</strong>
                    </div>
                    <div>
                      <span className="text-navy/60 text-[10px] uppercase tracking-wider block">Primary Concern</span>
                      <strong className="text-sm text-navy">Pothole Density</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-navy/60 uppercase">Verification Status</span>
                    <span className="text-ochre font-bold uppercase tracking-wider bg-ochre/10 px-2 py-0.5 rounded border border-ochre/20">Audited</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative">
              {/* Timeline bubble */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-navy border-2 border-ochre rounded flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-ochre rounded-sm"></div>
              </div>

              <div>
                <span className="font-mono text-[10px] text-sage/50 uppercase tracking-widest block mb-1">
                  Phase 2 • 2024-02-20
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-cream mb-4">
                  Engineering Assessment
                </h3>

                {/* Info Ledger card */}
                <div className="bg-cream text-navy border border-sage/30 rounded p-5 max-w-xl font-sans text-xs">
                  <div className="grid grid-cols-3 gap-4 border-b border-navy/10 pb-3 mb-3">
                    <div>
                      <span className="text-navy/60 text-[10px] uppercase tracking-wider block">Survey Team</span>
                      <strong className="text-sm text-navy">Unit B-4</strong>
                    </div>
                    <div>
                      <span className="text-navy/60 text-[10px] uppercase tracking-wider block">Damage Rating</span>
                      <strong className="text-sm text-coral">Severe (8.4/10)</strong>
                    </div>
                    <div>
                      <span className="text-navy/60 text-[10px] uppercase tracking-wider block">Est. Repair Span</span>
                      <strong className="text-sm text-navy">14 km</strong>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-navy/60 uppercase">Assessment Registry</span>
                    <span className="text-ochre font-bold uppercase tracking-wider bg-ochre/10 px-2 py-0.5 rounded border border-ochre/20">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative">
              {/* Timeline bubble active */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-navy border-2 border-emerald-500 rounded flex items-center justify-center animate-pulse">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
              </div>

              <div>
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block mb-1">
                  Current Phase • In Progress
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-cream mb-4">
                  Construction & Repair
                </h3>
                <p className="text-sage text-xs font-sans font-light leading-relaxed max-w-lg">
                  Heavy machinery is on-site. Asphalt paving laying sequence is initiated from Section A through Sector 4 central node.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Resource Allocation Sidebar Card (Right Column) */}
        <div className="space-y-6">
          <h2 className="font-serif text-lg font-bold tracking-widest text-cream uppercase border-b border-sage/15 pb-2">
            Resource Status
          </h2>

          <div className="bg-navy/80 border border-sage/25 rounded p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-4 right-4 text-ochre">
              <Building2 className="w-5 h-5 opacity-60" />
            </div>

            <h3 className="font-serif text-base font-bold text-cream mb-6 border-b border-sage/10 pb-3 flex items-center space-x-2">
              <Users className="w-4 h-4 text-ochre" />
              <span>Resource Allocation</span>
            </h3>

            {/* Allocation sliders tracking percentages */}
            <div className="space-y-6">
              
              {/* Progress 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-sage">Labor Force Secured</span>
                  <span className="text-cream font-bold">45%</span>
                </div>
                {/* Horizontal slider bar display */}
                <div className="w-full bg-navy h-2 border border-sage/20 rounded overflow-hidden">
                  <div className="bg-ochre h-full" style={{ width: "45%" }}></div>
                </div>
              </div>

              {/* Progress 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-sage">Materials Procured</span>
                  <span className="text-cream font-bold">80%</span>
                </div>
                <div className="w-full bg-navy h-2 border border-sage/20 rounded overflow-hidden">
                  <div className="bg-ochre h-full" style={{ width: "80%" }}></div>
                </div>
              </div>

              {/* Progress 3 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-sage">Permits Cleared</span>
                  <span className="text-cream font-bold">100%</span>
                </div>
                <div className="w-full bg-navy h-2 border border-sage/20 rounded overflow-hidden">
                  <div className="bg-ochre h-full" style={{ width: "100%" }}></div>
                </div>
              </div>

            </div>

            {/* Generate Report Button */}
            <div className="mt-8 pt-6 border-t border-sage/10">
              <button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="w-full py-3 bg-ochre hover:bg-ochre/90 text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer text-center flex items-center justify-center space-x-2"
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
                <p className="font-sans text-[11px] text-sage">
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
