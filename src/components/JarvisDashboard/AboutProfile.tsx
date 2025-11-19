'use client';

import React from 'react';
import Image from 'next/image';
import { User, Activity } from 'lucide-react';
import photo from '@/assets/images/photo.jpg';

export default function AboutProfile() {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
            {/* Circular Profile Frame */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8 group">
                {/* Rotating Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan/30 border-t-cyan border-l-transparent animate-spin-slow" />
                <div className="absolute inset-2 rounded-full border border-cyan/20 border-b-cyan border-r-transparent animate-reverse-spin" />

                {/* Image Container */}
                <div className="absolute inset-4 rounded-full overflow-hidden border-2 border-cyan/50 bg-black/50 backdrop-blur-sm">
                    {/* Placeholder for User Image */}
                    <Image 
                        src={photo} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Status Indicator */}
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-black rounded-full border border-cyan flex items-center justify-center z-10">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                </div>
            </div>

            {/* Text Info */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-widest">
                    SURYANSH <span className="text-cyan">PATWA</span>
                </h2>
                <p className="text-cyan/60 font-mono text-sm tracking-widest uppercase border-b border-cyan/20 pb-4 inline-block">
                    ROLE: FULL STACK DEVELOPER & AI ENTHUSIAST
                </p>

                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    STATUS: ONLINE // SEEKING COLLABORATION
                </div>
            </div>

            {/* Mini Activity Log */}
            <div className="mt-8 w-full max-w-md bg-black/40 border border-cyan/10 rounded p-4 font-mono text-xs text-cyan/60 space-y-1">
                <div className="flex items-center gap-2 text-cyan mb-2 border-b border-cyan/20 pb-1">
                    <Activity size={12} />
                    <span>RECENT ACTIVITY</span>
                </div>
                <p>[10:42] DEPLOYED NEW PROTOCOL</p>
                <p>[09:15] SYSTEM OPTIMIZATION COMPLETE</p>
                <p>[08:30] INITIALIZED NEURAL LINK</p>
            </div>
        </div>
    );
}
