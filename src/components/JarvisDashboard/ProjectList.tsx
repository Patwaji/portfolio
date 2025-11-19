'use client';

import React, { useState } from 'react';
import { Search, Folder, Lock, Globe, Smartphone } from 'lucide-react';

export interface Project {
    id: string;
    title: string;
    category: 'Web' | 'Mobile' | 'AI' | 'Security';
    status: 'Active' | 'Archived';
    version: string;
    description: string;
    specs: string[];
    metrics?: { label: string; value: number }[];
    demoLink?: string;
    githubLink?: string;
}

interface ProjectListProps {
    projects: Project[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export default function ProjectList({ projects, selectedId, onSelect }: ProjectListProps) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | 'Web' | 'Mobile' | 'AI'>('All');

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || p.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6 space-y-4">
                <h2 className="text-xl font-display font-bold text-white tracking-widest">PROJECT MANIFEST</h2>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan/50" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH PROJECTS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-cyan/30 rounded px-10 py-2 text-sm text-cyan placeholder-cyan/30 focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(100,210,255,0.2)] transition-all"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Web', 'Mobile', 'AI'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat as any)}
                            className={`px-3 py-1 text-xs font-mono border rounded transition-all ${filter === cat
                                    ? 'bg-cyan/20 border-cyan text-white shadow-[0_0_10px_rgba(100,210,255,0.2)]'
                                    : 'border-cyan/20 text-cyan/50 hover:border-cyan/50 hover:text-cyan'
                                }`}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {filteredProjects.map((project) => (
                    <button
                        key={project.id}
                        onClick={() => onSelect(project.id)}
                        className={`w-full text-left p-3 rounded border transition-all group relative overflow-hidden ${selectedId === project.id
                                ? 'bg-cyan/10 border-cyan text-white'
                                : 'bg-transparent border-cyan/10 text-cyan/60 hover:bg-cyan/5 hover:border-cyan/30'
                            }`}
                    >
                        {/* Active Indicator */}
                        {selectedId === project.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan shadow-[0_0_10px_cyan]" />
                        )}

                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                {project.category === 'Security' ? <Lock size={14} /> :
                                    project.category === 'Mobile' ? <Smartphone size={14} /> :
                                        project.category === 'Web' ? <Globe size={14} /> : <Folder size={14} />}
                                <span className="font-bold text-sm truncate">{project.title}</span>
                            </div>
                            <span className="text-[10px] font-mono opacity-50">{project.version}</span>
                        </div>
                        <div className="text-[10px] font-mono opacity-50 pl-6">
                            ID: {project.id.substring(0, 8).toUpperCase()}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
