'use client';

import React from 'react';
import CentralHub from './CentralHub';
import SidePanel from './SidePanel';
import { Activity, Database, Wifi, Battery, Shield, Terminal } from 'lucide-react';

export default function JarvisDashboard() {
    return (
        <div className="min-h-screen w-full bg-void flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
            {/* Background Grid & Effects */}
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-void-gradient opacity-80 pointer-events-none" />

            {/* Main Content Grid */}
            <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 items-center">

                {/* Left Column: System Status */}
                <div className="hidden lg:flex flex-col gap-8 justify-center h-full">
                    <SidePanel title="System Status" align="left">
                        <div className="space-y-4 font-mono text-sm text-cyan/80">
                            <div className="flex justify-between items-center">
                                <span>CORE INTEGRITY</span>
                                <span className="text-white">100%</span>
                            </div>
                            <div className="w-full h-1 bg-cyan/20 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan w-full shadow-[0_0_10px_cyan]" />
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <span>NET LINK</span>
                                <span className="text-green-400">SECURE</span>
                            </div>

                            <div className="space-y-2 mt-6 pt-4 border-t border-cyan/20">
                                <div className="flex items-center gap-2 text-xs text-cyan/60">
                                    <Activity size={14} />
                                    <span>PROCESS: OPTIMIZED</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-cyan/60">
                                    <Database size={14} />
                                    <span>MEMORY: 64TB</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-cyan/60">
                                    <Wifi size={14} />
                                    <span>LATENCY: 12ms</span>
                                </div>
                            </div>
                        </div>
                    </SidePanel>

                    <SidePanel title="Activity Log" align="left">
                        <div className="space-y-2 font-mono text-xs text-cyan/60 h-[150px] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
                            <p>[10:42:01] SYSTEM INITIALIZED</p>
                            <p>[10:42:03] LOADING ASSETS...</p>
                            <p>[10:42:05] CORE REACTOR ONLINE</p>
                            <p>[10:42:06] PROTOCOLS ACTIVE</p>
                            <p>[10:42:08] USER DETECTED</p>
                            <p className="text-white animate-pulse">[10:42:10] WAITING FOR INPUT_</p>
                        </div>
                    </SidePanel>
                </div>

                {/* Center Column: The Hub */}
                <div className="flex flex-col items-center justify-center">
                    <div className="text-center mb-8 space-y-2">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-widest">
                            WELCOME, <span className="text-cyan text-glow-cyan">USER</span>
                        </h1>
                        <p className="text-cyan/60 font-mono text-sm tracking-widest uppercase">
                            Ready to explore your capabilities?
                        </p>
                    </div>

                    <CentralHub />

                    <div className="mt-12 font-mono text-cyan/50 text-sm animate-pulse">
                        C:/{'>'} ACTIVATING PORTFOLIO PROTOCOLS...
                    </div>
                </div>

                {/* Right Column: Performance Metrics */}
                <div className="hidden lg:flex flex-col gap-8 justify-center h-full">
                    <SidePanel title="Performance Metrics" align="right">
                        <div className="flex items-center justify-center py-4">
                            {/* Circular Progress Placeholder */}
                            <div className="relative w-32 h-32 rounded-full border-4 border-cyan/20 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-cyan/10" />
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="339.292" strokeDashoffset="80" className="text-cyan drop-shadow-[0_0_10px_cyan]" />
                                </svg>
                                <div className="text-center">
                                    <span className="block text-2xl font-bold text-white">98%</span>
                                    <span className="text-xs text-cyan/60">EFFICIENCY</span>
                                </div>
                            </div>
                        </div>
                    </SidePanel>

                    <SidePanel title="Modules" align="right">
                        <div className="grid grid-cols-2 gap-4">
                            {['REACT', 'NEXT.JS', 'GSAP', 'NODE'].map((tech) => (
                                <div key={tech} className="bg-cyan/5 border border-cyan/20 p-2 rounded text-center">
                                    <span className="font-mono text-xs text-cyan font-bold">{tech}</span>
                                </div>
                            ))}
                        </div>
                    </SidePanel>
                </div>
            </div>

            {/* Mobile View Warning (Optional) */}
            <div className="lg:hidden absolute bottom-4 left-0 right-0 text-center text-cyan/40 text-xs font-mono">
                FULL HUD AVAILABLE ON DESKTOP TERMINAL
            </div>
        </div>
    );
}
