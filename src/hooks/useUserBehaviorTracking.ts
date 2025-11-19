'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UserBehaviorData {
  visitedPanels: string[];
  timeSpent: Record<string, number>;
  interactions: string[];
  preferences: {
    animationSpeed: 'normal' | 'reduced' | 'enhanced';
    theme: 'dark' | 'light' | 'auto';
    language: string;
  };
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    capabilities: string[];
    screenSize: { width: number; height: number };
  };
  sessionData: {
    startTime: Date;
    totalDuration: number;
    pageViews: number;
    bounceRate: number;
  };
}

export interface BehaviorEvent {
  type: 'panel_visit' | 'interaction' | 'preference_change' | 'scroll' | 'hover' | 'click';
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function useUserBehaviorTracking() {
  const [behaviorData, setBehaviorData] = useState<UserBehaviorData>({
    visitedPanels: [],
    timeSpent: {},
    interactions: [],
    preferences: {
      animationSpeed: 'normal',
      theme: 'auto',
      language: 'en'
    },
    deviceInfo: {
      type: 'desktop',
      capabilities: [],
      screenSize: { width: 0, height: 0 }
    },
    sessionData: {
      startTime: new Date(),
      totalDuration: 0,
      pageViews: 1,
      bounceRate: 0
    }
  });

  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const panelStartTimes = useRef<Record<string, number>>({});
  const sessionStartTime = useRef(Date.now());
  const currentPanel = useRef<string>('');
  const interactionCount = useRef(0);

  // Initialize tracking
  useEffect(() => {
    const initializeTracking = () => {
      setBehaviorData(prev => ({
        ...prev,
        deviceInfo: {
          type: detectDeviceType(),
          capabilities: detectCapabilities(),
          screenSize: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        },
        preferences: {
          ...prev.preferences,
          animationSpeed: detectAnimationPreference(),
          theme: detectThemePreference(),
          language: detectLanguagePreference()
        }
      }));
    };

    if (typeof window !== 'undefined') {
      initializeTracking();
    }
  }, []);

  // Track panel visits
  const trackPanelVisit = useCallback((panelId: string) => {
    const now = Date.now();
    const previousPanel = currentPanel.current;

    // Record time spent on previous panel
    if (previousPanel && panelStartTimes.current[previousPanel]) {
      const timeSpent = now - panelStartTimes.current[previousPanel];
      setBehaviorData(prev => ({
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [previousPanel]: (prev.timeSpent[previousPanel] || 0) + timeSpent
        }
      }));
    }

    // Start timing for new panel
    panelStartTimes.current[panelId] = now;
    currentPanel.current = panelId;

    // Add to visited panels
    setBehaviorData(prev => ({
      ...prev,
      visitedPanels: prev.visitedPanels.includes(panelId) 
        ? prev.visitedPanels 
        : [...prev.visitedPanels, panelId]
    }));

    // Record event
    recordEvent({
      type: 'panel_visit',
      target: panelId,
      timestamp: new Date(),
      metadata: { 
        previousPanel,
        sessionTime: now - sessionStartTime.current 
      }
    });
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((type: string, target: string, metadata?: any) => {
    interactionCount.current += 1;
    
    setBehaviorData(prev => ({
      ...prev,
      interactions: [...prev.interactions, `${type}:${target}`]
    }));

    recordEvent({
      type: 'interaction',
      target: `${type}:${target}`,
      timestamp: new Date(),
      metadata: {
        interactionCount: interactionCount.current,
        ...metadata
      }
    });
  }, []);

  // Track preference changes
  const trackPreferenceChange = useCallback((preference: string, value: any) => {
    setBehaviorData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: value
      }
    }));

    recordEvent({
      type: 'preference_change',
      target: preference,
      timestamp: new Date(),
      metadata: { value, previousValue: behaviorData.preferences[preference as keyof typeof behaviorData.preferences] }
    });
  }, [behaviorData.preferences]);

  // Record behavior events
  const recordEvent = useCallback((event: BehaviorEvent) => {
    setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
  }, []);

  // Update session data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const duration = now - sessionStartTime.current;
      
      setBehaviorData(prev => ({
        ...prev,
        sessionData: {
          ...prev.sessionData,
          totalDuration: duration,
          bounceRate: prev.visitedPanels.length <= 1 ? 1 : 0
        }
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Track scroll behavior
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        recordEvent({
          type: 'scroll',
          target: 'page',
          timestamp: new Date(),
          metadata: {
            scrollY: window.scrollY,
            scrollPercent: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
          }
        });
      }, 250);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }
  }, [recordEvent]);

  // Track resize events
  useEffect(() => {
    const handleResize = () => {
      setBehaviorData(prev => ({
        ...prev,
        deviceInfo: {
          ...prev.deviceInfo,
          type: detectDeviceType(),
          screenSize: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize, { passive: true });
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Generate behavior insights
  const getBehaviorInsights = useCallback(() => {
    const insights = [];
    
    // Engagement insights
    const avgTimePerPanel = Object.values(behaviorData.timeSpent).reduce((a, b) => a + b, 0) / 
                            Math.max(behaviorData.visitedPanels.length, 1);
    
    if (avgTimePerPanel > 30000) {
      insights.push({
        type: 'high_engagement',
        message: 'User shows high engagement with average 30+ seconds per panel'
      });
    }

    // Navigation insights
    if (behaviorData.visitedPanels.length >= 4) {
      insights.push({
        type: 'thorough_exploration',
        message: 'User is thoroughly exploring the portfolio content'
      });
    }

    // Device insights
    if (behaviorData.deviceInfo.type === 'mobile' && behaviorData.interactions.some(i => i.includes('swipe'))) {
      insights.push({
        type: 'mobile_native',
        message: 'User is effectively using mobile gestures'
      });
    }

    // Accessibility insights
    if (behaviorData.preferences.animationSpeed === 'reduced') {
      insights.push({
        type: 'accessibility_conscious',
        message: 'User prefers reduced animations for accessibility'
      });
    }

    return insights;
  }, [behaviorData]);

  // Export data for AI analysis
  const getDataForAI = useCallback(() => {
    return {
      ...behaviorData,
      events: events.slice(-20), // Last 20 events
      insights: getBehaviorInsights(),
      score: calculateEngagementScore()
    };
  }, [behaviorData, events, getBehaviorInsights]);

  // Calculate engagement score
  const calculateEngagementScore = useCallback(() => {
    const panelVisits = behaviorData.visitedPanels.length;
    const avgTime = Object.values(behaviorData.timeSpent).reduce((a, b) => a + b, 0) / Math.max(panelVisits, 1);
    const interactionRate = behaviorData.interactions.length / Math.max(panelVisits, 1);
    
    // Normalize scores (0-100)
    const panelScore = Math.min((panelVisits / 5) * 40, 40); // Max 40 for visiting all panels
    const timeScore = Math.min((avgTime / 60000) * 30, 30); // Max 30 for 1+ minute average
    const interactionScore = Math.min(interactionRate * 30, 30); // Max 30 for high interaction

    return Math.round(panelScore + timeScore + interactionScore);
  }, [behaviorData]);

  return {
    behaviorData,
    events,
    trackPanelVisit,
    trackInteraction,
    trackPreferenceChange,
    recordEvent,
    getBehaviorInsights,
    getDataForAI,
    engagementScore: calculateEngagementScore()
  };
}

// Helper functions
function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

function detectCapabilities(): string[] {
  if (typeof window === 'undefined') return [];
  
  const capabilities = [];
  
  if ('ontouchstart' in window) capabilities.push('touch');
  if (window.DeviceOrientationEvent) capabilities.push('orientation');
  if ('vibrate' in navigator) capabilities.push('haptic');
  if ('speechSynthesis' in window) capabilities.push('speech');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) capabilities.push('reduced-motion');
  if (matchMedia('(prefers-color-scheme: dark)').matches) capabilities.push('dark-mode');
  if (matchMedia('(prefers-contrast: high)').matches) capabilities.push('high-contrast');
  
  return capabilities;
}

function detectAnimationPreference(): 'normal' | 'reduced' | 'enhanced' {
  if (typeof window === 'undefined') return 'normal';
  
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced';
  if (matchMedia('(prefers-reduced-motion: no-preference)').matches) return 'enhanced';
  return 'normal';
}

function detectThemePreference(): 'dark' | 'light' | 'auto' {
  if (typeof window === 'undefined') return 'auto';
  
  if (matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'auto';
}

function detectLanguagePreference(): string {
  if (typeof window === 'undefined') return 'en';
  return navigator.language?.split('-')[0] || 'en';
}
