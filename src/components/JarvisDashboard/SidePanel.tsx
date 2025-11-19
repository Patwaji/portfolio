'use client';

import React from 'react';

interface SidePanelProps {
    title: string;
    align?: 'left' | 'right';
    children: React.ReactNode;
    className?: string;
}

export default function SidePanel({
    title,
    align = 'left',
    children,
    className = ''
}: SidePanelProps) {
    return (
        <div className={`flex flex-col gap-4 w-full ${className}`}>
            {/* Header */}
            <div className={`flex items-center gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
                <h3 className="font-display font-bold text-lg tracking-widest text-white uppercase">
                    {title}
                </h3>
                <div className="w-2 h-2 bg-cyan rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
            </div>

            {/* Content Container */}
            <div className={`
        relative p-6 bg-glass/30 border border-white/5 rounded-lg backdrop-blur-sm
        before:absolute before:top-0 before:w-4 before:h-4 before:border-t before:border-cyan/50
        after:absolute after:bottom-0 after:w-4 after:h-4 after:border-b after:border-cyan/50
        ${align === 'left'
                    ? 'before:left-0 before:border-l after:right-0 after:border-r rounded-tr-[2rem]'
                    : 'before:right-0 before:border-r after:left-0 after:border-l rounded-tl-[2rem]'
                }
      `}>
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,243,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none" />

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
