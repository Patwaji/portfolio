'use client';

import React from 'react';

interface TimelineItem {
    title: string;
    subtitle: string;
    date: string;
}

interface TechTimelineProps {
    items: TimelineItem[];
}

export default function TechTimeline({ items }: TechTimelineProps) {
    return (
        <div className="relative pl-8 border-l border-cyan/20 space-y-8">
            {items.map((item, index) => (
                <div key={index} className="relative group">
                    {/* Node */}
                    <div className="absolute -left-[37px] top-1 w-4 h-4 bg-black border-2 border-cyan rounded-full group-hover:bg-cyan group-hover:shadow-[0_0_10px_cyan] transition-all duration-300">
                        <div className="absolute inset-0 bg-cyan opacity-0 group-hover:opacity-50 animate-ping rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="bg-white/5 border border-white/5 p-4 rounded-lg hover:border-cyan/30 hover:bg-cyan/5 transition-all duration-300">
                        <h4 className="text-white font-bold font-display tracking-wide">{item.title}</h4>
                        <p className="text-cyan/80 text-sm font-mono mt-1">{item.subtitle}</p>
                        <span className="text-xs text-gray-500 font-mono block mt-2">{item.date}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
