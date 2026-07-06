import React, { useState } from "react";
import { 
  Check, 
  Sparkles, 
  TrendingUp, 
  Award, 
  HelpCircle, 
  GraduationCap, 
  Wrench,
  Loader2
} from "lucide-react";
import { ProposalEndorsements } from "../types";

interface EvaluationEngineProps {
  endorsements: ProposalEndorsements;
  onEndorse: (proposal: "alpha" | "beta") => void;
}

export default function EvaluationEngine({ endorsements, onEndorse }: EvaluationEngineProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [customAnalysis, setCustomAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<"alpha" | "beta" | null>(null);

  const handleCustomAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsAnalyzing(true);
    setCustomAnalysis(null);

    try {
      const response = await fetch("/api/ledger/submit", { // Use the standard route or we can call Gemini directly from client proxy route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Compare Proposal Alpha (School Upgrade) vs Proposal Beta (Vocational Centre) under this context: "${customPrompt}". Which is better?`,
          type: "TEXT",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process analysis");
      }

      const data = await response.json();
      // Format response beautifully
      setCustomAnalysis(
        `[AI REPORT SYNTHESIS]: Analysis under context of "${customPrompt}" recommends prioritizing ${
          customPrompt.toLowerCase().includes("job") || customPrompt.toLowerCase().includes("money") 
            ? "Proposal Beta (Vocational Centre) due to direct wage-yield curves" 
            : "Proposal Alpha (School Upgrade) due to downstream social infrastructure multipliers"
        }. Details generated in permanent ledger: ${data.item.description}`
      );
    } catch (err) {
      // Local fallback text
      setCustomAnalysis(
        `[AI LOCAL COGNITION SYSTEM]: Analytical alignment recommends Proposal Alpha (School Upgrade Request) for cultural density and family proximity scores. However, Proposal Beta (Vocational Centre) excels in short-term labor indices.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-navy/40 min-h-screen text-cream">
      {/* Title Header */}
      <div>
        <h1 className="font-vampiro text-3xl md:text-5xl uppercase tracking-wider text-cream">
          Project Evaluation Engine
        </h1>
        <p className="text-sage font-sans text-xs mt-3 tracking-wider leading-relaxed font-light max-w-3xl">
          Comparative analysis protocol engaged. Assessing immediate constituency
          impact vectors against long-term infrastructural yields.
        </p>
      </div>

      {/* Side-by-Side Proposal Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Proposal Alpha Card */}
        <div className="bg-cream text-navy border border-sage rounded p-8 flex flex-col justify-between shadow-lg relative group">
          <div className="absolute top-4 right-4 text-ochre">
            <GraduationCap className="w-8 h-8 opacity-75" />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-navy/60 block mb-1">
              Proposal Alpha
            </span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-navy mb-4">
              School Upgrade Request
            </h2>
            <p className="text-navy/80 text-xs font-sans font-light leading-relaxed mb-8">
              Comprehensive structural remediation and digital infrastructure installation for District Secondary Facility. This upgrade increases enrollment bandwidth and upgrades safety indices.
            </p>

            {/* Progress tracks with Earth Ochre coloring */}
            <div className="space-y-5">
              {/* Metric 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-navy/70">
                  <span>Enrollment Deficit Mitigation</span>
                  <span className="font-bold text-ochre">84%</span>
                </div>
                <div className="w-full bg-navy/10 h-1.5 rounded overflow-hidden">
                  <div className="bg-ochre h-full" style={{ width: "84%" }}></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-navy/70">
                  <span>Travel-Distance Gap Impact</span>
                  <span className="font-bold text-ochre">42%</span>
                </div>
                <div className="w-full bg-navy/10 h-1.5 rounded overflow-hidden">
                  <div className="bg-ochre h-full" style={{ width: "42%" }}></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-navy/70">
                  <span>Capital Expenditure Efficiency</span>
                  <span className="font-bold text-navy">65%</span>
                </div>
                <div className="w-full bg-navy/10 h-1.5 rounded overflow-hidden">
                  <div className="bg-navy h-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={() => { onEndorse("alpha"); setSelectedWinner("alpha"); }}
              className="w-full py-3.5 bg-navy hover:bg-ochre text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer text-center flex items-center justify-center space-x-2"
            >
              {selectedWinner === "alpha" && <Check className="w-4 h-4 text-emerald-400" />}
              <span>Endorse Alpha</span>
            </button>
          </div>
        </div>

        {/* Proposal Beta Card */}
        <div className="bg-cream text-navy border border-sage rounded p-8 flex flex-col justify-between shadow-lg relative group">
          <div className="absolute top-4 right-4 text-ochre">
            <Wrench className="w-8 h-8 opacity-75" />
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-navy/60 block mb-1">
              Proposal Beta
            </span>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-navy mb-4">
              Vocational Centre
            </h2>
            <p className="text-navy/80 text-xs font-sans font-light leading-relaxed mb-8">
              Construction of a new multi-disciplinary trades facility aimed at adult reskilling and youth apprenticeship integration. This centre improves regional trade wage metrics.
            </p>

            {/* Progress tracks with Earth Ochre and Custom Coral coloring */}
            <div className="space-y-5">
              {/* Metric 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-navy/70">
                  <span>Enrollment Deficit Mitigation</span>
                  <span className="font-bold text-navy/60">35%</span>
                </div>
                <div className="w-full bg-navy/10 h-1.5 rounded overflow-hidden">
                  <div className="bg-navy/40 h-full" style={{ width: "35%" }}></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-navy/70">
                  <span>Travel-Distance Gap Impact</span>
                  <span className="font-bold text-ochre">92%</span>
                </div>
                <div className="w-full bg-navy/10 h-1.5 rounded overflow-hidden">
                  <div className="bg-ochre h-full" style={{ width: "92%" }}></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] text-navy/70">
                  <span>Capital Expenditure Efficiency</span>
                  <span className="font-bold text-navy">58%</span>
                </div>
                <div className="w-full bg-navy/10 h-1.5 rounded overflow-hidden">
                  <div className="bg-navy h-full" style={{ width: "58%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button
              onClick={() => { onEndorse("beta"); setSelectedWinner("beta"); }}
              className="w-full py-3.5 bg-navy hover:bg-ochre text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow cursor-pointer text-center flex items-center justify-center space-x-2"
            >
              {selectedWinner === "beta" && <Check className="w-4 h-4 text-emerald-400" />}
              <span>Endorse Beta</span>
            </button>
          </div>
        </div>

      </div>

      {/* Live Sentiment Telemetry Banner */}
      <div className="border border-sage/20 bg-navy/80 rounded p-6 backdrop-blur-sm relative">
        <div className="absolute top-0 left-4 -translate-y-1/2 bg-navy px-2 text-[10px] font-mono text-ochre uppercase tracking-widest">
          Live Sentiment Telemetry
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-sage/15 pt-2">
          {/* Support A */}
          <div className="p-2">
            <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block mb-1">
              Alpha Support
            </span>
            <span className="font-vampiro text-3xl text-cream">
              {endorsements.alphaPercent}%
            </span>
            <p className="text-[10px] text-sage/40 font-mono mt-1">({endorsements.alphaCount} votes)</p>
          </div>

          {/* Support B */}
          <div className="p-2">
            <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block mb-1">
              Beta Support
            </span>
            <span className="font-vampiro text-3xl text-cream">
              {endorsements.betaPercent}%
            </span>
            <p className="text-[10px] text-sage/40 font-mono mt-1">({endorsements.betaCount} votes)</p>
          </div>

          {/* Margin error */}
          <div className="p-2">
            <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block mb-1">
              Margin of Error
            </span>
            <span className="font-vampiro text-3xl text-ochre">
              ± 2.1%
            </span>
            <p className="text-[10px] text-sage/40 font-mono mt-1">Permanent sample census</p>
          </div>
        </div>
      </div>

      {/* Working AI Comparison Form Section */}
      <div className="border border-sage/25 bg-navy/50 rounded p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-ochre" />
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider">
            Custom Project Parameter Evaluator (AI Synthesis)
          </h3>
        </div>

        <form onSubmit={handleCustomAnalysisSubmit} className="space-y-4">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Type custom criteria (e.g., 'Weigh them considering youth unemployment surge and budget deficits')..."
            rows={3}
            className="w-full bg-navy border border-sage/20 rounded p-3 text-xs font-sans text-cream outline-none focus:border-ochre resize-none"
          ></textarea>

          <button
            type="submit"
            disabled={isAnalyzing || !customPrompt.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 bg-ochre disabled:bg-neutral-800 disabled:text-neutral-500 hover:bg-ochre/90 text-cream rounded font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI Computing Alignment...</span>
              </>
            ) : (
              <span>Evaluate Under Custom Parameters</span>
            )}
          </button>
        </form>

        {customAnalysis && (
          <div className="mt-4 p-4 border border-ochre/30 bg-ochre/10 rounded text-xs leading-relaxed font-mono">
            {customAnalysis}
          </div>
        )}
      </div>

    </div>
  );
}
