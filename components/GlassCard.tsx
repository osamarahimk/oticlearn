import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'orange' | 'blue' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  hoverEffect = false,
  glowColor = 'none'
}) => {
  // Base styles:
  // Light Mode: White bg with high opacity, gray border, text dark gray
  // Dark Mode: White bg with very low opacity (glass), white border, text white
  const baseStyles = "bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg p-6 transition-all duration-300 text-gray-800 dark:text-white";
  
  let glowStyle = "";
  if (glowColor === 'orange') glowStyle = "hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:border-orange-500/30";
  if (glowColor === 'blue') glowStyle = "hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:border-blue-400/30";
  
  const hoverStyles = hoverEffect ? `hover:-translate-y-1 ${glowStyle}` : "";

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};