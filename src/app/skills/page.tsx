'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cpu } from 'lucide-react';
import SkillCategory from '@/components/JarvisDashboard/SkillCategory';

export default function SkillsPage() {
    const skillsData = {
        languages: ['C++', 'C', 'JavaScript', 'Python'],
        frameworks: ['React', 'Next.js', 'Node.js', 'Express.js', 'Tailwind', 'Bootstrap'],
        tools: ['MongoDB', 'MySQL', 'Git', 'GitHub', 'Shadcn', 'Numpy', 'Pandas'],
        certifications: ['The Complete Full-Stack Web Development Bootcamp - By Angela Yu']
    };

    return (
        <main className="min-h-screen bg-bg text-text-primary p-4 md:p-8 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="fixed inset-0 bg-void-gradient opacity-80 pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header / Back Button */}
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-cyan hover:text-white transition-colors group">
                        <div className="p-2 border border-cyan/30 rounded-full group-hover:bg-cyan/20">
                            <ArrowLeft size={20} />
                        </div>
                        <span className="font-mono text-sm tracking-widest">RETURN TO DASHBOARD</span>
                    </Link>
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan/50 to-transparent" />
                </div>

                {/* Page Title */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-widest mb-2">
                        COMPETENCY DATABASE // <span className="text-cyan">EVOLVING SKILLSET</span>
                    </h1>
                    <div className="h-px max-w-md mx-auto bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
                </div>

                {/* Skills Categories */}
                <div className="space-y-4 mb-8">
                    <SkillCategory
                        title="PROGRAMMING LANGUAGES"
                        skills={skillsData.languages}
                        defaultOpen={true}
                    />

                    <SkillCategory
                        title="FRAMEWORKS & LIBRARIES"
                        skills={skillsData.frameworks}
                    />

                    <SkillCategory
                        title="TOOLS & PLATFORMS"
                        skills={skillsData.tools}
                    />

                    

                    <SkillCategory
                        title="CERTIFICATIONS"
                        skills={skillsData.certifications}
                    />
                </div>

                {/* Upgrade Protocol CTA */}
                <div className="border border-cyan/30 rounded-lg p-6 bg-gradient-to-br from-cyan/5 to-transparent backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <Cpu className="text-cyan animate-pulse" size={24} />
                        <h3 className="text-xl font-display font-bold text-cyan tracking-widest">
                            UPGRADE PROTOCOL // NEW SKILL LOG
                        </h3>
                    </div>
                    <p className="text-cyan/60 font-mono text-sm">
                        Continuous learning and skill acquisition in progress. System capabilities expanding...
                    </p>
                </div>

                {/* Footer Status */}
                <div className="mt-8 text-center font-mono text-xs text-cyan/40 animate-pulse">
                    C:/{'>'} ANALYZING SYSTEM CAPABILITIES...
                </div>
            </div>
        </main>
    );
}
