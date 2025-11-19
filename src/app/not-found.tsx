'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { getPageMetadata } from '@/lib/seo';

export const metadata: Metadata = getPageMetadata({
  title: 'Page Not Found | Arc Reactor',
  description: 'The holographic panel you\'re looking for doesn\'t exist in this dimension.',
});

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-reactor-core rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-lg mx-auto p-6 z-10">
        {/* Broken Orb Visual */}
        <div className="mb-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="mx-auto opacity-60"
          >
            {/* Broken Core */}
            <circle
              cx="60"
              cy="60"
              r="20"
              fill="url(#errorGradient)"
              className="animate-pulse"
            />

            {/* Broken Rings */}
            <circle
              cx="60"
              cy="60"
              r="36"
              fill="none"
              stroke="#00E6FF"
              strokeWidth="2"
              strokeDasharray="5,10"
              opacity="0.4"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#7CFFB2"
              strokeWidth="1"
              strokeDasharray="3,15"
              opacity="0.3"
            />

            <defs>
              <radialGradient id="errorGradient">
                <stop offset="0%" stopColor="#ff6b6b" stopOpacity="1" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-headline font-bold text-reactor-core mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-white mb-4">
            Holographic Panel Not Found
          </h2>
          <p className="text-text-secondary mb-8">
            The holographic panel you&apos;re trying to access doesn&apos;t exist in this dimension of the Arc Reactor interface.
            It may have been deactivated or moved to a different quantum state.
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block glass-panel px-8 py-3 text-reactor-core font-semibold hover:bg-reactor-core/10 transition-all duration-300 transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            >
              Return to Arc Reactor
            </Link>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 text-text-secondary hover:text-white transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Error Code */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-text-secondary opacity-60">
              Error Code: HOLOGRAM_404_DIMENSIONAL_MISMATCH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
