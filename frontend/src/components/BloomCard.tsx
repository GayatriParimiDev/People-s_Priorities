import React from "react";

interface BloomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  demandScore: number;
  children: React.ReactNode;
  className?: string;
  key?: React.Key | any;
}

export default function BloomCard({ demandScore, children, className = "", ...props }: BloomCardProps) {
  /**
   * Light Formal BloomCard — adapts its accent bar color + intensity
   * based on demand_score. Higher scores → stronger, darker accent.
   * Card body remains #FFFFFF with a 4px left accent bar.
   */

  const getAccentConfig = (score: number): { color: string; barWidth: string; shadowColor: string } => {
    if (score > 75) {
      // High urgency — Peony Crimson accent
      const intensity = Math.min(1, (score - 75) / 25); // 0 to 1 within the 75-100 range
      return {
        color: `rgba(201, 42, 42, ${0.7 + intensity * 0.3})`,
        barWidth: "4px",
        shadowColor: `rgba(201, 42, 42, ${0.06 + intensity * 0.08})`
      };
    } else if (score > 40) {
      // Medium urgency — Marigold Amber accent
      const intensity = Math.min(1, (score - 40) / 35);
      return {
        color: `rgba(185, 127, 0, ${0.6 + intensity * 0.4})`,
        barWidth: "4px",
        shadowColor: `rgba(185, 127, 0, ${0.04 + intensity * 0.06})`
      };
    } else {
      // Low urgency / resolved — Jade Teal accent
      return {
        color: "rgba(18, 119, 109, 0.65)",
        barWidth: "3px",
        shadowColor: "rgba(18, 119, 109, 0.04)"
      };
    }
  };

  const accent = getAccentConfig(demandScore);
  const isHighUrgency = demandScore > 75;

  const bloomStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderLeft: `${accent.barWidth} solid ${accent.color}`,
    borderTop: "1px solid #E2E8F0",
    borderRight: "1px solid #E2E8F0",
    borderBottom: "1px solid #E2E8F0",
    boxShadow: `0 1px 4px ${accent.shadowColor}`,
  };

  return (
    <div
      style={bloomStyle}
      className={`rounded-lg p-5 transition-all duration-250 ${
        isHighUrgency ? "bloom-pulse hover:shadow-md" : "hover:shadow-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
