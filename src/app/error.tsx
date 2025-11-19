'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/components/Analytics/Analytics';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global error:', error);
    
    // Track error in analytics
    trackEvent('error', 'global_error', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-400 rounded-full animate-pulse"
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
        {/* Critical Error Visual */}
        <div className="mb-8">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120" 
            className="mx-auto"
          >
            {/* Critical Error Core */}
            <circle 
              cx="60" 
              cy="60" 
              r="20" 
              fill="url(#criticalGradient)"
              className="animate-pulse"
            />
            
            {/* Warning Symbol */}
            <text 
              x="60" 
              y="68" 
              textAnchor="middle" 
              className="fill-white text-2xl font-bold"
            >
              ⚠
            </text>
            
            {/* Damaged Rings */}
            <circle 
              cx="60" 
              cy="60" 
              r="36" 
              fill="none" 
              stroke="#ff4444" 
              strokeWidth="2" 
              strokeDasharray="2,8"
              opacity="0.6"
              className="animate-spin-slow"
            />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke="#ff6b6b" 
              strokeWidth="1" 
              strokeDasharray="1,12"
              opacity="0.4"
              className="animate-reverse-spin"
            />

            <defs>
              <radialGradient id="criticalGradient">
                <stop offset="0%" stopColor="#ff4444" stopOpacity="1" />
                <stop offset="50%" stopColor="#ff6b6b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-headline font-bold text-red-400 mb-2">
            Critical System Error
          </h1>
          <h2 className="text-lg font-semibold text-white mb-4">
            Arc Reactor Core Malfunction
          </h2>
          <p className="text-text-secondary mb-8">
            A critical error has occurred in the Arc Reactor&apos;s quantum processing matrix. 
            The holographic interface has encountered an unexpected anomaly and needs to be reinitialized.
          </p>

          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full glass-panel px-8 py-3 text-red-400 font-semibold hover:bg-red-400/10 transition-all duration-300 transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
            >
              Reinitialize Arc Reactor
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-2 text-text-secondary hover:text-white transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            >
              Emergency Evacuation to Home Base
            </button>
          </div>

          {/* Error Details for Development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="text-sm text-text-secondary cursor-pointer mb-2">
                System Diagnostics
              </summary>
              <div className="bg-black/40 p-4 rounded text-xs">
                <p className="text-red-400 mb-2">Error: {error.message}</p>
                {error.digest && (
                  <p className="text-yellow-400 mb-2">Digest: {error.digest}</p>
                )}
                <pre className="text-gray-300 overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </div>
            </details>
          )}

          {/* Error Code */}
          <div className="mt-8 pt-8 border-t border-red-400/20">
            <p className="text-xs text-text-secondary opacity-60">
              Error Code: ARC_REACTOR_CRITICAL_500_{error.digest?.slice(0, 8) || 'UNKNOWN'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
