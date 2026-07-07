import React, { useState, useEffect } from "react";
import { Check, X, MessageSquare, Loader2, AlertTriangle } from "lucide-react";
import { LedgerItem, ViewState } from "../types";

interface ProposalDecisionViewProps {
  setView: (view: ViewState) => void;
}

export default function ProposalDecisionView({ setView }: ProposalDecisionViewProps) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriorities() {
      try {
        const res = await fetch(`/api/ranking/priorities?constituency_id=74-B`);
        if (res.ok) {
          const data = await res.json();
          setProposals(data);
        }
      } catch (err) {
        console.error("Error fetching priorities:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPriorities();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const status = action === "APPROVE" ? "SCHEDULED" : "ARCHIVED";
      await fetch(`/api/suggestions/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: comment }),
      });
      // Refresh list
      setProposals(prev => prev.filter(p => p.id !== id));
      setComment("");
      setActiveProposalId(null);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <div className="p-8 text-cream"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 bg-navy/40 min-h-screen text-cream">
      <h2 className="font-serif text-2xl mb-6">AI-Surfaced Priority Proposals</h2>
      <div className="space-y-4">
        {proposals.map((p) => (
          <div key={p.id} className="bg-navy border border-sage/20 p-6 rounded shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{p.category}</h3>
                <span className={`text-xs px-2 py-1 rounded ${p.priority_level === 'CRITICAL' ? 'bg-coral/20 text-coral' : 'bg-ochre/20 text-ochre'}`}>
                  {p.priority_level}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-sage">Demand Score: {p.score}</p>
                <p className="text-xs text-sage/60">{p.demand_count} requests</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction(p.id, "APPROVE")}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-sm"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button 
                onClick={() => handleAction(p.id, "REJECT")}
                className="flex items-center gap-2 bg-coral hover:bg-coral-dark px-4 py-2 rounded text-sm"
              >
                <X className="w-4 h-4" /> Reject
              </button>
              <button 
                onClick={() => setActiveProposalId(p.id)}
                className="flex items-center gap-2 bg-navy-light hover:bg-navy-lighter px-4 py-2 rounded text-sm border border-sage/20"
              >
                <MessageSquare className="w-4 h-4" /> Comment
              </button>
            </div>

            {activeProposalId === p.id && (
              <div className="mt-4">
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-navy-dark border border-sage/20 p-2 rounded text-sm"
                  placeholder="Add a note..."
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
