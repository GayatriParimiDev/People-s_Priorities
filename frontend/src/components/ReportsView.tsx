import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronRight, 
  Download, 
  MessageSquare,
  RefreshCw,
  Award,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, ViewState } from "../types";
import AISuggestionCard from "./AISuggestionCard";

interface ReportsViewProps {
  currentUser: UserType;
  setView: (view: ViewState) => void;
}

export default function ReportsView({ currentUser, setView }: ReportsViewProps) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any | null>(null);
  
  // Executive Report States
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copyReportSuccess, setCopyReportSuccess] = useState(false);

  // Response Drafting States
  const [draft, setDraft] = useState<string>("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [copyDraftSuccess, setCopyDraftSuccess] = useState(false);

  // AI Agents Deliverables
  const [quarterlyReport, setQuarterlyReport] = useState<any | null>(null);
  const [meetingBrief, setMeetingBrief] = useState<any | null>(null);

  const token = localStorage.getItem("auth_token");
  const constituencyId = currentUser.districtId || "74-B";

  useEffect(() => {
    async function loadAgentData() {
      try {
        const qRes = await fetch(`/api/ai/reports/${constituencyId}/quarterly`);
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuarterlyReport(qData);
        }

        const mRes = await fetch(`/api/ai/meetings/${constituencyId}/briefs`);
        if (mRes.ok) {
          const mData = await mRes.json();
          setMeetingBrief(mData);
        }
      } catch (err) {
        console.error("Error loading agent deliverables in ReportsView:", err);
      }
    }
    loadAgentData();
  }, [constituencyId]);

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
          if (data.length > 0) {
            setSelectedProp(data[0]);
          }
        }
      } catch (err) {
        console.error("Error loading proposals for reports view:", err);
      }
    }

    loadProposals();
  }, []);

  useEffect(() => {
    if (!selectedProp) return;
    triggerResponseDraft();
  }, [selectedProp]);

  const triggerResponseDraft = async () => {
    setGeneratingDraft(true);
    setDraft("");
    try {
      const res = await fetch(`/api/proposals/${selectedProp.proposal_id}/draft-response`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft);
      }
    } catch (err) {
      console.error("Error drafting response:", err);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const triggerReportGenerate = async () => {
    setGeneratingReport(true);
    setReport(null);
    try {
      const res = await fetch(`/api/proposals/reports/generate?constituency_id=${constituencyId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const copyToClipboard = (text: string, type: "report" | "draft") => {
    navigator.clipboard.writeText(text);
    if (type === "report") {
      setCopyReportSuccess(true);
      setTimeout(() => setCopyReportSuccess(false), 2000);
    } else {
      setCopyDraftSuccess(true);
      setTimeout(() => setCopyDraftSuccess(false), 2000);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-white min-h-screen text-black font-sans">
      
      {/* Title Header */}
      <div className="border-b border-zinc-200 pb-6 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-black uppercase">
            Reports & Communications
          </h1>
          <p className="text-zinc-600 text-xs mt-2 tracking-wider leading-relaxed font-light">
            Enables summaries of constituency milestones and drafting of AI-assisted responses for grievance resolution clusters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Executive Report (6 cols) */}
        <div className="lg:col-span-6 border border-zinc-200 bg-zinc-50 rounded-lg p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-ochre">
              <FileText className="w-5 h-5" />
              <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">Quarterly Executive Report</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Synthesizes legislative actions, budget commitments, and citizen outcomes into a professional executive summary for public or council review.
            </p>
          </div>

          {/* RAG Report Output &mdash; Colored background, white text */}
          <div className="bg-[#FDFBF7] text-[#1A1A2E] border border-slate-200 rounded-lg p-4 flex-1 flex flex-col justify-between min-h-[300px] shadow-sm">
            {generatingReport ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#4ECDC4] font-bold"></div>
                <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Gemini generating executive summary...</span>
              </div>
            ) : report ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="text-xs font-mono leading-relaxed text-slate-800 overflow-y-auto max-h-[350px] whitespace-pre-wrap text-left bg-white p-3 border border-slate-200 rounded scrollbar-thin shadow-inner">
                  {report}
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => copyToClipboard(report, "report")}
                    className="flex-1 py-2 bg-transparent hover:bg-slate-100 border border-slate-250 text-slate-700 hover:text-[#1A1A2E] rounded font-mono text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer font-bold"
                  >
                    {copyReportSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => alert("Report downloaded as PDF.")}
                    className="flex-1 py-2 bg-[#4ECDC4] hover:bg-[#4ECDC4]/90 text-[#1A1A2E] rounded font-mono text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer shadow border border-slate-200 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-xs font-mono text-slate-400 italic font-bold">
                Click build button below to compile constituency report.
              </div>
            )}
          </div>

          {!report && !generatingReport && (
            <button
              onClick={triggerReportGenerate}
              className="w-full py-3 bg-[#4ECDC4] hover:bg-[#4ECDC4]/90 text-[#1A1A2E] rounded font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow border border-slate-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Compile Executive Report</span>
            </button>
          )}
        </div>

        {/* Right Side: Response Drafting (6 cols) */}
        <div className="lg:col-span-6 border border-zinc-200 bg-zinc-50 rounded-lg p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-ochre">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">Constituent Response Draft</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Assists staff in replying to grievance clusters by drafting customized response letters for active proposals.
            </p>
          </div>

          {/* Proposal selector */}
          <div>
            <label className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Select Target Proposal</label>
            <select
              value={selectedProp ? selectedProp.proposal_id : ""}
              onChange={(e) => {
                const found = proposals.find(p => p.proposal_id === e.target.value);
                if (found) setSelectedProp(found);
              }}
              className="w-full bg-white border border-zinc-200 rounded p-2 text-xs text-black outline-none focus:border-ochre cursor-pointer"
            >
              {proposals.map(p => (
                <option key={p.proposal_id} value={p.proposal_id}>
                  {p.title.substring(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          {/* RAG response drafting output — Warm Ivory Panel, Orchid Violet Accent */}
          <div className="bg-[#FDFBF7] text-[#1A1A2E] border border-slate-200 rounded-lg p-4 flex-1 flex flex-col justify-between min-h-[250px] shadow-sm">
            {generatingDraft ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#845EC2] font-bold"></div>
                <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Gemini drafting constituent reply...</span>
              </div>
            ) : draft ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-3 rounded text-xs font-sans text-slate-800 leading-relaxed resize-none flex-1 focus:border-[#845EC2] outline-none scrollbar-thin shadow-inner font-light"
                  rows={8}
                ></textarea>
                
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => copyToClipboard(draft, "draft")}
                    className="flex-1 py-2 bg-transparent hover:bg-slate-100 border border-slate-250 text-slate-700 hover:text-[#1A1A2E] rounded font-mono text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer font-bold"
                  >
                    {copyDraftSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Draft text</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); triggerResponseDraft(); }}
                    className="py-2 px-3.5 bg-transparent hover:bg-slate-100 border border-slate-250 text-slate-700 hover:text-[#1A1A2E] rounded font-mono text-[10px] uppercase cursor-pointer font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-xs font-mono text-slate-400 italic">
                Select a proposal above to load constituent reply helper.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Autonomous AI Agent Deliverables Section */}
      {(quarterlyReport || meetingBrief) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-200 pt-8 text-black">
          {/* Quarterly Report (Manifesto Checker) */}
          {quarterlyReport && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#845EC2]">
                <Award className="w-5 h-5" />
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">Manifesto Audit & Imbalance Report</h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-light font-sans">
                Generated autonomously by the Quarterly Report Agent. Audits approvals against stated priorities.
              </p>
              
              <div className="border border-slate-200 rounded-xl p-5 bg-[#FDFBF7] shadow-sm border-l-4 border-l-[#845EC2]">
                <div className="flex items-center justify-between mb-3 border-b border-[#845EC2]/10 pb-2">
                  <span className="text-[10px] font-bold text-[#845EC2] uppercase tracking-wider font-mono">Manifesto Alignment</span>
                  <span className="font-mono font-bold text-xs bg-[#845EC2] text-white px-2 py-0.5 rounded shadow-sm">
                    Score: {quarterlyReport.report_content.manifesto_alignment_score}/100
                  </span>
                </div>
                
                <p className="text-xs text-slate-800 font-sans mb-3 leading-relaxed">
                  <strong>Summary:</strong> {quarterlyReport.report_content.summary}
                </p>
                
                {quarterlyReport.report_content.imbalances?.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[9px] font-bold uppercase text-[#FF6B9D] font-mono block mb-1">Imbalances Flagged:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 text-xs font-sans">
                      {quarterlyReport.report_content.imbalances.map((imb: string, idx: number) => (
                        <li key={idx}>{imb}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {quarterlyReport.report_content.recommmended_adjustments?.length > 0 && (
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[#95D5B2] font-mono block mb-1">Suggested Adjustments:</span>
                    <ul className="list-decimal pl-4 space-y-1 text-slate-700 text-xs font-sans font-bold">
                      {quarterlyReport.report_content.recommmended_adjustments.map((adj: string, idx: number) => (
                        <li key={idx}>{adj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meeting Prep Brief */}
          {meetingBrief && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#845EC2]">
                <Users className="w-5 h-5" />
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-black">Meeting Prep Briefing</h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-light font-sans">
                Generated autonomously by the Meeting-Prep Agent. Synthesizes key concerns and speaking notes.
              </p>
              
              <div className="border border-slate-200 rounded-xl p-5 bg-[#FDFBF7] shadow-sm border-l-4 border-l-[#845EC2] max-h-[300px] overflow-y-auto">
                <span className="text-[10px] font-bold text-[#845EC2] uppercase tracking-wider font-mono block mb-2">
                  Briefing: {meetingBrief.meeting_title}
                </span>
                <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans prose prose-slate">
                  {meetingBrief.briefing}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
