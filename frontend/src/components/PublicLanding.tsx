import { motion } from "motion/react";
import { ArrowRight, Lock, Sparkles, HelpCircle } from "lucide-react";
import { LedgerItem, ViewState } from "../types";

interface PublicLandingProps {
  setView: (view: ViewState) => void;
  ledger: LedgerItem[];
}

export default function PublicLanding({ setView, ledger }: PublicLandingProps) {
  // Take last 4 items for the scrolling ticker
  const liveLogs = ledger.slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-[#1A1A2E] font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="font-vampiro text-2xl tracking-widest text-[#1A1A2E]">
              PEOPLE'S PRIORITIES
            </h1>
            <span className="bg-[#4ECDC4] text-[#1A1A2E] text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline font-bold">
              Civic Ledger v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 font-mono text-xs uppercase tracking-wider font-bold">
            <button onClick={() => setView("LANDING")} className="text-[#4ECDC4] hover:text-[#1A1A2E] transition-all">Principles</button>
            <button onClick={() => setView("LEDGER")} className="text-slate-500 hover:text-[#1A1A2E] transition-all">Ledger</button>
            <button onClick={() => setView("EVALUATION")} className="text-slate-500 hover:text-[#1A1A2E] transition-all">Impact</button>
            <button onClick={() => setView("SETTINGS")} className="text-slate-500 hover:text-[#1A1A2E] transition-all">Network</button>
          </nav>

          <div>
            <button 
              onClick={() => setView("AUTH")}
              className="px-5 py-2.5 bg-[#1A1A2E] text-white hover:bg-[#4ECDC4] hover:text-[#1A1A2E] transition-all duration-300 font-mono font-bold text-xs uppercase tracking-wider rounded border border-slate-200 shadow-md cursor-pointer"
            >
              Join Assembly
            </button>
          </div>
        </div>
      </header>

      {/* Hero Split Frame */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-slate-200 min-h-[500px]">
        {/* Left Side: Editorial Typography Block */}
        <div className="p-10 md:p-16 flex flex-col justify-between bg-white relative overflow-hidden">
          {/* Subtle concrete geometric shapes in background */}
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="font-mono text-xs uppercase tracking-widest text-[#4ECDC4] mb-4 flex items-center space-x-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FF6B9D] animate-pulse"></span>
              <span>Demands Platform Enabled</span>
            </div>
            
            <h2 className="font-vampiro text-5xl md:text-7xl leading-tight text-[#1A1A2E] uppercase tracking-wide">
              VOICE OF <br/>THE PEOPLE
            </h2>
            
            <p className="mt-8 text-slate-600 text-sm md:text-base font-sans max-w-lg leading-relaxed font-light">
              A permanent, immutable record of public intent. We translate collective voices into undeniable infrastructural data. This is not a suggestion box; this is the ledger of accountability.
            </p>
          </div>

          <div className="mt-12 relative z-10">
            <button 
              onClick={() => setView("INTAKE")}
              className="group flex items-center space-x-3 px-6 py-4 bg-[#4ECDC4] hover:bg-[#4ECDC4]/90 text-[#1A1A2E] font-mono font-bold text-xs uppercase tracking-widest rounded border border-slate-200 transition-all cursor-pointer shadow-lg"
            >
              <span>Initialize Citizens Input</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Side: Brutalist Concrete Graphic Frame */}
        <div className="relative bg-[#FDFBF7] overflow-hidden min-h-[350px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-end p-8 md:p-12">
          {/* Brutalist structure simulator overlay */}
          <div className="absolute inset-0 bg-[#1A1A2E]/5 mix-blend-color-burn z-10 pointer-events-none"></div>
          
          {/* Architectural Concrete SVG Artwork */}
          <div className="absolute inset-0 bg-cover bg-center z-0 opacity-45 grid-bg" />
          
          <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none">
            <rect x="100" y="50" width="600" height="500" fill="none" stroke="var(--color-sage)" strokeWidth="1" strokeDasharray="10 10"/>
            <path d="M100 100 L700 500" stroke="var(--color-sage)" strokeWidth="1" strokeDasharray="5 5"/>
            <path d="M700 100 L100 500" stroke="var(--color-sage)" strokeWidth="1" strokeDasharray="5 5"/>
            <polygon points="200,150 600,150 500,450 300,450" fill="none" stroke="var(--color-sage)" strokeWidth="2"/>
            <line x1="300" y1="250" x2="500" y2="250" stroke="var(--color-ochre)" strokeWidth="3"/>
            <circle cx="400" cy="350" r="40" fill="none" stroke="var(--color-ochre)" strokeWidth="2" strokeDasharray="4 4"/>
          </svg>

          {/* Glowing framing corner widgets */}
          <div className="absolute top-6 right-6 font-mono text-[9px] text-slate-500 flex flex-col items-end">
            <span>LOC: AUTO_GRID</span>
            <span>ZOOM: 100% // LEVEL 04</span>
          </div>

          <div className="relative z-10 p-6 bg-[#FDFBF7] border border-slate-200 backdrop-blur-md rounded max-w-md ml-auto shadow-md">
            <h3 className="font-serif text-lg font-bold text-[#1A1A2E] mb-2">Architectural Integrity</h3>
            <p className="text-slate-600 text-xs leading-relaxed font-sans font-light">
              Infrastructural deficits aren't issues of finance; they are errors of visibility. Our AI pipeline maps actual citizen representations directly into public ledgers to dictate state investments.
            </p>
          </div>
        </div>
      </section>

      {/* Live Scrolling Ticker Banner */}
      <section className="bg-[#FDFBF7] text-[#FF6B9D] mt-12 py-5 px-6 border-y border-slate-200 overflow-hidden relative select-none">
        <div className="flex items-center space-x-6 whitespace-nowrap animate-marquee">
          <span className="font-mono text-xs font-bold uppercase tracking-wider shrink-0 bg-[#1A1A2E] text-white px-2 py-0.5 rounded">
            Live Feed
          </span>
          <div className="flex space-x-12 font-mono text-xs text-[#FF6B9D] items-center font-bold">
            <span>| Permanent. Public. Immutable. //</span>
            {liveLogs.map((log) => (
              <span key={log.id} className="hover:text-[#FF6B9D]/85 hover:underline transition-all cursor-pointer" onClick={() => setView("LEDGER")}>
                LOG #{log.id.replace("LGR-", "")}: {log.title.toUpperCase()} - {log.priorityLevel} //
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* The 3-Column Pillars: Log, Analyze, Act */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 01 */}
          <div className="bg-[#FDFBF7] border border-slate-200 p-8 rounded-2xl flex flex-col justify-between group hover:border-[#FF6B9D] transition-all duration-300 shadow-sm">
            <div>
              <span className="font-vampiro text-5xl text-[#FF6B9D]/30 group-hover:text-[#FF6B9D]/60 transition-colors">01</span>
              <h3 className="font-mono text-sm uppercase tracking-widest text-[#1A1A2E] mt-4 mb-3 flex items-center space-x-2 font-bold">
                <span>Log</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D]"></span>
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans font-light">
                Raw public intake. Every concern, priority, and proposal is securely logged onto the immutable ledger via text representation, photo analysis, or speech transcription.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 font-mono text-[10px] text-[#FF6B9D] font-bold">
              SECURE_SHA256_INTEGRATION
            </div>
          </div>

          {/* Column 02 */}
          <div className="bg-[#FDFBF7] border border-slate-200 p-8 rounded-2xl flex flex-col justify-between group hover:border-[#845EC2] transition-all duration-300 shadow-sm">
            <div>
              <span className="font-vampiro text-5xl text-[#845EC2]/30 group-hover:text-[#845EC2]/60 transition-colors">02</span>
              <h3 className="font-mono text-sm uppercase tracking-widest text-[#1A1A2E] mt-4 mb-3 flex items-center space-x-2 font-bold">
                <span>Analyze</span>
                <Sparkles className="w-3.5 h-3.5 text-[#845EC2] animate-pulse" />
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans font-light">
                AI-driven synthesis identifies structural patterns across constituencies, transforming noisy citizen representations into distinct, quantified, priority-ordered development works.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 font-mono text-[10px] text-[#845EC2] font-bold">
              GEMINI_NEURAL_SYNTHESIS
            </div>
          </div>

          {/* Column 03 */}
          <div className="bg-[#FDFBF7] border border-slate-200 p-8 rounded-2xl flex flex-col justify-between group hover:border-[#95D5B2] transition-all duration-300 shadow-sm">
            <div>
              <span className="font-vampiro text-5xl text-[#95D5B2]/30 group-hover:text-[#95D5B2]/60 transition-colors">03</span>
              <h3 className="font-mono text-sm uppercase tracking-widest text-[#1A1A2E] mt-4 mb-3 flex items-center space-x-2 font-bold">
                <span>Act</span>
                <Lock className="w-3.5 h-3.5 text-[#95D5B2]" />
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-sans font-light">
                Direct civic impact tracking. Resources are mobilized, and timeline achievements are logged transparently on our public ledger interface for constant constituency auditing.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 font-mono text-[10px] text-[#95D5B2] font-bold">
              AUDITED_LEDGER_LEDGER_v1.0
            </div>
          </div>
        </div>
      </section>

      {/* Constituency Impact Progress Board */}
      <section className="bg-white border-t border-slate-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-vampiro text-3xl md:text-5xl uppercase tracking-wider text-[#1A1A2E]">
              CONSTITUENCY IMPACT
            </h2>
            <div className="w-24 h-[1px] bg-[#4ECDC4] mx-auto mt-4"></div>
            <p className="text-slate-500 text-xs font-mono uppercase mt-3 tracking-widest">
              Real-time project tracking and verification metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Project Card A */}
            <div 
              onClick={() => setView("TIMELINE")}
              className="bg-[#FDFBF7] border-2 border-slate-200 hover:border-[#FF6B9D] p-8 rounded-2xl cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-xl font-bold text-[#1A1A2E] group-hover:text-[#FF6B9D] transition-colors">
                  Arterial Road Repair
                </h3>
                <span className="font-mono text-[10px] font-bold bg-[#FF6B9D]/10 border border-[#FF6B9D]/20 text-[#FF6B9D] px-2 py-0.5 rounded">
                  CRITICAL
                </span>
              </div>
              <p className="text-slate-600 text-xs font-light leading-relaxed mb-6 font-sans">
                Mandate generated from 1,204 citizen logs. Engineering assessment complete, funding allocated, and roadwork actively scheduled.
              </p>
              
              {/* Progress track */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-500">PHASE 3 // ACTIVE REPAIR</span>
                  <span className="text-[#FF6B9D] font-bold">75% COMPLETE</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden p-[1px]">
                  <div className="bg-[#FF6B9D] h-full rounded-full transition-all duration-1000" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>

            {/* Project Card B */}
            <div 
              onClick={() => setView("EVALUATION")}
              className="bg-[#FDFBF7] border-2 border-slate-200 hover:border-[#FFA94D] p-8 rounded-2xl cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-xl font-bold text-[#1A1A2E] group-hover:text-[#FFA94D] transition-colors">
                  Solar Lighting Grid
                </h3>
                <span className="font-mono text-[10px] font-bold bg-[#FFA94D]/10 border border-[#FFA94D]/20 text-[#FFA94D] px-2 py-0.5 rounded">
                  ELEVATED
                </span>
              </div>
              <p className="text-slate-600 text-xs font-light leading-relaxed mb-6 font-sans">
                Pilot program initiated across 4 parks. Target: 100% renewable public path illumination by Q4 to decrease safety index deficits.
              </p>
              
              {/* Progress track */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-500">PHASE 1 // PROCUREMENT</span>
                  <span className="text-[#FFA94D] font-bold">25% COMPLETE</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 h-2.5 rounded-full overflow-hidden p-[1px]">
                  <div className="bg-[#FFA94D] h-full rounded-full transition-all duration-1000" style={{ width: "25%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assembly Invitation Banner CTA */}
      <section className="bg-[#FDFBF7] border-t border-b border-slate-200 py-20 px-6 text-center relative overflow-hidden font-sans">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="font-vampiro text-3xl md:text-5xl text-[#1A1A2E] uppercase tracking-widest leading-tight mb-8">
            READY TO LOG YOUR PRIORITY?
          </h2>
          <button 
            onClick={() => setView("AUTH")}
            className="px-8 py-4 bg-[#1A1A2E] text-white hover:bg-[#FF6B9D] hover:text-white transition-all duration-300 font-mono font-bold text-xs uppercase tracking-widest rounded border border-slate-200 shadow-xl cursor-pointer"
          >
            JOIN THE ASSEMBLY
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between font-mono text-xs text-slate-500 gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-vampiro text-lg tracking-wider text-[#1A1A2E]">PEOPLE'S PRIORITIES</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">© 2026 People's Priorities. A Permanent Public Record.</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase tracking-wider font-bold">
            <button onClick={() => setView("LANDING")} className="hover:text-[#1A1A2E] transition-colors">Charter</button>
            <button onClick={() => setView("SETTINGS")} className="hover:text-[#1A1A2E] transition-colors">Protocol</button>
            <button onClick={() => setView("LEDGER")} className="hover:text-[#1A1A2E] transition-colors">Ledger Access</button>
            <button onClick={() => setView("SETTINGS")} className="hover:text-[#1A1A2E] transition-colors">Governance</button>
            <button onClick={() => setView("LANDING")} className="hover:text-[#1A1A2E] transition-colors">Privacy</button>
            <button onClick={() => setView("SETTINGS")} className="hover:text-[#1A1A2E] transition-colors">Security</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
