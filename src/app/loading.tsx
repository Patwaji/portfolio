export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 15 }).map((_, i) => (
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

      <div className="text-center z-10">
        {/* Loading Orb */}
        <div className="mb-8">
          <svg 
            width="150" 
            height="150" 
            viewBox="0 0 150 150" 
            className="mx-auto"
          >
            {/* Pulsing Core */}
            <circle 
              cx="75" 
              cy="75" 
              r="25" 
              fill="url(#loadingGradient)"
              className="animate-pulse"
            />
            
            {/* Rotating Rings */}
            <circle 
              cx="75" 
              cy="75" 
              r="45" 
              fill="none" 
              stroke="#00E6FF" 
              strokeWidth="2" 
              strokeDasharray="10,5"
              opacity="0.8"
              className="animate-spin"
            />
            <circle 
              cx="75" 
              cy="75" 
              r="60" 
              fill="none" 
              stroke="#7CFFB2" 
              strokeWidth="1" 
              strokeDasharray="5,10"
              opacity="0.6"
              className="animate-reverse-spin"
            />
            <circle 
              cx="75" 
              cy="75" 
              r="70" 
              fill="none" 
              stroke="#00f3ff" 
              strokeWidth="1" 
              strokeDasharray="2,20"
              opacity="0.4"
              className="animate-spin-slow"
            />

            <defs>
              <radialGradient id="loadingGradient">
                <stop offset="0%" stopColor="#00f3ff" stopOpacity="1" />
                <stop offset="40%" stopColor="#007b8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-headline font-bold text-reactor-core">
            Initializing Arc Reactor
          </h2>
          <p className="text-text-secondary text-sm">
            Calibrating holographic interface...
          </p>
          
          {/* Loading Progress Bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full mx-auto mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-reactor-core to-inner-pulse rounded-full animate-loading-bar"
            />
          </div>
        </div>

        {/* Loading Messages */}
        <div className="mt-8 text-xs text-text-secondary opacity-60">
          <p>Loading quantum matrix...</p>
        </div>
      </div>
    </div>
  );
}
