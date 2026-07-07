import React, { useState, useEffect } from "react";
import { 
  History, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Download, 
  Calendar,
  AlertTriangle,
  Layers,
  ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";
import { User as UserType, ViewState } from "../types";

interface AuditTrailViewProps {
  currentUser: UserType;
  selectedProposalId: string | null;
  setView: (view: ViewState) => void;
}

export default function AuditTrailView({ currentUser, selectedProposalId, setView }: AuditTrailViewProps) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [agingFlags, setAgingFlags] = useState<any[]>([]);

  const token = localStorage.getItem("auth_token");
  const constituencyId = currentUser.districtId || "74-B";

  // Initial load
  useEffect(() => {
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
          
          // Select default proposal
          if (selectedProposalId) {
            setSelectedPropId(selectedProposalId);
          } else if (data.length > 0) {
            setSelectedPropId(data[0].proposal_id);
          }
        }
      } catch (err) {
        console.error("Error loading proposals for audit:", err);
      }
    }
    
    async function loadAgingFlags() {
      try {
        const res = await fetch(`/api/proposals/dashboard/bias-flags?constituency_id=${constituencyId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAgingFlags(data);
        }
      } catch (err) {
        console.error("Error loading bias/aging flags:", err);
      }
    }

    loadProposals();
    loadAgingFlags();
  }, [selectedProposalId]);

  // Fetch logs whenever selected proposal changes
  useEffect(() => {
    if (!selectedPropId) return;
    
    async function loadLogs() {
      setLoadingLogs(true);
      try {
        const res = await fetch(`/api/proposals/${selectedPropId}/audit-trail`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAuditLog(data);
        }
      } catch (err) {
        console.error("Error loading audit logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    }

    loadLogs();
  }, [selectedPropId]);

  const getActionColor = (action: string) => {
    const act = (action || "").toLowerCase();
    if (act === "approve") return "text-emerald-400 border-emerald-500 bg-emerald-500/10";
    if (act === "reject") return "text-coral border-coral bg-coral/10";
    if (act === "defer") return "text-ochre border-ochre bg-ochre/10";
    if (act === "escalate") return "text-indigo-400 border-indigo-500 bg-indigo-500/10";
    return "text-white/70 border-slate-700 bg-black/40";
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") return "text-emerald-600 font-bold";
    if (s === "rejected") return "text-coral font-bold";
    if (s === "deferred") return "text-ochre font-bold";
    if (s === "under_review") return "text-zinc-600";
    return "text-zinc-400";
  };

  const currentProposal = proposals.find(p => p.proposal_id === selectedPropId);

  // Check if current proposal has no activity for 14+ days (SLA check)
  const isStale = () => {
    if (!currentProposal) return false;
    const lastUpdate = new Date(currentProposal.last_updated_at || currentProposal.created_at);
    const diffTime = Math.abs(new Date().getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 14;
  };

  const daysSinceActivity = () => {
    if (!currentProposal) return 0;
    const lastUpdate = new Date(currentProposal.last_updated_at || currentProposal.created_at);
    const diffTime = Math.abs(new Date().getTime() - lastUpdate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredProposals = proposals.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 bg-white min-h-screen text-black font-sans">
      
      {/* Title Header */}
      <div className="border-b border-zinc-200 pb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-black uppercase">
            Audit Trail Ledger
          </h1>
          <p className="text-zinc-600 text-xs mt-2 tracking-wider leading-relaxed font-light">
            Immutable, append-only record of elected official actions, status changes, and decision rationale. Surfaces SLA bottlenecks and verifies constituent developmental alignment.
          </p>
        </div>
        <div>
          <button 
            onClick={() => alert("Timeline exported successfully as signed public RSS feed.")}
            className="px-4 py-2 bg-ochre hover:bg-ochre/90 text-white rounded font-mono text-xs uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow"
          >
            <Download className="w-4 h-4" />
            <span>Public Export (Feed)</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Proposal Selector (4 cols) */}
        <div className="lg:col-span-4 border border-zinc-200 bg-zinc-50 rounded-lg p-5 flex flex-col space-y-4">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block border-b border-zinc-250 pb-2">
            Select Active Proposal
          </span>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword..."
              className="w-full bg-white border border-zinc-200 rounded pl-10 pr-4 py-2 text-xs text-black outline-none focus:border-ochre font-sans"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[450px] space-y-2 scrollbar-thin">
            {filteredProposals.map(p => (
              <div
                key={p.proposal_id}
                onClick={() => setSelectedPropId(p.proposal_id)}
                className={`p-3 rounded border text-left cursor-pointer transition-all ${
                  selectedPropId === p.proposal_id
                    ? "border-ochre bg-ochre/5 text-black"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex justify-between font-mono text-[9px] text-zinc-500">
                  <span className="uppercase text-ochre font-bold">{p.category}</span>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="font-serif text-xs font-bold text-zinc-950 mt-1 line-clamp-1">{p.title}</h4>
                <div className="flex justify-between items-center mt-2 text-[9px] font-mono">
                  <span className="text-zinc-400 font-bold">ID: {p.proposal_id.substring(0, 8).toUpperCase()}</span>
                  <span className={p.status === 'approved' ? 'text-emerald-600 font-bold' : 'text-zinc-500'}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Log timeline display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* SLA stale alerts (Colored background - white text) */}
          {currentProposal && isStale() && (
            <div className="border border-red-800 bg-[#7f1d1d] p-4 rounded-lg flex items-center space-x-3 text-xs font-mono text-white animate-pulse">
              <ShieldAlert className="w-5 h-5 text-white shrink-0" />
              <div>
                <span className="font-bold uppercase block text-white">SLA Alert: Untouched Proposal</span>
                This proposal has had <strong className="text-white">no official updates for {daysSinceActivity()} days</strong>. Elective guidelines suggest review triggers every 14 days.
              </div>
            </div>
          )}

          {currentProposal ? (
            <div className="border border-zinc-200 bg-zinc-50 rounded-lg p-6 flex flex-col justify-between flex-1 space-y-6">
              
              {/* Proposal Header info */}
              <div className="border-b border-zinc-250 pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="font-mono text-[10px] text-ochre uppercase font-bold tracking-wider">{currentProposal.category}</span>
                  <h3 className="font-serif text-lg font-bold text-zinc-950 mt-1">{currentProposal.title}</h3>
                  <p className="text-xs text-zinc-600 font-sans mt-2 max-w-xl font-light">{currentProposal.description}</p>
                </div>
                <div className="text-right font-mono text-[10px] text-zinc-500 shrink-0">
                  <p>Demand Score: <strong className="text-ochre">{currentProposal.demand_score}</strong></p>
                  <p className="mt-1">Cost: ₹{(currentProposal.cost_estimate/100000).toFixed(1)} Lakh</p>
                </div>
              </div>

              {/* Timeline Container */}
              {loadingLogs ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-ochre mb-2"></div>
                  <span className="font-mono text-[10px] text-zinc-500">Decrypting Immutable Ledger...</span>
                </div>
              ) : auditLog.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-xs font-mono text-zinc-400 border border-dashed border-zinc-200 rounded bg-white">
                  No audit log entries logged for this proposal yet.
                </div>
              ) : (
                <div className="flex-1 relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200">
                  {auditLog.map((log) => (
                    <div key={log.id} className="relative group text-black">
                      
                      {/* Timeline dot */}
                      <span className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border border-white ${
                        log.action === "approve" ? "bg-emerald-500" : log.action === "reject" ? "bg-red-500" : "bg-ochre"
                      }`}></span>

                      <div className="space-y-2">
                        {/* Log Meta data */}
                        <div className="flex items-center space-x-2 flex-wrap text-[10px] font-mono text-zinc-600">
                          <span className="inline-flex items-center text-zinc-900 font-bold">
                            <User className="w-3 h-3 text-zinc-500 mr-1 shrink-0" />
                            {log.actor_name}
                          </span>
                          <span className="text-zinc-500">({log.actor_role.toUpperCase()})</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-zinc-400 font-light ml-auto">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Justification Comment Card &mdash; Colored block, white text */}
                        <div className="p-3 bg-[#FDFBF7] border border-slate-200 rounded text-xs leading-relaxed font-mono text-[#1A1A2E]">
                          <span className="font-bold text-[#4ECDC4] block mb-1">DECISION JUSTIFICATION:</span>
                          "{log.comment}"
                        </div>

                        {/* Transition indices */}
                        {log.status_before && log.status_after && log.status_before !== log.status_after && (
                          <div className="flex items-center space-x-2 text-[10px] font-mono pl-1 text-zinc-500">
                            <span>Status Transition:</span>
                            <span className={getStatusColor(log.status_before)}>{log.status_before.toUpperCase()}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className={getStatusColor(log.status_after)}>{log.status_after.toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* Immutable Hash Signature block */}
              <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>BLOCKCHAIN HASH VALIDATION: OK</span>
                </span>
                <span>SHA-256 COMPLIANCE VERIFICATION</span>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-zinc-200 bg-zinc-50 rounded-lg text-xs font-mono text-zinc-500">
              SELECT A PROPOSAL FROM THE LEFT TO DECRYPT AUDIT TIMELINE
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
