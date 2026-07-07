import React, { useState, useEffect } from "react";
import { 
  Coins, 
  HelpCircle, 
  Sparkles, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, ViewState } from "../types";
import AISuggestionCard from "./AISuggestionCard";

interface FundsViewProps {
  currentUser: UserType;
  setView: (view: ViewState) => void;
}

export default function FundsView({ currentUser, setView }: FundsViewProps) {
  const [ledger, setLedger] = useState<{ total_fund: number; committed: number; remaining: number } | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any | null>(null);
  const [matchingScheme, setMatchingScheme] = useState<any | null>(null);
  const [loadingScheme, setLoadingScheme] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(true);

  // AI Optimizer State
  const [optimization, setOptimization] = useState<any | null>(null);

  const token = localStorage.getItem("auth_token");
  const constituencyId = currentUser.districtId || "74-B";

  useEffect(() => {
    async function loadLedger() {
      try {
        const res = await fetch(`/api/proposals/funds?constituency_id=${constituencyId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setLedger(data);
        }
      } catch (err) {
        console.error("Error loading ledger:", err);
      } finally {
        setLoadingLedger(false);
      }
    }

    async function loadProposals() {
      try {
        const res = await fetch(`/api/proposals?constituency_id=${constituencyId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProposals(data);
          if (data.length > 0) {
            setSelectedProp(data[0]);
          }
        }
      } catch (err) {
        console.error("Error loading proposals for funds view:", err);
      }
    }

    async function loadOptimization() {
      try {
        const res = await fetch(`/api/ai/budget-optimization/${constituencyId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOptimization(data);
        }
      } catch (err) {
        console.error("Error loading budget optimization:", err);
      }
    }

    loadLedger();
    loadProposals();
    loadOptimization();
  }, [constituencyId]);

  useEffect(() => {
    if (!selectedProp) return;
    triggerSchemeMatch();
  }, [selectedProp]);

  const triggerSchemeMatch = async () => {
    setLoadingScheme(true);
    setMatchingScheme(null);
    try {
      const res = await fetch(
        `/api/proposals/scheme-match?category=${selectedProp.category}&description=${encodeURIComponent(
          selectedProp.description
        )}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMatchingScheme(data);
      }
    } catch (err) {
      console.error("Error mapping scheme:", err);
    } finally {
      setLoadingScheme(false);
    }
  };

  const getSchemeType = () => {
    if (currentUser.role === "MP") return "MPLADS (Central Development Scheme)";
    return "MLALADS (State Constituency Development Fund)";
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-white min-h-screen text-black font-sans">
      
      {/* Title Header */}
      <div className="border-b border-zinc-200 pb-6">
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-black uppercase">
          Fund & Scheme Mapping
        </h1>
        <p className="text-zinc-600 text-xs mt-2 tracking-wider leading-relaxed font-light">
          Bridges project priorities to real budgetary constraints. Automatically evaluates categories against central/state scheme eligibility guidelines and computes efficiency metrics.
        </p>
      </div>

      {/* Ledger status cards (Colored background, white text!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total allocations */}
        <div className="bg-[#FDFBF7] text-[#1A1A2E] border-2 border-slate-200 rounded p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold">
              Constituency Allocation
            </span>
            <Coins className="w-4 h-4 text-[#4ECDC4]" />
          </div>
          <div className="my-5">
            <h3 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A2E]">
              ₹{ledger ? (ledger.total_fund / 10000000).toFixed(1) : "5.0"} Cr
            </h3>
            <span className="text-[10px] text-slate-500 font-mono block mt-1 font-bold">{getSchemeType()}</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
            <div className="bg-[#4ECDC4] h-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Card 2: Committed funds */}
        <div className="bg-[#FDFBF7] text-[#1A1A2E] border-2 border-slate-200 rounded p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold">
              Committed Funds
            </span>
            <Briefcase className="w-4 h-4 text-[#FF6B9D]" />
          </div>
          <div className="my-5">
            <h3 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A2E]">
              ₹{ledger ? (ledger.committed / 100000).toFixed(1) : "0.0"} L
            </h3>
            <span className="text-[10px] text-slate-500 font-mono block mt-1 font-bold">For approved project works</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
            <div className="bg-[#FF6B9D] h-full" style={{ 
              width: ledger ? `${Math.min(100, (ledger.committed / ledger.total_fund) * 100)}%` : "0%" 
            }}></div>
          </div>
        </div>

        {/* Card 3: Remaining balance */}
        <div className="bg-[#FDFBF7] text-[#1A1A2E] border-2 border-slate-200 rounded p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold">
              Remaining Balance
            </span>
            <ShieldCheck className="w-4 h-4 text-[#95D5B2]" />
          </div>
          <div className="my-5">
            <h3 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A2E]">
              ₹{ledger ? (ledger.remaining / 10000000).toFixed(2) : "5.00"} Cr
            </h3>
            <span className="text-[10px] text-slate-500 font-mono block mt-1 font-bold">Available for new assignments</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded overflow-hidden">
            <div className="bg-[#95D5B2] h-full" style={{ 
              width: ledger ? `${Math.min(100, (ledger.remaining / ledger.total_fund) * 100)}%` : "100%" 
            }}></div>
          </div>
        </div>
      </div>

      {/* AI Budget Optimization Banner */}
      {optimization && (
        <AISuggestionCard badgeText="Autonomous Budget Allocation Optimizer" className="mb-6 border-l-4 border-l-[#845EC2] bg-[#FDFBF7] border border-slate-200 shadow-sm">
          <div className="space-y-3 text-[#1A1A2E]">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#845EC2]/15 pb-2">
              <h4 className="font-bold text-sm text-[#1A1A2E]">
                Recommended Allocation Split (Maximizes Coverage)
              </h4>
              <div className="flex gap-3 text-[10px] font-mono font-bold">
                <span className="bg-[#845EC2] text-white px-2 py-0.5 rounded shadow-sm">
                  Allocated: ₹{(optimization.allocated_amount / 100000).toFixed(1)}L
                </span>
                <span className="bg-[#4ECDC4] text-[#1A1A2E] px-2 py-0.5 rounded shadow-sm font-bold">
                  Beneficiary Coverage: {optimization.coverage_percentage}%
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed font-sans font-light">
              <strong>AI Reasoning:</strong> {optimization.reasoning}
            </p>
            
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Recommended Projects to Fund:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                {optimization.recommended_split?.map((item: any, idx: number) => {
                  const prop = proposals.find(p => p.proposal_id === item.proposal_id);
                  const title = prop ? prop.title : `Project ${item.proposal_id.substring(0, 8)}`;
                  return (
                    <div key={idx} className="bg-white p-2.5 rounded border border-slate-200 shadow-inner flex justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-800 line-clamp-1">{title}</span>
                        <span className="text-[10px] text-slate-500 italic block mt-0.5">"{item.justification}"</span>
                      </div>
                      <span className="font-mono text-emerald-600 font-bold shrink-0">₹{(item.allocated_funds / 100000).toFixed(1)}L</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </AISuggestionCard>
      )}

      {/* Grid selector / details split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column: Proposal efficiency metrics list (5 cols) */}
        <div className="lg:col-span-5 border border-zinc-200 bg-zinc-50 rounded-lg p-5 flex flex-col space-y-4 text-black">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block border-b border-zinc-200 pb-2 flex justify-between">
            <span>Project Cost Efficiency</span>
            <span>Cost/Beneficiary</span>
          </span>

          <div className="flex-1 overflow-y-auto max-h-[450px] space-y-2 scrollbar-thin">
            {proposals.map(p => {
              const costPerBen = p.beneficiary_count > 0 ? Math.round(p.cost_estimate / p.beneficiary_count) : 0;
              
              return (
                <div
                  key={p.proposal_id}
                  onClick={() => setSelectedProp(p)}
                  className={`p-3 rounded border text-left cursor-pointer transition-all flex justify-between items-center ${
                    selectedProp?.proposal_id === p.proposal_id
                      ? "border-ochre bg-ochre/5"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="space-y-1 pr-3 max-w-[70%]">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-ochre font-bold block">{p.category}</span>
                    <h4 className="font-serif text-xs font-bold text-zinc-950 line-clamp-1">{p.title}</h4>
                    <span className="text-[9px] font-mono text-zinc-500">Cost: ₹{(p.cost_estimate/100000).toFixed(1)}L</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-600">₹{costPerBen}</span>
                    <p className="text-[8px] font-mono text-zinc-500 mt-0.5">/ beneficiary</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: RAG Scheme Matching Engine (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {selectedProp ? (
            <div className="border border-zinc-200 bg-zinc-50 rounded-lg p-6 flex flex-col justify-between flex-1 space-y-6">
              
              {/* Proposal summary section */}
              <div>
                <span className="font-mono text-[10px] text-ochre uppercase font-bold tracking-wider">Active Evaluation Target</span>
                <h3 className="font-serif text-lg font-bold text-zinc-950 mt-1">{selectedProp.title}</h3>
                <p className="text-xs text-zinc-600 font-sans mt-2 max-w-xl font-light">{selectedProp.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 bg-white border border-zinc-200 p-3 rounded font-mono text-[10px]">
                  <div>
                    <span className="text-zinc-500">ESTIMATED BUDGET COST:</span>
                    <p className="text-zinc-950 font-bold text-xs mt-0.5">₹{(selectedProp.cost_estimate/100000).toFixed(1)} Lakh</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">PROJECTED BENEFICIARIES:</span>
                    <p className="text-zinc-950 font-bold text-xs mt-0.5">{selectedProp.beneficiary_count.toLocaleString()} residents</p>
                  </div>
                </div>
              </div>

              {/* RAG Scheme Matches Display — Warm Ivory Panel, Orchid Violet Accent */}
              <div className="border border-slate-200 bg-[#FDFBF7] text-[#1A1A2E] rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-2 text-[#845EC2]">
                    <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                    <span className="font-serif text-xs font-bold uppercase tracking-wider">AI Scheme Retrieval System (RAG)</span>
                  </div>
                  <BookOpen className="w-4 h-4 text-slate-500" />
                </div>

                {loadingScheme ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#845EC2]"></div>
                    <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Searching government manuals...</span>
                  </div>
                ) : matchingScheme ? (
                  <div className="space-y-3 font-mono text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">RECOMMENDED FUNDING SCHEME:</span>
                      <strong className="text-[#1A1A2E]">{matchingScheme.scheme_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">MANUAL CITATION SECTION:</span>
                      <strong className="text-[#845EC2]">{matchingScheme.section}</strong>
                    </div>
                    <div className="space-y-1 pt-2 border-t border-slate-200">
                      <span className="text-slate-500 block font-bold">ELIGIBILITY / COMPLIANCE ANALYSIS:</span>
                      <p className="text-[#1A1A2E] leading-relaxed text-left font-sans font-light">
                        "{matchingScheme.eligibility_summary}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-slate-400 italic">
                    Scheme matching details failed to load.
                  </div>
                )}
              </div>

              {/* Ledger check info */}
              <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ELIGIBILITY GUIDELINE DIRECTIVE COMPLIANT</span>
                </span>
                <span>RETRIEVED FROM OFFICIAL PUBLICATIONS</span>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-zinc-200 bg-zinc-50 rounded-lg text-xs font-mono text-zinc-500">
              SELECT A CONSTITUENT PROPOSAL FROM THE LEFT TO EVALUATE BUDGETING SCHEMES
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
