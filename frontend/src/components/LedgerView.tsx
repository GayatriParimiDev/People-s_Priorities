import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  SlidersHorizontal,
  Calendar,
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

  // Badge stylings (Clean Light Mode Styles)
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "border border-rose-200 text-rose-700 bg-rose-50 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider";
      case "ELEVATED":
        return "border border-amber-200 text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider";
      case "STANDARD":
        return "border border-slate-200 text-slate-650 bg-slate-50 px-2 py-0.5 rounded text-[10px] tracking-wider";
      case "RESOLVED":
        return "border border-emerald-200 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] tracking-wider font-bold";
      default:
        return "border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px]";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "UNDER REVIEW":
        return "text-slate-550 font-mono text-xs uppercase tracking-wide";
      case "SCHEDULED":
        return "text-amber-600 font-mono text-xs uppercase tracking-wide font-bold";
      case "ARCHIVED":
        return "text-slate-400 font-mono text-xs uppercase tracking-wide";
      case "CLOSED":
        return "text-neutral-400 font-mono text-xs uppercase tracking-wide line-through";
      case "IN PROGRESS":
        return "text-emerald-600 font-mono text-xs uppercase tracking-wide animate-pulse font-bold";
      default:
        return "text-slate-500 font-mono text-xs";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-white min-h-screen text-slate-850 font-sans">
      
      {/* Title Header Editorial serif */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
          The Public Ledger
        </h1>
        <p className="text-slate-500 font-sans text-xs mt-3 tracking-wider leading-relaxed font-light">
          Permanent immutable record of civic demands and constituency priorities. Authenticated system access only.
        </p>
      </div>

      {/* Advanced Filter and Search Registry Dashboard Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Search Input bar */}
          <div className="lg:col-span-6 border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col justify-between">
            <span className="font-mono text-[9px] text-slate-450 uppercase tracking-widest block mb-2">
              Search Registry
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query by ID, Theme, Title, or Keyword..."
                className="w-full bg-white border border-slate-250 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-600 font-sans shadow-sm"
              />
            </div>
          </div>

          {/* Standard Select parameters */}
          <div className="lg:col-span-4 border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col justify-between">
            <span className="font-mono text-[9px] text-slate-450 uppercase tracking-widest block mb-2">
              Base Parameters
            </span>
            <div className="grid grid-cols-2 gap-4">
              {/* Priority selection */}
              <div>
                <label className="font-mono text-[9px] text-slate-450 uppercase block mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-800 uppercase tracking-wider outline-none font-mono cursor-pointer shadow-sm"
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
                <label className="font-mono text-[9px] text-slate-450 uppercase block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-800 uppercase tracking-wider outline-none font-mono cursor-pointer shadow-sm"
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
              className={`w-full h-full border rounded-xl p-4 flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                showAdvanced || themeFilter !== "ALL" || startDate || endDate
                  ? "border-indigo-600 bg-indigo-50 text-indigo-750 font-bold"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-600 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 text-indigo-650" />
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                {showAdvanced ? "Hide Advanced" : "Advanced Filters"}
              </span>
              {(themeFilter !== "ALL" || startDate || endDate) && (
                <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                  Active
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Collapsible Advanced Filters Accordion Panel */}
        {showAdvanced && (
          <div className="border border-indigo-150 bg-indigo-50/20 rounded-xl p-6 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Date range pickers */}
              <div className="space-y-3">
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Interactive Date Range Selection</span>
                </span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] text-slate-500 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg p-2 text-xs text-slate-800 outline-none font-mono focus:border-indigo-600 shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[10px] text-slate-500 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg p-2 text-xs text-slate-800 outline-none font-mono focus:border-indigo-600 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Actions & dynamic counter */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">
                    Current Matches
                  </span>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs font-mono flex items-center justify-between shadow-sm">
                    <span className="text-slate-500">Matching Items:</span>
                    <span className="text-indigo-600 font-bold text-sm">
                      {filteredLedger.length} <span className="text-xs text-slate-400 font-normal">/ {ledger.length}</span>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex-1 py-2.5 bg-white hover:bg-slate-100 border border-slate-250 text-slate-650 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(false)}
                    className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Dynamic Theme selection chips */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">
                Filter by Category Theme
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setThemeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                    themeFilter === "ALL"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-750 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800 shadow-sm"
                  }`}
                >
                  {themeFilter === "ALL" && <Check className="w-3 h-3 text-indigo-600" />}
                  <span>All Themes</span>
                </button>

                {uniqueThemes.map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setThemeFilter(theme)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                      themeFilter === theme
                        ? "border-indigo-600 bg-indigo-50 text-indigo-750 font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800 shadow-sm"
                    }`}
                  >
                    {themeFilter === theme && <Check className="w-3 h-3 text-indigo-600" />}
                    <span>{theme}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Table Matrix */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-sans text-[10px] text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">ID #</th>
              <th className="py-4 px-6">Submission Date</th>
              <th className="py-4 px-6 text-center">Priority Level</th>
              <th className="py-4 px-6">Theme / Title</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-center">Auditing</th>
            </tr>
          </thead>
          <tbody className="font-sans text-xs divide-y divide-slate-150">
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                  NO CORRESPONDING RECORDS SECURED IN LEDGER CHUNK
                </td>
              </tr>
            ) : (
              filteredLedger.slice(0, visibleCount).map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50/50 transition-all duration-150 group"
                >
                  {/* ID */}
                  <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600 tracking-wide">
                    {item.id}
                  </td>
                  
                  {/* Submission Date */}
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">
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
                      <span className="font-serif text-sm text-slate-850 font-bold block">
                        {item.title}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light font-sans max-w-md truncate md:whitespace-normal">
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
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer opacity-70 group-hover:opacity-100"
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
            className="px-6 py-3 border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 rounded-xl font-mono text-xs uppercase tracking-widest text-slate-700 transition-all cursor-pointer inline-flex items-center space-x-2 shadow-sm"
          >
            <span>Load Older Records</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      )}

      {/* Ledger status readout */}
      <div className="text-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
        End of visible ledger chunk. {14289 + ledger.length} records total in District.
      </div>

    </div>
  );
}
