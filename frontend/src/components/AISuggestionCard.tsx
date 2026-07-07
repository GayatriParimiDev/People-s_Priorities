import React from "react";
import { Sparkles } from "lucide-react";

interface AISuggestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  badgeText?: string;
}

export default function AISuggestionCard({ 
  children, 
  className = "", 
  badgeText = "AI Suggestion", 
  ...props 
}: AISuggestionCardProps) {
  return (
    <div
      className={`bg-[#FDFBF7] border border-slate-200 border-l-4 border-l-[#845EC2] rounded-r-xl rounded-l-md p-4 shadow-sm relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Decorative background pulse in the corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#845EC2]/5 rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center space-x-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#845EC2] animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#845EC2] font-mono">
          {badgeText}
        </span>
      </div>
      
      <div className="text-xs text-slate-700 leading-relaxed font-sans relative z-10">
        {children}
      </div>
    </div>
  );
}
