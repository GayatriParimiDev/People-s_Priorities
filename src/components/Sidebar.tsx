import { 
  LayoutGrid, 
  Send, 
  Sliders, 
  Archive, 
  Settings, 
  HelpCircle, 
  Plus,
  Home,
  LogOut,
  Lock
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
  
  const menuItems = [
    { id: "INTAKE", label: "Intake", icon: Send },
    { id: "DASHBOARD", label: "Dashboard", icon: LayoutGrid },
    { id: "EVALUATION", label: "Evaluation", icon: Sliders },
    { id: "LEDGER", label: "Archives", icon: Archive },
  ] as const;

  return (
    <div className="w-64 bg-[#071D32] border-r border-[#D3D4C0]/25 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 shadow-2xl">
      {/* Top Profile / Office section */}
      <div className="p-6 border-b border-[#D3D4C0]/15 flex items-center space-x-3 bg-gradient-to-b from-black/20 to-transparent">
        <div className="relative group cursor-pointer" onClick={() => setView(currentUser ? "SETTINGS" : "AUTH")}>
          <div className="w-12 h-12 rounded overflow-hidden border-2 border-[#D3D4C0] hover:border-[#8B5E3C] transition-all duration-300 flex items-center justify-center bg-black/45">
            {currentUser ? (
              <span className="font-serif font-bold text-base text-[#F3E4C9] uppercase">
                {currentUser.name.slice(0, 2)}
              </span>
            ) : (
              <svg viewBox="0 0 100 100" className="w-full h-full bg-[#D3D4C0]">
                {/* Stylish SVG Avatar */}
                <circle cx="50" cy="40" r="22" fill="#071D32" />
                <path d="M15 88 C 15 65, 85 65, 85 88 Z" fill="#071D32" />
              </svg>
            )}
          </div>
          {currentUser && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#071D32] rounded-full"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 
            className="text-[#F3E4C9] font-serif font-bold text-sm tracking-tight hover:text-[#8B5E3C] cursor-pointer transition-all truncate" 
            onClick={() => setView(currentUser ? "SETTINGS" : "AUTH")}
          >
            {currentUser ? currentUser.name : "Secure Portal"}
          </h2>
          {currentUser ? (
            <span className="inline-block text-[8px] font-mono uppercase bg-[#8B5E3C]/20 border border-[#8B5E3C]/40 text-[#D3D4C0] px-1.5 py-0.5 rounded leading-none mt-1 font-bold">
              {currentUser.role}
            </span>
          ) : (
            <button
              onClick={() => setView("AUTH")}
              className="text-amber-500/90 font-mono text-[9px] mt-1 hover:underline flex items-center space-x-1 cursor-pointer text-left"
            >
              <Lock className="w-2.5 h-2.5 shrink-0" />
              <span>Authenticate</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary CTA: New Initiative Button */}
      <div className="px-4 py-6">
        <button 
          onClick={onNewInitiative}
          id="btn-new-initiative"
          className="w-full flex items-center justify-between px-4 py-3 bg-[#D05A3F] hover:bg-[#D05A3F]/90 text-[#F3E4C9] rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg transform active:scale-[0.98] border border-[#F3E4C9]/10 cursor-pointer"
        >
          <span>New Initiative</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1">
        {/* Portal Home (Landing Page) Option */}
        <button
          onClick={() => setView("LANDING")}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded font-mono text-xs uppercase tracking-wider transition-all duration-250 cursor-pointer text-left ${
            currentView === "LANDING"
              ? "bg-[#8B5E3C] text-[#F3E4C9] font-bold border-l-4 border-[#F3E4C9]"
              : "text-[#D3D4C0] hover:bg-[#F3E4C9]/5 hover:text-[#F3E4C9]"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Portal Home</span>
        </button>

        <div className="h-[1px] bg-[#D3D4C0]/10 my-2"></div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded font-mono text-xs uppercase tracking-wider transition-all duration-250 cursor-pointer text-left ${
                isActive
                  ? "bg-[#8B5E3C] text-[#F3E4C9] font-bold border-l-4 border-[#F3E4C9]"
                  : "text-[#D3D4C0] hover:bg-[#F3E4C9]/5 hover:text-[#F3E4C9]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section: Settings & Support */}
      <div className="p-4 border-t border-[#D3D4C0]/10 space-y-1">
        <button
          onClick={() => setView("SETTINGS")}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-left ${
            currentView === "SETTINGS"
              ? "bg-[#8B5E3C] text-[#F3E4C9]"
              : "text-[#D3D4C0] hover:bg-[#F3E4C9]/5 hover:text-[#F3E4C9]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        {currentUser && (
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded font-mono text-xs uppercase tracking-wider transition-all cursor-pointer text-left text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        )}
      </div>

      {/* Tiny descriptive label at the bottom (humble copyright, no tech larping) */}
      <div className="p-4 text-center border-t border-[#D3D4C0]/5 bg-black/10">
        <span className="text-[9px] font-mono text-[#D3D4C0]/40 uppercase tracking-widest">
          District Ledger System
        </span>
      </div>
    </div>
  );
}
