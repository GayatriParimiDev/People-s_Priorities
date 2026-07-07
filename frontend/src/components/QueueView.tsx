import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Sparkles, 
  Check, 
  X, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  ArrowRightLeft, 
  SlidersHorizontal, 
  HelpCircle, 
  AlertCircle,
  TrendingUp,
  FileText,
  User,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, ViewState } from "../types";
import BloomCard from "./BloomCard";
import AISuggestionCard from "./AISuggestionCard";

interface QueueViewProps {
  currentUser: UserType;
  setView: (view: ViewState) => void;
  onSelectProposalForAudit?: (proposalId: string) => void;
}

export default function QueueView({ currentUser, setView, onSelectProposalForAudit }: QueueViewProps) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("demand_desc");

  // Comparison State
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Explanation State
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explainingIds, setExplainingIds] = useState<Record<string, boolean>>({});
  
  // Action Modal State
  const [actionProposal, setActionProposal] = useState<any | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [comment, setComment] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Staff Recommendation State
  const [recommendProposal, setRecommendProposal] = useState<any | null>(null);
  const [staffRecommend, setStaffRecommend] = useState("Recommend Approval");
  const [staffNotes, setStaffNotes] = useState("");
  const [submittingRecommend, setSubmittingRecommend] = useState(false);

  // Detail Expansion State
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // AI Agent recommendations & scheme matches states
  const [aiRecs, setAiRecs] = useState<Record<string, any>>({});
  const [aiSchemes, setAiSchemes] = useState<Record<string, any>>({});

  const token = localStorage.getItem("auth_token");
  const constituencyId = currentUser.districtId || "74-B";

  useEffect(() => {
    fetchProposals();
  }, [categoryFilter, statusFilter, wardFilter, sortBy]);

  useEffect(() => {
    if (proposals.length === 0) return;
    
    proposals.forEach(async (p) => {
      try {
        const recRes = await fetch(`/api/ai/recommendations/${p.proposal_id}`);
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData) {
            setAiRecs(prev => ({ ...prev, [p.proposal_id]: recData }));
          }
        }
        
        const schemeRes = await fetch(`/api/ai/schemes/${p.proposal_id}`);
        if (schemeRes.ok) {
          const schemeData = await schemeRes.json();
          if (schemeData) {
            setAiSchemes(prev => ({ ...prev, [p.proposal_id]: schemeData }));
          }
        }
      } catch (err) {
        console.error("Error fetching AI recommendation/scheme:", err);
      }
    });
  }, [proposals]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      let url = `/api/proposals?constituency_id=${constituencyId}`;
      if (categoryFilter !== "ALL") url += `&category=${categoryFilter.toLowerCase()}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter.toLowerCase()}`;
      if (wardFilter !== "ALL") url += `&ward_id=${wardFilter}`;
      url += `&sort_by=${sortBy}`;

      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (err) {
      console.error("Error loading proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectForCompare = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 proposals side-by-side.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const getAiExplanation = async (id: string, breakdown: any) => {
    if (explanations[id]) return;
    setExplainingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/proposals/${id}/explain-ranking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ demand_score_breakdown: breakdown })
      });
      if (res.ok) {
        const data = await res.json();
        setExplanations(prev => ({ ...prev, [id]: data.explanation }));
      }
    } catch (err) {
      console.error("Error explaining ranking:", err);
    } finally {
      setExplainingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const openActionModal = (proposal: any, type: string) => {
    setActionProposal(proposal);
    setActionType(type);
    setComment("");
    setActionError(null);
  };

  const closeActionModal = () => {
    setActionProposal(null);
    setActionType("");
    setComment("");
    setActionError(null);
  };

  const submitAction = async () => {
    if (!comment.trim()) {
      setActionError("A decision comment is strictly required.");
      return;
    }
    setSubmittingAction(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/proposals/${actionProposal.proposal_id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          action: actionType,
          comment: comment,
          userId: currentUser.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      // Refresh data
      fetchProposals();
      closeActionModal();
    } catch (err: any) {
      setActionError(err.message || "Failed to commit action.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const openRecommendModal = (proposal: any) => {
    setRecommendProposal(proposal);
    setStaffRecommend("Recommend Approval");
    setStaffNotes("");
  };

  const submitRecommend = async () => {
    setSubmittingRecommend(true);
    try {
      const res = await fetch(`/api/proposals/${recommendProposal.proposal_id}/recommend`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          staff_recommendation: staffRecommend,
          staff_notes: staffNotes,
          userId: currentUser.id
        })
      });
      if (res.ok) {
        fetchProposals();
        setRecommendProposal(null);
      }
    } catch (err) {
      console.error("Error submitting recommendation:", err);
    } finally {
      setSubmittingRecommend(false);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    const p = (priority || "").toUpperCase();
    if (p === "CRITICAL") return "border-coral text-coral bg-coral/5 font-bold";
    if (p === "ELEVATED") return "border-ochre text-ochre bg-ochre/5 font-bold";
    if (p === "RESOLVED") return "border-emerald-600 text-emerald-600 bg-emerald-500/5";
    return "border-zinc-300 text-zinc-500 bg-zinc-50";
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">Approved</span>;
    if (s === "rejected") return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-bold bg-red-50 text-red-600 border border-red-300">Rejected</span>;
    if (s === "deferred") return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-bold bg-yellow-50 text-ochre border border-ochre/30">Deferred</span>;
    if (s === "under_review") return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-300">Under Review</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-zinc-50 text-zinc-500 border border-zinc-200">Proposed</span>;
  };

  const uniqueWards = Array.from(new Set(proposals.map(p => p.ward_id).filter(Boolean)));
  const comparingProposals = proposals.filter(p => selectedIds.includes(p.proposal_id));

  return (
    <div className="p-6 md:p-8 space-y-8 bg-white min-h-screen text-black font-sans">
      
      {/* Editorial Title */}
      <div className="border-b border-zinc-200 pb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-black uppercase">
            AI-Prioritized Queue
          </h1>
          <p className="text-zinc-600 text-xs mt-2 tracking-wider leading-relaxed font-light max-w-3xl">
            Decision-centric project workflow engine. Citizen grievance density weighs against demographic indices, public infrastructure gaps, and historic allocations to surface optimal priorities.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 border rounded font-mono text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              compareMode 
                ? "border-ochre bg-ochre text-white font-bold" 
                : "border-zinc-200 bg-white hover:border-ochre text-zinc-600 hover:text-black"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{compareMode ? "Exit Comparison" : "Compare (2-3)"}</span>
            {selectedIds.length > 0 && (
              <span className="bg-white text-ochre text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 border border-ochre">
                {selectedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Sort Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded shadow-sm items-center">
        <div>
          <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded p-2 text-xs text-black outline-none focus:border-ochre cursor-pointer uppercase font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="ROADS">Roads</option>
            <option value="WATER">Water</option>
            <option value="EDUCATION">Education</option>
            <option value="HEALTH">Health</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="SANITATION">Sanitation</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Ward</label>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded p-2 text-xs text-black outline-none focus:border-ochre cursor-pointer font-mono"
          >
            <option value="ALL">All Wards</option>
            {uniqueWards.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded p-2 text-xs text-black outline-none focus:border-ochre cursor-pointer uppercase font-mono"
          >
            <option value="ALL">All Status</option>
            <option value="PROPOSED">Proposed</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DEFERRED">Deferred</option>
          </select>
        </div>

        <div>
          <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Sorting Model</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded p-2 text-xs text-black outline-none focus:border-ochre cursor-pointer uppercase font-mono"
          >
            <option value="demand_desc">Demand Score Desc</option>
            <option value="cost_desc">Budget Cost Desc</option>
            <option value="beneficiaries_desc">Beneficiary Impact Desc</option>
          </select>
        </div>
      </div>

      {/* Compare Side-by-Side Panel Overlay (Warm Ivory card - Dark Navy text) */}
      {compareMode && selectedIds.length >= 2 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border border-slate-200 bg-[#FDFBF7] text-[#1A1A2E] rounded-lg shadow-xl relative backdrop-blur-md"
        >
          <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
            <h3 className="font-serif text-lg font-bold text-[#4ECDC4] uppercase flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-[#4ECDC4]" />
              <span>Comparative Analytics Suite</span>
            </h3>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-[#1A1A2E] font-mono text-xs uppercase font-bold"
            >
              Clear Selection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparingProposals.map(p => (
              <div key={p.proposal_id} className="p-4 bg-white border border-slate-200 rounded flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#4ECDC4] font-bold">{p.category}</span>
                  <h4 className="font-serif text-sm font-bold text-[#1A1A2E] mt-1">{p.title}</h4>
                  <p className="text-[10px] text-slate-650 mt-2 line-clamp-3 font-sans leading-relaxed">{p.description}</p>
                </div>
                
                <div className="space-y-1 text-[10px] font-mono border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Demand Score:</span>
                    <span className="text-[#4ECDC4] font-bold">{p.demand_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficiaries:</span>
                    <span className="text-[#1A1A2E] font-bold">{p.beneficiary_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Budget Estimate:</span>
                    <span className="text-[#1A1A2E] font-bold">₹{(p.cost_estimate / 100000).toFixed(1)} Lakh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cost/Beneficiary:</span>
                    <span className="text-[#95D5B2] font-bold">
                      ₹{p.beneficiary_count > 0 ? Math.round(p.cost_estimate / p.beneficiary_count) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Status:</span>
                    <span className="font-bold">{p.status.toUpperCase()}</span>
                  </div>
                  {p.staff_recommendation && (
                    <div className="p-1.5 bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 rounded text-[10px] mt-2">
                      <span className="font-bold block text-[#4ECDC4]">Staff tag:</span>
                      <span className="text-slate-700 block italic">"{p.staff_recommendation}"</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Queue List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-black">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ochre mb-3"></div>
          <span className="font-mono text-xs text-zinc-600 uppercase">Consulting AI prioritizer...</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-20 border border-zinc-200 bg-zinc-50 rounded font-mono text-zinc-500 text-xs">
          NO PROPOSALS SECURED IN THE PRIORITY QUEUE
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p, index) => {
            const isExpanded = !!expandedIds[p.proposal_id];
            const isSelected = selectedIds.includes(p.proposal_id);
            const explanation = explanations[p.proposal_id];
            const isExplaining = !!explainingIds[p.proposal_id];
            const isStaff = currentUser.role === "ADMINISTRATOR";

            return (
              <BloomCard 
                key={p.proposal_id} 
                demandScore={p.demand_score}
                className={`border transition-all duration-300 ${
                  isSelected 
                    ? "border-ochre bg-ochre/5" 
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {/* Proposal Summary Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer text-black" onClick={() => toggleExpand(p.proposal_id)}>
                  <div className="flex items-start space-x-4">
                    {/* Checkbox for compare mode */}
                    {compareMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectForCompare(p.proposal_id);
                        }}
                        className="mt-1 w-4 h-4 accent-ochre cursor-pointer"
                      />
                    )}
                    
                    {/* Rank Badge */}
                    <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center font-serif text-lg font-bold border border-zinc-200 text-zinc-700">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-[10px] tracking-wider text-ochre uppercase font-bold">{p.category}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">• {p.ward_id}</span>
                        {p.cross_boundary && (
                          <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] font-mono px-1.5 py-0.5 rounded">
                            Cross-Boundary
                          </span>
                        )}
                        {p.staff_recommendation && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                            Rec: {p.staff_recommendation}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-base font-bold text-zinc-950 mt-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed line-clamp-1 max-w-xl font-sans font-light">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-zinc-100 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <div className="flex items-center space-x-1.5 justify-end md:justify-start">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Demand Score</span>
                        <Sparkles className="w-3.5 h-3.5 text-ochre shrink-0" />
                      </div>
                      <span className="font-serif text-2xl font-bold text-ochre block">{p.demand_score}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Est Budget</span>
                      <span className="font-mono text-sm text-zinc-950 font-bold block">₹{(p.cost_estimate / 100000).toFixed(1)}L</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getStatusBadge(p.status)}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(p.proposal_id);
                        }}
                        className="text-zinc-500 hover:text-black cursor-pointer"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-zinc-200 bg-zinc-50 overflow-hidden text-black"
                    >
                      <div className="p-6 space-y-6">
                                         {/* AI Suggestions Row */}
                        {(aiRecs[p.proposal_id] || aiSchemes[p.proposal_id]) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                            {aiRecs[p.proposal_id] && (
                              <AISuggestionCard badgeText="Autonomous Pre-Triage Suggestion">
                                <div className="font-bold text-[#845EC2] capitalize mb-1">
                                  AI Recommends: {aiRecs[p.proposal_id].recommendation}
                                </div>
                                <p className="text-slate-700 font-light font-sans">"{aiRecs[p.proposal_id].reason}"</p>
                              </AISuggestionCard>
                            )}
                            {aiSchemes[p.proposal_id] && (
                              <AISuggestionCard badgeText="Scheme Cross-Reference Match">
                                <div className="font-bold text-[#845EC2] mb-1">
                                  Scheme: {aiSchemes[p.proposal_id].scheme_name} ({aiSchemes[p.proposal_id].fit_type} Fit)
                                </div>
                                <p className="text-[10px] text-slate-500 mb-1"><strong>Eligibility:</strong> {aiSchemes[p.proposal_id].eligibility_criteria}</p>
                                <p className="text-slate-700 font-light font-sans">"{aiSchemes[p.proposal_id].reasoning}"</p>
                              </AISuggestionCard>
                            )}
                          </div>
                        )}
                        
                        {/* Demographics & Score Breakdown Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                          
                          {/* Score Breakdown (Never a bare number!) */}
                          <div className="bg-[#FDFBF7] border border-slate-200 rounded p-4 space-y-3 font-mono text-xs shadow-sm">
                            <span className="text-[10px] text-[#4ECDC4] uppercase font-bold tracking-widest block border-b border-slate-100 pb-1">
                              Demand Score Breakdown
                            </span>
                            <div className="space-y-2 text-slate-700">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Complaint Count:</span>
                                <strong className="text-[#1A1A2E]">{p.demand_score_breakdown.complaint_count}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Severity Index:</span>
                                <strong className="text-[#1A1A2E]">{p.demand_score_breakdown.severity_weighted_score}/100</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Population Density Factor:</span>
                                <strong className="text-[#1A1A2E]">{p.demand_score_breakdown.population_density_factor}/100</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Duplicates Clustered:</span>
                                <strong className="text-[#1A1A2E]">{p.demand_score_breakdown.duplicate_count}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Historical Neglect Factor:</span>
                                <strong className="text-[#1A1A2E]">{p.demand_score_breakdown.historical_neglect_factor}/100</strong>
                              </div>
                            </div>
                          </div>

                          {/* Demographic Overlay */}
                          <div className="bg-[#FDFBF7] border border-slate-200 rounded p-4 space-y-3 font-mono text-xs shadow-sm">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block border-b border-slate-100 pb-1 font-bold">
                              Demographic Overlay
                            </span>
                            <div className="space-y-2 text-slate-700">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Beneficiary Count:</span>
                                <strong className="text-[#1A1A2E]">{p.beneficiary_count.toLocaleString()} people</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Literacy Rate:</span>
                                <strong className="text-[#1A1A2E]">{p.demographic_overlay.literacy_rate}%</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Avg Income Bracket:</span>
                                <strong className="text-[#1A1A2E]">{p.demographic_overlay.avg_income_bracket}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Cost Per Beneficiary:</span>
                                <strong className="text-[#95D5B2] font-bold">
                                  ₹{p.beneficiary_count > 0 ? Math.round(p.cost_estimate / p.beneficiary_count) : 0}
                                </strong>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Explainable Ranking Justification (Gemini Call) — Warm Ivory Panel, Orchid Violet Accent */}
                        <div className="bg-[#FDFBF7] border border-slate-200 rounded p-4 space-y-2 text-[#1A1A2E] shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2 text-[#845EC2]">
                              <Sparkles className="w-4 h-4" />
                              <span className="font-serif text-xs font-bold uppercase tracking-wider">AI Explainer Analysis</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); getAiExplanation(p.proposal_id, p.demand_score_breakdown); }}
                              disabled={isExplaining}
                              className="text-[10px] font-mono uppercase bg-[#845EC2] hover:bg-[#845EC2]/80 text-white px-2 py-1 rounded cursor-pointer transition-all disabled:bg-slate-200 disabled:text-slate-500 font-bold"
                            >
                              {isExplaining ? "Synthesizing..." : explanation || p.recommendation_reason ? "Re-Generate" : "Generate Explanation"}
                            </button>
                          </div>
                          <p className="text-xs font-sans leading-relaxed pt-1 text-slate-700 font-light">
                            {explanation || p.recommendation_reason || (
                              <span className="italic text-slate-400 font-sans">Request plain-language Gemini explanation of this ranking.</span>
                            )}
                          </p>
                        </div>

                        {/* Cross Boundary linkages — Peony Pink accent */}
                        {p.cross_boundary && (
                          <div className="border border-slate-200 bg-[#FDFBF7] rounded p-4 text-xs font-sans space-y-1 text-[#1A1A2E] shadow-sm border-l-4 border-l-[#FF6B9D]">
                            <span className="font-bold text-[#FF6B9D] uppercase block">Cross-Constituency Project Coordination</span>
                            <p className="text-slate-600 font-light leading-relaxed">
                              This infrastructure spans multiple administrative segments: <strong className="text-[#1A1A2E] font-bold">{p.linked_ward_ids.join(", ")}</strong>. Shared coordination is requested with neighboring MLAs.
                            </p>
                          </div>
                        )}

                        {/* Staff Notes if any — Leaf Green accent */}
                        {p.staff_notes && (
                          <div className="border border-slate-200 bg-[#FDFBF7] rounded p-4 text-xs font-sans space-y-1 text-[#1A1A2E] shadow-sm border-l-4 border-l-[#95D5B2]">
                            <span className="font-bold text-[#95D5B2] uppercase block">Staff Preliminary Assessment</span>
                            <p className="text-slate-650 italic font-light leading-relaxed">
                              "{p.staff_notes}"
                            </p>
                          </div>
                        )}

                        {/* Action buttons section */}
                        <div className="flex flex-wrap gap-3 pt-3 border-t border-zinc-200 justify-between items-center">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                if (onSelectProposalForAudit) onSelectProposalForAudit(p.proposal_id);
                                else setView("AUDIT");
                              }}
                              className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-mono text-[10px] uppercase tracking-wider border border-zinc-200 transition-all cursor-pointer"
                            >
                              Audit Timeline
                            </button>
                          </div>

                          {/* MP/MLA Decisions vs Staff Recommendations */}
                          {isStaff ? (
                            <button
                              onClick={() => openRecommendModal(p)}
                              className="px-4 py-2.5 bg-ochre hover:bg-ochre/90 text-white rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center space-x-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Delegate Recommendation</span>
                            </button>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => openActionModal(p, "approve")}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => openActionModal(p, "reject")}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center space-x-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                              <button
                                onClick={() => openActionModal(p, "defer")}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center space-x-1"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Defer</span>
                              </button>
                              <button
                                onClick={() => openActionModal(p, "escalate")}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold flex items-center space-x-1"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Escalate</span>
                              </button>
                            </div>
                          )}

                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </BloomCard>
            );
          })}
        </div>
      )}

      {/* MP/MLA Action Modal */}
      {actionProposal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn text-black">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white border border-zinc-300 rounded-lg overflow-hidden shadow-2xl"
          >
            <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
              <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">
                Justify Decision: {actionType.toUpperCase()}
              </h3>
              <button onClick={closeActionModal} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded text-xs font-mono text-zinc-600">
                <span className="font-bold text-zinc-900">Project:</span> {actionProposal.title}
                <br/>
                <span className="font-bold text-zinc-900">Budget Impact:</span> ₹{(actionProposal.cost_estimate/100000).toFixed(1)} Lakh
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                  Justification comment (Mandatory for Audit Trail)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="State technical eligibility, social justification, or budget constraints for this decision..."
                  rows={4}
                  className="w-full bg-white border border-zinc-200 rounded p-3 text-xs text-black outline-none focus:border-ochre font-sans resize-none"
                ></textarea>
                <span className="text-[10px] text-zinc-400 font-mono block italic">
                  Note: This comment is cryptographically mapped to the immutable audit ledger.
                </span>
              </div>

              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-600">
                  {actionError}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end space-x-3">
              <button 
                onClick={closeActionModal}
                className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-black rounded font-mono text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={submittingAction || !comment.trim()}
                className="px-5 py-2 bg-ochre hover:bg-ochre/95 disabled:bg-neutral-200 disabled:text-zinc-400 text-white rounded font-mono text-xs uppercase tracking-wider font-bold cursor-pointer transition-all"
              >
                {submittingAction ? "Writing to Log..." : "Commit Action"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Staff Recommendation Modal */}
      {recommendProposal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn text-black">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white border border-zinc-300 rounded-lg overflow-hidden shadow-2xl"
          >
            <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
              <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">
                Submit Staff Recommendation
              </h3>
              <button onClick={() => setRecommendProposal(null)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Recommendation tag</label>
                <select
                  value={staffRecommend}
                  onChange={(e) => setStaffRecommend(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded p-2 text-xs text-black outline-none focus:border-ochre cursor-pointer"
                >
                  <option value="Recommend Approval">Recommend Approval</option>
                  <option value="Recommend Rejection">Recommend Rejection</option>
                  <option value="Recommend Deferral">Recommend Deferral</option>
                  <option value="Recommend Escalation">Recommend Escalation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Internal notes / Ground assessment findings</label>
                <textarea
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="Enter assessment findings, travel distance data, or enrollment gap reports to support MLA decision..."
                  rows={4}
                  className="w-full bg-white border border-zinc-200 rounded p-3 text-xs text-black outline-none focus:border-ochre font-sans resize-none"
                ></textarea>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end space-x-3">
              <button 
                onClick={() => setRecommendProposal(null)}
                className="px-4 py-2 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-black rounded font-mono text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitRecommend}
                disabled={submittingRecommend}
                className="px-5 py-2 bg-ochre hover:bg-ochre/95 disabled:bg-neutral-200 disabled:text-zinc-400 text-white rounded font-mono text-xs uppercase tracking-wider font-bold cursor-pointer transition-all"
              >
                {submittingRecommend ? "Saving..." : "Log Recommendation"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
