import React from "react";
import { 
  LayoutGrid, 
  Send, 
  Sliders, 
  Archive, 
  Settings, 
  Plus,
  Home,
  LogOut,
  Lock,
  Terminal,
  FileText
} from "lucide-react";
import { ViewState, User } from "../types";

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  districtId: string;
  representative: string;
  onNewInitiative: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ 
  currentView, 
  setView, 
  districtId, 
  representative,
  onNewInitiative,
  currentUser,
  onLogout
}: SidebarProps) {
  
  const role = currentUser?.role || "MP";
  const isAdmin = role === "ADMINISTRATOR";
  const isMP = role === "MP";
  const isMLA = role === "MLA";
  const isStaff = role === "STAFF" || role === "VERIFICATION_OFFICER";

  // Dynamic menu items based on role
  let menuItems: Array<{ id: ViewState; label: string; icon: React.ComponentType<any> }> = [];

  if (isAdmin) {
    menuItems = [
      { id: "DASHBOARD", label: "System Console", icon: Terminal },
      { id: "LEDGER", label: "Global Ledger Audits", icon: Archive },
    ];
  } else if (isMP) {
    menuItems = [
      { id: "DASHBOARD", label: "District Analytics", icon: LayoutGrid },
      { id: "QUEUE", label: "AI Priority Queue", icon: Sliders },
      { id: "AUDIT", label: "Audit Trail", icon: Archive },
      { id: "FUNDS", label: "Fund Ledger", icon: Settings },
      { id: "REPORTS", label: "Executive Reports", icon: Send },
      { id: "EVALUATION", label: "AI Endorsements", icon: Sliders },
      { id: "LEDGER", label: "Public Ledger", icon: Archive },
    ];
  } else if (isMLA) {
    menuItems = [
      { id: "DASHBOARD", label: "Constituency Analytics", icon: LayoutGrid },
      { id: "QUEUE", label: "AI Priority Queue", icon: Sliders },
      { id: "AUDIT", label: "Audit Trail", icon: Archive },
      { id: "FUNDS", label: "Constituency Fund Ledger", icon: Settings },
      { id: "LEDGER", label: "Public Ledger", icon: Archive },
    ];
  } else if (isStaff) {
    menuItems = [
      { id: "INTAKE", label: "Initiative Intake", icon: Plus },
      { id: "QUEUE", label: "AI Priority Queue", icon: Sliders },
      { id: "AUDIT", label: "Audit Trail", icon: Archive },
      { id: "LEDGER", label: "Public Ledger", icon: Archive },
    ];
  }

  // Theme configuration based on role (All light mode variants)
  let themeClasses = {
    sidebarBg: "bg-white border-r border-zinc-200 text-black font-sans",
    logoSec: "border-b border-zinc-200 bg-zinc-50",
    avatarBorder: "border-zinc-300 hover:border-zinc-500",
    roleBadge: "bg-zinc-100 border border-zinc-200 text-zinc-700",
    activeButton: "bg-amber-50 text-amber-800 font-bold border-l-4 border-ochre",
    hoverButton: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
    divideLine: "bg-zinc-200",
    bottomSec: "border-t border-zinc-200",
    footerBg: "border-t border-zinc-150 bg-zinc-50 text-zinc-400"
  };

  if (isAdmin) {
    themeClasses = {
      sidebarBg: "bg-emerald-50/20 border-r border-emerald-200 text-emerald-900 font-mono",
      logoSec: "border-b border-emerald-200 bg-emerald-50/50",
      avatarBorder: "border-emerald-400 hover:border-emerald-600",
      roleBadge: "bg-emerald-100/60 text-emerald-800 border border-emerald-200/50",
      activeButton: "bg-emerald-100 text-emerald-900 font-bold border-l-4 border-emerald-600",
      hoverButton: "text-emerald-800/80 hover:bg-emerald-100/30 hover:text-emerald-955",
      divideLine: "bg-emerald-200/50",
      bottomSec: "border-t border-emerald-200/50",
      footerBg: "border-t border-emerald-200/40 bg-emerald-50/30 text-emerald-700/60"
    };
  } else if (isStaff) {
    themeClasses = {
      sidebarBg: "bg-slate-50 border-r border-slate-200 text-slate-800 font-sans",
      logoSec: "border-b border-slate-200 bg-slate-100/50",
      avatarBorder: "border-slate-350 hover:border-slate-500",
      roleBadge: "bg-slate-100 border border-slate-200 text-indigo-700",
      activeButton: "bg-indigo-50 text-indigo-750 font-bold border-l-4 border-indigo-650",
      hoverButton: "text-slate-650 hover:bg-slate-150 hover:text-slate-900",
      divideLine: "bg-slate-200",
      bottomSec: "border-t border-slate-200",
      footerBg: "border-t border-slate-200 bg-slate-100/30 text-slate-500"
    };
  }

  return (
    <div className={`w-64 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 shadow-sm transition-all duration-300 ${themeClasses.sidebarBg}`}>
      {/* Top Profile / Office section */}
      <div className={`p-6 flex items-center space-x-3 ${themeClasses.logoSec}`}>
        <div className="relative group cursor-pointer" onClick={() => setView(currentUser ? "SETTINGS" : "AUTH")}>
          <div className={`w-12 h-12 rounded overflow-hidden border-2 flex items-center justify-center bg-black/5 transition-all duration-300 ${themeClasses.avatarBorder}`}>
            {currentUser ? (
              <span className={`font-bold text-base uppercase ${isAdmin ? "font-mono" : "font-serif"}`}>
                {currentUser.name.slice(0, 2)}
              </span>
            ) : (
              <svg viewBox="0 0 100 100" className="w-full h-full bg-slate-100">
                <circle cx="50" cy="40" r="22" fill="#0b1329" />
                <path d="M15 88 C 15 65, 85 65, 85 88 Z" fill="#0b1329" />
              </svg>
            )}
          </div>
          {currentUser && (
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isAdmin ? "bg-emerald-500" : "bg-emerald-500"}`}></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 
            className={`font-bold text-sm tracking-tight cursor-pointer transition-all truncate ${isAdmin ? "text-emerald-800 font-mono" : (isStaff ? "text-slate-800 hover:text-indigo-600 font-sans" : "text-black hover:text-ochre font-serif")}`} 
            onClick={() => setView(currentUser ? "SETTINGS" : "AUTH")}
          >
            {currentUser ? currentUser.name : "Secure Portal"}
          </h2>
          {currentUser ? (
            <span className={`inline-block text-[8px] uppercase px-1.5 py-0.5 rounded leading-none mt-1 font-bold ${themeClasses.roleBadge}`}>
              {currentUser.role}
            </span>
          ) : (
            <button
              onClick={() => setView("AUTH")}
              className="text-amber-600 font-mono text-[9px] mt-1 hover:underline flex items-center space-x-1 cursor-pointer text-left font-bold"
            >
              <Lock className="w-2.5 h-2.5 shrink-0" />
              <span>Authenticate</span>
            </button>
          )}
        </div>
      </div>
  
      {/* Primary CTA: New Initiative Button (Only for MP / Staff to submit official actions) */}
      {(isMP || isStaff) && (
        <div className="px-4 py-6">
          <button 
            onClick={onNewInitiative}
            id="btn-new-initiative"
            className={`w-full flex items-center justify-between px-4 py-3 text-white rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md transform active:scale-[0.98] border cursor-pointer ${
              isStaff 
                ? "bg-indigo-650 hover:bg-indigo-600 border-indigo-650/20" 
                : "bg-coral hover:bg-coral/90 border-coral/10"
            }`}
          >
            <span>New Initiative</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className={`flex-1 px-3 space-y-1 ${isAdmin ? "pt-6" : (isStaff && !onNewInitiative ? "pt-6" : "")}`}>
        {/* Portal Home Option */}
        <button
          onClick={() => setView("LANDING")}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded text-xs uppercase tracking-wider transition-all duration-250 cursor-pointer text-left ${
            currentView === "LANDING"
              ? themeClasses.activeButton
              : themeClasses.hoverButton
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Portal Home</span>
        </button>
  
        <div className={`h-[1px] my-2 ${themeClasses.divideLine}`}></div>
  
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded text-xs uppercase tracking-wider transition-all duration-250 cursor-pointer text-left ${
                isActive
                  ? themeClasses.activeButton
                  : themeClasses.hoverButton
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
  
      {/* Bottom section: Settings & Support */}
      <div className={`p-4 space-y-1 ${themeClasses.bottomSec}`}>
        <button
          onClick={() => setView("SETTINGS")}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded text-xs uppercase tracking-wider transition-all cursor-pointer text-left ${
            currentView === "SETTINGS"
              ? themeClasses.activeButton
              : themeClasses.hoverButton
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        {currentUser && (
          <button
            onClick={onLogout}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded text-xs uppercase tracking-wider transition-all cursor-pointer text-left ${
              isAdmin 
                ? "text-red-650 hover:bg-red-500/10" 
                : "text-red-555 hover:bg-red-500/10"
            }`}
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        )}
      </div>
  
      {/* Footer label */}
      <div className={`p-4 text-center ${themeClasses.footerBg}`}>
        <span className="text-[9px] uppercase tracking-widest font-mono">
          {isAdmin ? "ADMIN CONTROL CENTER // v1.0.4" : (isStaff ? "STAFF WORKSTATION // v1.0.4" : "District Ledger System")}
        </span>
      </div>
    </div>
  );
}
