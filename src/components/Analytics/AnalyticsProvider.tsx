'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics, useAnalytics as useAnalyticsHook } from '@/lib/advanced-analytics';

interface AnalyticsProviderProps {
  children: ReactNode;
  enableTracking?: boolean;
  userId?: string;
}

interface AnalyticsContextType {
  trackEvent: typeof analytics.trackEvent;
  trackPageView: typeof analytics.trackPageView;
  trackFeatureUsage: typeof analytics.trackFeatureUsage;
  trackConversion: typeof analytics.trackConversion;
  trackError: typeof analytics.trackError;
  getAnalyticsData: typeof analytics.getAnalyticsData;
  enableTracking: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ 
  children, 
  enableTracking = true, 
  userId 
}: AnalyticsProviderProps) {
  const analyticsHook = useAnalyticsHook();

  useEffect(() => {
    if (!enableTracking || typeof window === 'undefined') return;
    
    // Track initial page view
    analyticsHook.trackPageView(window.location.pathname, document.title);

    // Set up route change tracking for SPAs
    const handleRouteChange = () => {
      analyticsHook.trackPageView(window.location.pathname, document.title);
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    // Override pushState and replaceState for SPA navigation tracking
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(state, title, url) {
      originalPushState.call(history, state, title, url);
      setTimeout(() => {
        analyticsHook.trackPageView(window.location.pathname, document.title);
      }, 0);
    };

    history.replaceState = function(state, title, url) {
      originalReplaceState.call(history, state, title, url);
      setTimeout(() => {
        analyticsHook.trackPageView(window.location.pathname, document.title);
      }, 0);
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [enableTracking, analyticsHook]);

  const contextValue: AnalyticsContextType = {
    ...analyticsHook,
    enableTracking
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Higher-order component for automatic analytics tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function AnalyticsWrappedComponent(props: P) {
    const { trackFeatureUsage } = useAnalytics();
    
    useEffect(() => {
      if (componentName) {
        trackFeatureUsage(componentName, 'component_mount');
      }
    }, [trackFeatureUsage]);

    return <Component {...props} />;
  };
}

// Hook for tracking component interactions
export function useComponentAnalytics(componentName: string) {
  const { trackFeatureUsage, trackEvent } = useAnalytics();

  const trackInteraction = (action: string, value?: number, metadata?: Record<string, any>) => {
    trackFeatureUsage(componentName, action, value);
    trackEvent(action, 'component', 'interaction', value, {
      component: componentName,
      ...metadata
    });
  };

  const trackEngagement = (action: string, duration?: number) => {
    trackEvent(action, 'component', 'engagement', duration, {
      component: componentName
    });
  };

  const trackError = (error: Error, context?: string) => {
    trackEvent('component_error', 'component', 'error', undefined, {
      component: componentName,
      error: error.message,
      context
    });
  };

  return {
    trackInteraction,
    trackEngagement,
    trackError
  };
}

export default AnalyticsProvider;
