'use client';

import React, { useState } from 'react';
import { Radio, Copy, Check, Linkedin, Github, Globe } from 'lucide-react';

export default function ContactInfo() {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8">
            {/* System Status */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-white tracking-widest">System Status</h3>
                    <Radio className="text-cyan animate-pulse" size={20} />
                </div>
                <div className="bg-black/40 border border-cyan/20 rounded p-4">
                    <p className="text-green-400 font-mono text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                        STATUS: ONLINE // AWAITING INCOMING COMMUNIQUES
                    </p>
                </div>
            </div>

            {/* Direct Channels */}
            <div className="space-y-4">
                <h3 className="text-xl font-display font-bold text-white tracking-widest">Direct Channels</h3>

                {/* Copy to Clipboard Button */}
                <button
                    onClick={() => handleCopy('patwaji.devx@gmail.com', 'email')}
                    className="w-full bg-cyan/10 border border-cyan/30 hover:border-cyan hover:bg-cyan/20 transition-all duration-300 rounded p-3 flex items-center justify-between group"
                >
                    <span className="text-cyan font-mono text-sm">COPY TO CLIPBOARD</span>
                    {copied === 'email' ? (
                        <Check className="text-green-400" size={16} />
                    ) : (
                        <Copy className="text-cyan/50 group-hover:text-cyan transition-colors" size={16} />
                    )}
                </button>

                {/* Contact Details */}
                <div className="bg-black/40 border border-cyan/10 rounded p-4 space-y-2 font-mono text-sm">
                    <p className="text-cyan/80">patwaji.devx@gmail.com</p>
                    <p className="text-cyan/80">+91 9630358568</p>
                </div>
            </div>

            {/* Network Links */}
            <div className="space-y-4">
                <h3 className="text-xl font-display font-bold text-white tracking-widest">Network Links</h3>

                <div className="flex gap-4 justify-center">
                    {/* LinkedIn */}
                    <a
                        href="https://www.linkedin.com/in/suryansh-patwa-089153358/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                    >
                        <div className="w-16 h-16 bg-black/40 border-2 border-cyan/30 hover:border-cyan hover:bg-cyan/10 transition-all duration-300 flex items-center justify-center clip-hexagon">
                            <Linkedin className="text-cyan group-hover:scale-110 transition-transform" size={28} />
                        </div>
                    </a>

                    {/* GitHub */}
                    <a
                        href="https://github.com/patwaji"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                    >
                        <div className="w-16 h-16 bg-black/40 border-2 border-cyan/30 hover:border-cyan hover:bg-cyan/10 transition-all duration-300 flex items-center justify-center clip-hexagon">
                            <Github className="text-cyan group-hover:scale-110 transition-transform" size={28} />
                        </div>
                    </a>

                    {/* Portfolio/Website */}
                    <a
                        href="https://drive.google.com/file/d/1T0Ho0hLKCuN-TjcCIdYLz4NLEJZp5sBX/view?usp=drivesdk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                    >
                        <div className="w-16 h-16 bg-black/40 border-2 border-cyan/30 hover:border-cyan hover:bg-cyan/10 transition-all duration-300 flex items-center justify-center clip-hexagon">
                            <Globe className="text-cyan group-hover:scale-110 transition-transform" size={28} />
                        </div>
                    </a>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-black/20 border border-cyan/10 rounded p-3 text-center">
                <p className="text-cyan/40 font-mono text-xs">
                    ENCRYPTED CONNECTION ESTABLISHED
                </p>
            </div>
        </div>
    );
}
