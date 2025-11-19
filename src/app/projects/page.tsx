'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SidePanel from '@/components/JarvisDashboard/SidePanel';
import ProjectList, { Project } from '@/components/JarvisDashboard/ProjectList';
import ProjectDetail from '@/components/JarvisDashboard/ProjectDetail';

const PROJECTS: Project[] = [
    {
        id: 'PRJ-001',
        title: 'DOCULINGUA',
        category: 'Mobile',
        status: 'Active',
        version: 'v1.0',
        description: 'DocuLingua is a React Native cross-platform app with a Node.js, Express, and MongoDB backend that enables users to translate documents. Currently in development, it features a clean UI using React Paper.',
        specs: ['React Native', 'Node.js', 'Express', 'MongoDB', 'Google OAuth', 'React Paper'],
        demoLink: 'https://drive.google.com/drive/folders/1pIE8GczcQsXykKmlXdVCjrTBN6kM-KGL?usp=drive_link',
        githubLink: 'https://github.com/honeypathkar/DocuLingua'
    },
    {
        id: 'PRJ-002',
        title: 'NUTRIPLAN AI',
        category: 'AI',
        status: 'Active',
        version: 'v1.0',
        description: 'An AI-powered tool designed to help hostel students and working professionals generate personalized, budget-friendly, and nutritious meal plans. Built to simplify food choices and make it easy for users to prepare healthy meals that balance health, cost, and convenience.',
        specs: ['AI Integration', 'Mistral-7B API', 'TypeScript', 'Secure Login/Signup', 'Frontend', 'Backend APIs'],
        demoLink: 'https://nutriplan-ai.vercel.app/',
        githubLink: 'https://github.com/Patwaji/HackIndia-Spark-4-2025-Crypto-Crafter'
    },
    {
        id: 'PRJ-003',
        title: 'WHATS COOKING',
        category: 'Web',
        status: 'Active',
        version: 'v1.0',
        description: 'Built a Next.js recipe app that generates meals based on available ingredients. Used TypeScript, clean component structure, and server-side logic to create an interactive, user-friendly cooking helper. The app allowed users to quickly generate meal ideas from pantry ingredients, reducing decision fatigue when cooking.',
        specs: ['Next.js', 'TypeScript', 'Server-side Logic', 'Clean Components'],
        demoLink: 'https://whats-cooking-app.vercel.app/',
        githubLink: 'https://github.com/Patwaji/whats-cooking-app'
    }
];

export default function ProjectsPage() {
    const [selectedId, setSelectedId] = useState<string>(PROJECTS[0].id);

    const selectedProject = PROJECTS.find(p => p.id === selectedId) || PROJECTS[0];

    return (
        <main className="min-h-screen bg-bg text-text-primary p-4 md:p-8 overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
            <div className="fixed inset-0 bg-void-gradient opacity-80 pointer-events-none" />

            {/* Header / Back Button */}
            <div className="relative z-10 mb-6 flex items-center gap-4 shrink-0">
                <Link href="/" className="flex items-center gap-2 text-cyan hover:text-white transition-colors group">
                    <div className="p-2 border border-cyan/30 rounded-full group-hover:bg-cyan/20">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-mono text-sm tracking-widest">RETURN TO DASHBOARD</span>
                </Link>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan/50 to-transparent" />
            </div>

            {/* Main Content - Master Detail Layout */}
            <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 max-w-[1800px] mx-auto w-full">

                {/* Left Panel: Project List (1/3 width on large screens) */}
                <div className="lg:col-span-4 h-full min-h-[400px]">
                    <SidePanel title="PROJECT DATABASE" className="h-full">
                        <ProjectList
                            projects={PROJECTS}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
                    </SidePanel>
                </div>

                {/* Right Panel: Project Details (2/3 width on large screens) */}
                <div className="lg:col-span-8 h-full min-h-[600px]">
                    <SidePanel title="FOCUSED DATA STREAM" align="right" className="h-full">
                        <ProjectDetail project={selectedProject} />
                    </SidePanel>
                </div>

            </div>
        </main>
    );
}
