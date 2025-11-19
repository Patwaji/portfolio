'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Code2, Server, Box, Palette, Cloud, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface Skill {
    name: string;
    icon: React.ReactNode;
    color: string;
}

export default function SkillsRadar() {
    const skillsRef = useRef<HTMLDivElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const skills: Skill[] = [
        { name: 'React & Next.js', icon: <Code2 size={32} />, color: 'cyan' },
        { name: 'TypeScript', icon: <Code2 size={32} />, color: 'blue' },
        { name: 'Node.js', icon: <Server size={32} />, color: 'purple' },
        { name: 'UI/UX Design', icon: <Palette size={32} />, color: 'rose' },
        { name: 'Tailwind CSS', icon: <Sparkles size={32} />, color: 'teal' },
        { name: 'MongoDB', icon: <Server size={32} />, color: 'cyan' },
        { name: 'GSAP', icon: <Sparkles size={32} />, color: 'blue' },
    ];

    useEffect(() => {
        if (!skillsRef.current) return;

        const items = skillsRef.current.querySelectorAll('.skill-item');
        
        gsap.fromTo(
            items,
            { 
                scale: 0,
                opacity: 0,
                rotation: -180
            },
            {
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: 'elastic.out(1, 0.5)',
            }
        );
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center p-8" ref={skillsRef}>
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-display font-bold text-white mb-3">
                        What I Work With
                    </h3>
                    <p className="text-cyan/60 text-sm font-mono">My favorite tools and technologies</p>
                </div>

                {/* Circular Skills Layout */}
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                    {/* Center Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan/10 rounded-full blur-3xl animate-pulse-slow" />
                    
                    {/* Skills in Circle */}
                    {skills.map((skill, index) => {
                        const angle = (index / skills.length) * 2 * Math.PI - Math.PI / 2;
                        const radius = 45; // percentage
                        const x = 50 + radius * Math.cos(angle);
                        const y = 50 + radius * Math.sin(angle);
                        
                        return (
                            <div
                                key={index}
                                className="skill-item absolute"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className={`
                                    relative group cursor-pointer
                                    w-20 h-20 md:w-24 md:h-24
                                    bg-black/60 backdrop-blur-sm
                                    border-2 border-${skill.color}-500/30
                                    rounded-2xl
                                    flex items-center justify-center
                                    transition-all duration-300
                                    hover:scale-125 hover:border-${skill.color}-500
                                    hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]
                                    hover:bg-black/80
                                    ${hoveredIndex === index ? 'z-50' : 'z-10'}
                                `}>
                                    {/* Icon */}
                                    <div className={`text-${skill.color}-400 group-hover:text-${skill.color}-300 transition-colors duration-300`}>
                                        {skill.icon}
                                    </div>
                                    
                                    {/* Skill Name Tooltip */}
                                    <div className={`
                                        absolute -bottom-10 left-1/2 -translate-x-1/2
                                        px-3 py-1.5 bg-black/90 border border-cyan/30 rounded-lg
                                        text-xs font-mono text-cyan whitespace-nowrap
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity duration-300
                                        pointer-events-none
                                    `}>
                                        {skill.name}
                                    </div>
                                    
                                    {/* Rotating Ring */}
                                    <div className="absolute inset-0 rounded-2xl border border-cyan/20 group-hover:border-cyan/50 transition-colors duration-300" />
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Center Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full border-2 border-cyan/30 flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="text-cyan animate-pulse" size={32} />
                    </div>
                </div>

                {/* Footer Text */}
                <div className="text-center mt-16">
                    <p className="text-cyan/40 text-xs font-mono">Hover over each skill to see details</p>
                </div>
            </div>
        </div>
    );
}
