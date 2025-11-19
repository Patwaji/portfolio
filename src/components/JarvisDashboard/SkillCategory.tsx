'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SkillCategoryProps {
    title: string;
    skills: string[];
    defaultOpen?: boolean;
}

export default function SkillCategory({ title, skills, defaultOpen = false }: SkillCategoryProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-cyan/30 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-cyan/5 transition-colors group"
            >
                <h3 className="text-lg font-display font-bold text-white tracking-widest uppercase">
                    {title}
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-cyan/60 group-hover:text-cyan transition-colors">
                        {skills.length} ITEMS
                    </span>
                    {isOpen ? (
                        <ChevronUp className="text-cyan" size={20} />
                    ) : (
                        <ChevronDown className="text-cyan/60 group-hover:text-cyan transition-colors" size={20} />
                    )}
                </div>
            </button>

            {/* Content */}
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
            >
                <div className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="group relative p-3 bg-black/40 border border-cyan/20 rounded hover:border-cyan hover:bg-cyan/5 transition-all duration-300 cursor-default"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-cyan rounded-full group-hover:shadow-[0_0_8px_cyan] transition-all" />
                                <span className="text-sm font-mono text-cyan/80 group-hover:text-white transition-colors">
                                    {skill}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
