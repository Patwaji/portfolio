'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SidePanel from '@/components/JarvisDashboard/SidePanel';
import ContactForm from '@/components/JarvisDashboard/ContactForm';
import ContactInfo from '@/components/JarvisDashboard/ContactInfo';

export default function ContactPage() {
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

            {/* Page Title */}
            <div className="relative z-10 mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-widest mb-2">
                    SECURE COMMS CHANNEL // <span className="text-cyan">INITIATING TRANSMISSION</span>
                </h1>
                <div className="h-px max-w-md mx-auto bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1400px] mx-auto w-full">

                {/* Left Panel: Contact Form */}
                <div className="h-full">
                    <SidePanel title="TRANSMISSION FORM" className="h-full">
                        <ContactForm />
                    </SidePanel>
                </div>

                {/* Right Panel: Contact Info */}
                <div className="h-full">
                    <SidePanel title="COMMUNICATION PROTOCOLS" align="right" className="h-full">
                        <ContactInfo />
                    </SidePanel>
                </div>

            </div>
        </main>
    );
}
