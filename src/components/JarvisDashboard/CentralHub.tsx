'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import HexNode from './HexNode';
import { FolderKanban, User, Cpu, Mail } from 'lucide-react';

// Import assets
import orbCore from '@/assets/images/orb-core.svg';
import orbRings from '@/assets/images/orb-rings.svg';
import orbHalo from '@/assets/images/orb-halo.svg';
import photo from '@/assets/images/photo.jpg';

export default function CentralHub() {
    const hubRef = useRef<HTMLDivElement>(null);
    const ringsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Continuous Ring Rotation
            gsap.to(ringsRef.current, {
                rotation: 360,
                duration: 30,
                repeat: -1,
                ease: 'linear',
            });

            // Entrance Animation
            gsap.from(hubRef.current, {
                scale: 0.5,
                opacity: 0,
                duration: 1.5,
                ease: 'back.out(1.7)',
            });
        }, hubRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={hubRef} className="relative w-[600px] h-[600px] flex items-center justify-center">
            {/* Central Orb Structure */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Halo/Glow */}
                <div className="absolute w-[500px] h-[500px] animate-pulse-slow opacity-50">
                    <Image src={orbHalo} alt="Orb Halo" fill className="object-contain" />
                </div>

                {/* Rotating Rings */}
                <div ref={ringsRef} className="absolute w-[400px] h-[400px]">
                    <Image src={orbRings} alt="Orb Rings" fill className="object-contain" />
                </div>

                {/* Core */}
                <div className="absolute w-[200px] h-[200px] z-10">
                    <Image src={orbCore} alt="Orb Core" fill className="object-contain drop-shadow-[0_0_30px_rgba(0,243,255,0.6)]" />
                </div>

                {/* User Avatar */}
                <div className="absolute w-[140px] h-[140px] rounded-full overflow-hidden border-2 border-cyan/50 z-20 bg-black/50 backdrop-blur-sm">
                    <Image 
                        src={photo} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Navigation Nodes - Positioned around the center */}
            {/* Top Left - Projects */}
            <div className="absolute top-[20%] left-[15%]">
                <Link href="/projects">
                    <HexNode label="Projects" icon={FolderKanban} delay={100} />
                </Link>
            </div>

            {/* Top Right - About Me */}
            <div className="absolute top-[20%] right-[15%]">
                <Link href="/about">
                    <HexNode label="About Me" icon={User} delay={200} />
                </Link>
            </div>

            {/* Bottom Left - Skills */}
            <div className="absolute bottom-[20%] left-[15%]">
                <Link href="/skills">
                    <HexNode label="Skills" icon={Cpu} delay={300} />
                </Link>
            </div>

            {/* Bottom Right - Contact */}
            <div className="absolute bottom-[20%] right-[15%]">
                <Link href="/contact">
                    <HexNode label="Contact" icon={Mail} delay={400} />
                </Link>
            </div>

            {/* Connecting Lines (SVG Overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.3 }}>
                {/* Lines connecting nodes to center - approximate coordinates */}
                <path d="M200 200 L250 250" stroke="cyan" strokeWidth="1" fill="none" /> {/* TL */}
                <path d="M400 200 L350 250" stroke="cyan" strokeWidth="1" fill="none" /> {/* TR */}
                <path d="M200 400 L250 350" stroke="cyan" strokeWidth="1" fill="none" /> {/* BL */}
                <path d="M400 400 L350 350" stroke="cyan" strokeWidth="1" fill="none" /> {/* BR */}
            </svg>
        </div>
    );
}
