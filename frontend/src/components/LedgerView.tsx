import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowDownWideNarrow, 
  ChevronDown, 
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Calendar,
  X,
  Check,
  RotateCcw
} from "lucide-react";
import { LedgerItem, ViewState } from "../types";

interface LedgerViewProps {
  ledger: LedgerItem[];
  setView: (view: ViewState) => void;
}

export default function LedgerView({ ledger, setView }: LedgerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [themeFilter, setThemeFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Dynamically extract unique themes in current ledger to populate interactive chips
  const uniqueThemes = Array.from(new Set(ledger.map(item => item.theme))).filter(Boolean);

  // Filter items dynamically based on search, selected priorities, statuses, themes, and date range
  const filteredLedger = ledger.filter((item) => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesPriority = priorityFilter === "ALL" || item.priorityLevel === priorityFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesTheme = themeFilter === "ALL" || item.theme === themeFilter;

    // Parse dates to compare midnight limits
    let matchesDate = true;
    if (startDate || endDate) {
      const itemDate = new Date(item.submissionDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesTheme && matchesDate;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("ALL");
    setStatusFilter("ALL");
    setThemeFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  // Badge stylings
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "border border-coral text-coral bg-coral/5 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider";
      case "ELEVATED":
        return "border border-ochre text-ochre bg-ochre/5 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider";
      case "STANDARD":
        return "border border-sage text-sage bg-sage/5 px-2 py-0.5 rounded text-[10px] tracking-wider";
      case "RESOLVED":
        return "border border-emerald-500/50 text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded text-[10px] tracking-wider";
      default:
        return "border border-neutral-600 text-neutral-400 px-2 py-0.5 rounded text-[10px]";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "UNDER REVIEW":
        return "text-sage/80 font-mono text-xs uppercase tracking-wide";
      case "SCHEDULED":
        return "text-ochre font-mono text-xs uppercase tracking-wide font-bold";
      case "ARCHIVED":
        return "text-sage/50 font-mono text-xs uppercase tracking-wide";
      case "CLOSED":
        return "text-neutral-500 font-mono text-xs uppercase tracking-wide line-through";
      case "IN PROGRESS":
        return "text-emerald-400 font-mono text-xs uppercase tracking-wide animate-pulse font-bold";
      default:
        return "text-neutral-400 font-mono text-xs";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-navy/40 min-h-screen text-cream">
      
      {/* Title Header Editorial serif */}
      <div className="border-b border-sage/20 pb-6">
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-cream uppercase">
          The Public Ledger
        </h1>
        <p className="text-sage font-sans text-xs mt-3 tracking-wider leading-relaxed font-light">
          Permanent immutable record of civic demands and constituency priorities. Authenticated system access only.
        </p>
      </div>

      {/* Advanced Filter and Search Registry Dashboard Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Search Input bar */}
          <div className="lg:col-span-6 border border-sage/25 bg-navy/60 rounded p-4 flex flex-col justify-between">
            <span className="font-mono text-[9px] text-sage/50 uppercase tracking-widest block mb-2">
              Search Registry
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-sage/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query by ID, Theme, Title, or Keyword..."
                className="w-full bg-navy border border-sage/20 rounded pl-10 pr-4 py-2 text-xs text-cream outline-none focus:border-ochre font-sans"
              />
            </div>
          </div>

          {/* Standard Select parameters */}
          <div className="lg:col-span-4 border border-sage/25 bg-navy/60 rounded p-4 flex flex-col justify-between">
            <span className="font-mono text-[9px] text-sage/50 uppercase tracking-widest block mb-2">
              Base Parameters
            </span>
            <div className="grid grid-cols-2 gap-4">
              {/* Priority selection */}
              <div>
                <label className="font-mono text-[9px] text-sage/50 uppercase block mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-navy border border-sage/20 rounded px-2.5 py-1.5 text-[10px] text-cream uppercase tracking-wider outline-none font-mono cursor-pointer"
                >
                  <option value="ALL">All Levels</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="ELEVATED">Elevated</option>
                  <option value="STANDARD">Standard</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Status Selection */}
              <div>
                <label className="font-mono text-[9px] text-sage/50 uppercase block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-navy border border-sage/20 rounded px-2.5 py-1.5 text-[10px] text-cream uppercase tracking-wider outline-none font-mono cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="UNDER REVIEW">Under Review</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="CLOSED">Closed</option>
                  <option value="IN PROGRESS">In Progress</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collapsible advanced filters toggle */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full h-full border rounded p-4 flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                showAdvanced || themeFilter !== "ALL" || startDate || endDate
                  ? "border-ochre bg-ochre/10 text-cream"
                  : "border-sage/25 bg-navy/60 text-sage hover:border-ochre hover:text-cream"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                {showAdvanced ? "Hide Advanced" : "Advanced Filters"}
              </span>
              {(themeFilter !== "ALL" || startDate || endDate) && (
                <span className="bg-ochre text-cream text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                  Active
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Collapsible Advanced Filters Accordion Panel */}
        {showAdvanced && (
          <div className="border border-ochre/40 bg-neutral-950/40 rounded p-6 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Date range pickers */}
              <div className="space-y-3">
                <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-ochre" />
                  <span>Interactive Date Range Selection</span>
                </span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] text-sage/55 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-navy border border-sage/20 rounded p-2 text-xs text-cream outline-none font-mono focus:border-ochre"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] text-sage/55 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-navy border border-sage/20 rounded p-2 text-xs text-cream outline-none font-mono focus:border-ochre"
                    />
                  </div>
                </div>
              </div>

              {/* Actions & dynamic counter */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block">
                    Current Matches
                  </span>
                  <div className="bg-black/30 border border-sage/15 rounded p-3 text-xs font-mono flex items-center justify-between">
                    <span className="text-sage/70">Matching Items:</span>
                    <span className="text-ochre font-bold text-sm">
                      {filteredLedger.length} <span className="text-xs text-sage/50 font-normal">/ {ledger.length}</span>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-sage/20 hover:border-sage/40 text-sage rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(false)}
                    className="flex-1 py-2.5 bg-ochre hover:bg-ochre/95 text-cream rounded font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Dynamic Theme selection chips */}
            <div className="space-y-2.5 pt-4 border-t border-sage/10">
              <span className="font-mono text-[10px] text-sage/60 uppercase tracking-widest block">
                Filter by Category Theme
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setThemeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                    themeFilter === "ALL"
                      ? "border-ochre bg-ochre/10 text-cream font-bold"
                      : "border-sage/15 bg-black/10 text-sage hover:border-sage/40 hover:text-cream"
                  }`}
                >
                  {themeFilter === "ALL" && <Check className="w-3 h-3 text-ochre" />}
                  <span>All Themes</span>
                </button>

                {uniqueThemes.map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setThemeFilter(theme)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                      themeFilter === theme
                        ? "border-ochre bg-ochre/10 text-cream font-bold"
                        : "border-sage/15 bg-black/10 text-sage hover:border-sage/40 hover:text-cream"
                    }`}
                  >
                    {themeFilter === theme && <Check className="w-3 h-3 text-ochre" />}
                    <span>{theme}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Table Matrix */}
      <div className="border border-sage/25 bg-navy/80 rounded shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sage/20 bg-neutral-950 font-mono text-[10px] text-sage/60 uppercase tracking-wider">
              <th className="py-4 px-6">ID #</th>
              <th className="py-4 px-6">Submission Date</th>
              <th className="py-4 px-6 text-center">Priority Level</th>
              <th className="py-4 px-6">Theme / Title</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-center">Auditing</th>
            </tr>
          </thead>
          <tbody className="font-sans text-xs divide-y divide-sage/15">
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sage/40 font-mono">
                  NO CORRESPONDING RECORDS SECURED IN LEDGER CHUNK
                </td>
              </tr>
            ) : (
              filteredLedger.slice(0, visibleCount).map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-cream/5 transition-all duration-150 group"
                >
                  {/* ID */}
                  <td className="py-4 px-6 font-mono text-xs font-bold text-ochre tracking-wide">
                    {item.id}
                  </td>
                  
                  {/* Submission Date */}
                  <td className="py-4 px-6 font-mono text-xs text-sage/80">
                    {item.submissionDate}
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-6 text-center">
                    <span className={getPriorityBadgeClass(item.priorityLevel)}>
                      {item.priorityLevel}
                    </span>
                  </td>

                  {/* Theme / Title */}
                  <td className="py-4 px-6">
                    <div className="space-y-0.5">
                      <span className="font-serif text-sm text-cream font-bold block">
                        {item.title}
                      </span>
                      <p className="text-[10px] text-sage/70 leading-relaxed font-light font-sans max-w-md truncate md:whitespace-normal">
                        {item.description}
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  {/* Auditing Action links */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => setView("TIMELINE")}
                      className="px-3 py-1 bg-ochre hover:bg-ochre/90 text-cream rounded font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {filteredLedger.length > visibleCount && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 border border-sage/30 hover:border-ochre hover:bg-ochre/10 rounded font-mono text-xs uppercase tracking-widest text-cream transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Load Older Records</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Ledger status readout */}
      <div className="text-center text-[10px] font-mono text-sage/40 uppercase tracking-widest">
        End of visible ledger chunk. {14289 + ledger.length} records total in District.
      </div>

    </div>
  );
}
