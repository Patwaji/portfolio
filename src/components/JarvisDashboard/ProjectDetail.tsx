'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Project } from './ProjectList';
import { ExternalLink, Github, Activity, Shield, Zap } from 'lucide-react';

interface ProjectDetailProps {
    project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isGlitching, setIsGlitching] = useState(false);

    // Glitch effect on project change
    useEffect(() => {
        setIsGlitching(true);

        const ctx = gsap.context(() => {
            // Glitch Animation
            gsap.to(containerRef.current, {
                opacity: 0.5,
                x: 5,
                duration: 0.05,
                repeat: 5,
                yoyo: true,
                onComplete: () => {
                    gsap.to(containerRef.current, { opacity: 1, x: 0 });
                    setIsGlitching(false);
                }
            });

            // Metrics Animation
            gsap.from('.metric-bar', {
                width: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.3
            });

            gsap.from('.metric-value', {
                textContent: 0,
                duration: 1.5,
                snap: { textContent: 1 },
                stagger: 0.1,
                delay: 0.3
            });

        }, containerRef);

        return () => ctx.revert();
    }, [project.id]);

    return (
        <div ref={containerRef} className="h-full flex flex-col relative overflow-hidden">
            {/* Scanline Overlay */}
            {isGlitching && (
                <div className="absolute inset-0 z-50 bg-cyan/10 pointer-events-none animate-pulse">
                    <div className="w-full h-1 bg-cyan/50 absolute top-0 animate-[scan_0.5s_linear_infinite]" />
                </div>
            )}

            {/* Header Area */}
            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden border border-cyan/20 mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />

                {/* Holographic Grid Background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-cyber-grid opacity-20" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-cyan mb-2">
                                <Shield size={16} className="animate-pulse" />
                                <span className="text-xs font-mono tracking-widest">SECURE CONNECTION ESTABLISHED</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide mb-2">
                                {project.title}
                            </h1>
                            <p className="text-cyan/60 font-mono text-sm max-w-xl">
                                {project.description}
                            </p>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded border ${project.status === 'Active'
                                ? 'bg-green-500/10 border-green-500 text-green-400'
                                : 'bg-gray-500/10 border-gray-500 text-gray-400'
                            } font-mono text-xs`}>
                            STATUS: {project.status.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* Left Col: Specs & Tech */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tech Stack */}
                    <div className="bg-black/20 border border-cyan/10 rounded-lg p-4">
                        <h3 className="text-sm font-mono text-cyan mb-4 border-b border-cyan/20 pb-2">SYSTEM SPECIFICATIONS</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.specs.map((spec, i) => (
                                <span key={i} className="px-3 py-1 bg-cyan/5 border border-cyan/20 rounded text-xs text-cyan/80 font-mono hover:bg-cyan/10 transition-colors cursor-default">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Metrics Visualization */}
                    {project.metrics && project.metrics.length > 0 && (
                        <div className="bg-black/20 border border-cyan/10 rounded-lg p-4">
                            <h3 className="text-sm font-mono text-cyan mb-4 border-b border-cyan/20 pb-2">PERFORMANCE METRICS</h3>
                            <div className="space-y-4">
                                {project.metrics.map((metric, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs font-mono text-cyan/60">
                                            <span>{metric.label}</span>
                                            <span><span className="metric-value text-white">{metric.value}</span>%</span>
                                        </div>
                                        <div className="h-1 bg-cyan/10 rounded-full overflow-hidden">
                                            <div
                                                className="metric-bar h-full bg-gradient-to-r from-cyan/40 to-cyan shadow-[0_0_10px_cyan]"
                                                style={{ width: `${metric.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Col: Actions & Info */}
                <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {project.demoLink && (
                            <a 
                                href={project.demoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-black transition-all duration-300 font-mono text-sm flex items-center justify-center gap-2 group"
                            >
                                <ExternalLink size={16} />
                                <span>LAUNCH DEMO</span>
                                <div className="w-1 h-1 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        )}
                        {project.githubLink && (
                            <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-transparent border border-cyan/30 text-cyan/60 hover:border-cyan hover:text-cyan transition-all duration-300 font-mono text-sm flex items-center justify-center gap-2"
                            >
                                <Github size={16} />
                                <span>SOURCE CODE</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
