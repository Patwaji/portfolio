'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SidePanel from '@/components/JarvisDashboard/SidePanel';
import AboutProfile from '@/components/JarvisDashboard/AboutProfile';
import SkillsRadar from '@/components/JarvisDashboard/SkillsRadar';
import TechTimeline from '@/components/JarvisDashboard/TechTimeline';

export default function AboutPage() {
    const experienceData = [
        { title: 'Part Time Full Stack Developer @ Cosmos Swift', subtitle: 'Full Stack Development', date: 'July 2025 - November 2025' },
    ];

    const educationData = [
        { title: 'B.Tech (Hons) in Computer Science with Specialization in Data Science', subtitle: 'CSVTU, Bhilai', date: '2024-2028' },
    ];

    return (
        <main className="min-h-screen bg-bg text-text-primary p-4 md:p-8 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="fixed inset-0 bg-void-gradient opacity-80 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header / Back Button */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-cyan hover:text-white transition-colors group">
                        <div className="p-2 border border-cyan/30 rounded-full group-hover:bg-cyan/20">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-mono text-sm tracking-widest">RETURN TO DASHBOARD</span>
                    </Link>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan/50 to-transparent" />
                    <h1 className="text-2xl font-display font-bold text-white tracking-widest uppercase">
                        BIOGRAPHICAL DATA // <span className="text-cyan">USER PROFILE ACCESS</span>
                    </h1>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Top Left: Profile */}
                    <SidePanel title="USER PROFILE" className="w-full max-w-none h-full">
                        <AboutProfile />
                    </SidePanel>

                    {/* Top Right: Skills Matrix */}
                    <SidePanel title="SKILLS MATRIX" align="right" className="w-full max-w-none h-full">
                        <SkillsRadar />
                    </SidePanel>

                    {/* Bottom Left: Experience */}
                    <SidePanel title="EXPERIENCE LOG" className="w-full max-w-none">
                        <TechTimeline items={experienceData} />
                    </SidePanel>

                    {/* Bottom Right: Education */}
                    <SidePanel title="EDUCATION LOG" align="right" className="w-full max-w-none">
                        <TechTimeline items={educationData} />
                    </SidePanel>
                </div>

                {/* Footer Status */}
                <div className="mt-8 text-center font-mono text-xs text-cyan/40 animate-pulse">
                    C:/{'>'} DISPLAYING PORTFOLIO PROTOCOLS... COMPLETE.
                </div>
            </div>
        </main>
    );
}
