'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HexNodeProps {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    active?: boolean;
    className?: string;
    delay?: number;
}

export default function HexNode({
    label,
    icon: Icon,
    onClick,
    active = false,
    className = '',
    delay = 0
}: HexNodeProps) {
    return (
        <div
            className={`group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${className}`}
            onClick={onClick}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Hexagon Shape */}
            <div className={`
        relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center
        transition-all duration-500 ease-out
        ${active ? 'scale-110' : 'group-hover:scale-110'}
      `}>
                {/* Hexagon Border SVG */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
                    <path
                        d="M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z"
                        fill="rgba(0, 243, 255, 0.05)"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`
              transition-all duration-300
              ${active ? 'text-cyan fill-cyan/20 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]' : 'text-cyan/30 group-hover:text-cyan group-hover:fill-cyan/10'}
            `}
                    />

                    {/* Inner Detail Ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                        className={`
              opacity-0 transition-all duration-500
              ${active ? 'opacity-100 text-cyan animate-spin-slow' : 'group-hover:opacity-50 text-cyan/50'}
            `}
                    />
                </svg>

                {/* Icon */}
                <div className={`
          relative z-10 transition-all duration-300
          ${active ? 'text-white scale-110' : 'text-cyan/70 group-hover:text-white group-hover:scale-110'}
        `}>
                    {Icon && <Icon size={32} strokeWidth={1.5} />}
                </div>
            </div>

            {/* Label */}
            <div className={`
        mt-2 font-display tracking-widest text-sm font-bold uppercase transition-all duration-300
        ${active ? 'text-white text-glow-cyan' : 'text-cyan/60 group-hover:text-cyan'}
      `}>
                {label}
            </div>
        </div>
    );
}
