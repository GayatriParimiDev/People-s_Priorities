import React from "react";

interface BloomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  demandScore: number;
  children: React.ReactNode;
  className?: string;
  key?: React.Key | any;
}

export default function BloomCard({ demandScore, children, className = "", ...props }: BloomCardProps) {
  // Map demand score to exactly one flower accent color (no gradients, crisp petals)
  const getBloomColor = (score: number): string => {
    if (score > 75) {
      return "#FF6B9D"; // peony pink - high urgency
    } else if (score > 40) {
      return "#FFA94D"; // marigold orange - medium urgency
    } else {
      return "#4ECDC4"; // jade teal - low urgency/resolved
    }
  };

  const color = getBloomColor(demandScore);
  const isHighUrgency = demandScore > 75;

  // Solid warm ivory card with a clear, single-color accent border
  const bloomStyle: React.CSSProperties = {
    backgroundColor: "#FDFBF7",
    borderColor: color,
    borderWidth: "2px",
    borderStyle: "solid",
  };

  return (
    <div
      style={bloomStyle}
      className={`rounded-2xl p-5 shadow-sm transition-all duration-300 ${
        isHighUrgency ? "bloom-pulse hover:shadow-md" : "hover:shadow-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
