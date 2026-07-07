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

  // ── Light Formal Theme — role-based sidebar accents ──
  // All roles use the same light formal base; only accent colors change
  let accentColor = "#0B4F92"; // brand-primary default
  let accentBg = "bg-[#0B4F92]/5";
  let accentText = "text-[#0B4F92]";
  let accentBorder = "border-[#0B4F92]";
  let roleBadgeBg = "bg-[#0B4F92]/8 text-[#0B4F92] border-[#0B4F92]/15";
  let footerLabel = "District Ledger System";

  if (isAdmin) {
    accentColor = "#12776D";
    accentBg = "bg-[#12776D]/5";
    accentText = "text-[#12776D]";
    accentBorder = "border-[#12776D]";
    roleBadgeBg = "bg-[#12776D]/8 text-[#12776D] border-[#12776D]/15";
    footerLabel = "ADMIN CONTROL CENTER // v1.0.4";
  } else if (isStaff) {
    accentColor = "#6F32CF";
    accentBg = "bg-[#6F32CF]/5";
    accentText = "text-[#6F32CF]";
    accentBorder = "border-[#6F32CF]";
    roleBadgeBg = "bg-[#6F32CF]/8 text-[#6F32CF] border-[#6F32CF]/15";
    footerLabel = "STAFF WORKSTATION // v1.0.4";
  }

  return (
    <div className="w-64 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 bg-white border-r border-[#E2E8F0] font-sans transition-all duration-300">
      
      {/* ── Top Profile / Office section ── */}
      <div className="p-6 flex items-center space-x-3 border-b border-[#E2E8F0] bg-[#F4F6F8]">
        <div className="relative group cursor-pointer" onClick={() => setView(currentUser ? "SETTINGS" : "AUTH")}>
          <div className={`w-11 h-11 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-[#EBF0F5] transition-all duration-250 ${accentBorder}/30 hover:${accentBorder}`}>
            {currentUser ? (
              <span className="font-display font-bold text-sm uppercase text-[#000000]">
                {currentUser.name.slice(0, 2)}
              </span>
            ) : (
              <svg viewBox="0 0 100 100" className="w-full h-full bg-[#EBF0F5]">
                <circle cx="50" cy="40" r="22" fill="#4F5A6D" />
                <path d="M15 88 C 15 65, 85 65, 85 88 Z" fill="#4F5A6D" />
              </svg>
            )}
          </div>
          {currentUser && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full bg-[#0D9668]"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 
            className="font-display font-bold text-sm tracking-tight cursor-pointer transition-colors duration-200 truncate text-[#000000] hover:text-[#0B4F92]"
            onClick={() => setView(currentUser ? "SETTINGS" : "AUTH")}
          >
            {currentUser ? currentUser.name : "Secure Portal"}
          </h2>
          {currentUser ? (
            <span className={`inline-block text-[8px] uppercase px-1.5 py-0.5 rounded leading-none mt-1 font-mono font-bold border ${roleBadgeBg}`}>
              {currentUser.role}
            </span>
          ) : (
            <button
              onClick={() => setView("AUTH")}
              className="text-[#0B4F92] font-mono text-[9px] mt-1 hover:underline flex items-center space-x-1 cursor-pointer text-left font-bold"
            >
              <Lock className="w-2.5 h-2.5 shrink-0" />
              <span>Authenticate</span>
            </button>
          )}
        </div>
      </div>
  
      {/* ── Primary CTA: New Initiative Button ── */}
      {(isMP || isStaff) && (
        <div className="px-4 py-5">
          <button 
            onClick={onNewInitiative}
            id="btn-new-initiative"
            className="btn-primary w-full flex items-center justify-between shadow-sm transform active:scale-[0.97]"
          >
            <span>New Initiative</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Navigation List ── */}
      <nav className={`flex-1 px-3 space-y-0.5 ${isAdmin ? "pt-5" : (isStaff && !onNewInitiative ? "pt-5" : "")}`}>
        {/* Portal Home Option */}
        <button
          onClick={() => setView("LANDING")}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-left ${
            currentView === "LANDING"
              ? `${accentBg} ${accentText} font-bold border-l-4 ${accentBorder}`
              : "text-[#4F5A6D] hover:bg-[#EBF0F5] hover:text-[#000000]"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Portal Home</span>
        </button>
  
        <div className="h-[1px] my-2 bg-[#E2E8F0]"></div>
  
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-left ${
                isActive
                  ? `${accentBg} ${accentText} font-bold border-l-4 ${accentBorder}`
                  : "text-[#4F5A6D] hover:bg-[#EBF0F5] hover:text-[#000000]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
  
      {/* ── Bottom section: Settings & Logout ── */}
      <div className="p-4 space-y-0.5 border-t border-[#E2E8F0]">
        <button
          onClick={() => setView("SETTINGS")}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-left ${
            currentView === "SETTINGS"
              ? `${accentBg} ${accentText} font-bold border-l-4 ${accentBorder}`
              : "text-[#4F5A6D] hover:bg-[#EBF0F5] hover:text-[#000000]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        {currentUser && (
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-left text-[#C92A2A]/70 hover:bg-[#C92A2A]/5 hover:text-[#C92A2A]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
  
      {/* ── Footer label ── */}
      <div className="p-4 text-center border-t border-[#E2E8F0] bg-[#F4F6F8]">
        <span className="text-[9px] uppercase tracking-widest font-mono text-[#4F5A6D]/60">
          {footerLabel}
        </span>
      </div>
    </div>
  );
}
