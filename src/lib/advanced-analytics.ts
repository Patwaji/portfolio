// Advanced Analytics System for Arc Reactor Portfolio
// Tracks user behavior, performance metrics, and engagement insights

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'interaction' | 'engagement' | 'performance' | 'error' | 'conversion';
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface UserBehavior {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  pageViews: number;
  interactions: number;
  engagementScore: number;
  timeOnSite: number;
  bounceRate: number;
  conversionEvents: string[];
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    viewport: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  };
  location?: {
    country?: string;
    city?: string;
    timezone: string;
  };
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface PerformanceMetrics {
  timestamp: number;
  page: string;
  metrics: {
    // Core Web Vitals
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
    
    // Custom Portfolio Metrics
    componentLoadTime?: number;
    imageLoadTime?: number;
    apiResponseTime?: number;
    animationPerformance?: number;
    memoryUsage?: number;
    
    // User Experience Metrics
    scrollDepth?: number;
    timeToInteraction?: number;
    featureUsage?: Record<string, number>;
  };
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
  userBehavior: UserBehavior[];
  performance: PerformanceMetrics[];
  summary: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    averageSessionDuration: number;
    averageEngagementScore: number;
    conversionRate: number;
    topPages: Array<{ page: string; views: number; avgTime: number }>;
    topFeatures: Array<{ feature: string; usage: number; engagement: number }>;
    performanceScore: number;
  };
}

class AdvancedAnalytics {
  private events: AnalyticsEvent[] = [];
  private currentSession: UserBehavior | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private isInitialized: boolean = false;
  private analyticsQueue: AnalyticsEvent[] = [];

  constructor() {
    this.initializeSession();
    this.setupPerformanceMonitoring();
    this.setupEventListeners();
    this.loadStoredData();
  }

  private initializeSession(): void {
    const sessionId = this.generateSessionId();
    const deviceInfo = this.getDeviceInfo();
    const location = this.getLocationInfo();
    
    this.currentSession = {
      sessionId,
      startTime: this.sessionStartTime,
      pageViews: 0,
      interactions: 0,
      engagementScore: 0,
      timeOnSite: 0,
      bounceRate: 0,
      conversionEvents: [],
      deviceInfo,
      location,
      referrer: document.referrer,
      utm: this.getUTMParams()
    };

    this.isInitialized = true;
    this.trackEvent('session_start', 'user', 'engagement');
  }

  private setupPerformanceMonitoring(): void {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceEventTiming[];
          const lastEntry = entries[entries.length - 1];
          this.trackPerformance('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceEventTiming[];
          entries.forEach(entry => {
            this.trackPerformance('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries() as PerformanceEventTiming[];
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          this.trackPerformance('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        this.performanceObserver = lcpObserver;
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance('fcp', navigation.responseStart - navigation.fetchStart);
          this.trackPerformance('ttfb', navigation.responseStart - navigation.requestStart);
        }
      }, 0);
    });
  }

  private setupEventListeners(): void {
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_blur', 'engagement', 'engagement');
        this.updateSessionData();
      } else {
        this.trackEvent('page_focus', 'engagement', 'engagement');
        this.lastActivityTime = Date.now();
      }
    });

    // Scroll tracking
    let scrollDepth = 0;
    const handleScroll = this.throttle(() => {
      const depth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
      if (depth > scrollDepth) {
        scrollDepth = depth;
        this.trackPerformance('scrollDepth', depth);
        
        // Track engagement milestones
        if (depth >= 25 && depth < 50) this.trackEvent('scroll_25', 'engagement', 'engagement', 25);
        else if (depth >= 50 && depth < 75) this.trackEvent('scroll_50', 'engagement', 'engagement', 50);
        else if (depth >= 75 && depth < 100) this.trackEvent('scroll_75', 'engagement', 'engagement', 75);
        else if (depth >= 100) this.trackEvent('scroll_100', 'engagement', 'engagement', 100);
      }
    }, 500);
    
    window.addEventListener('scroll', handleScroll);

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const elementInfo = this.getElementInfo(target);
      
      this.trackEvent('click', 'interaction', 'interaction', undefined, {
        element: elementInfo,
        coordinates: { x: event.clientX, y: event.clientY }
      });
      
      this.lastActivityTime = Date.now();
      this.updateEngagementScore('click');
    });

    // Form interactions
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const inputTarget = target as HTMLInputElement;
        this.trackEvent('form_focus', 'interaction', 'interaction', undefined, {
          fieldName: inputTarget.name || inputTarget.id
        });
      }
    }, true);

    // Before unload - save session data
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Periodic session updates
    setInterval(() => {
      this.updateSessionData();
      this.saveDataToStorage();
    }, 10000); // Every 10 seconds
  }

  public trackEvent(
    action: string,
    category: string,
    type: AnalyticsEvent['type'] = 'interaction',
    value?: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.isInitialized) {
      this.analyticsQueue.push({
        id: this.generateEventId(),
        type,
        category,
        action,
        value,
        timestamp: Date.now(),
        sessionId: this.currentSession?.sessionId || 'unknown',
        metadata
      });
      return;
    }

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      category,
      action,
      value,
      timestamp: Date.now(),
      sessionId: this.currentSession!.sessionId,
      metadata
    };

    this.events.push(event);
    this.updateSessionStats(event);
    this.lastActivityTime = Date.now();

    // Process queued events
    while (this.analyticsQueue.length > 0) {
      const queuedEvent = this.analyticsQueue.shift()!;
      queuedEvent.sessionId = this.currentSession!.sessionId;
      this.events.push(queuedEvent);
    }

    // Send to external analytics if configured
    this.sendToExternalAnalytics(event);
  }

  public trackPageView(page: string, title?: string): void {
    this.trackEvent('page_view', 'navigation', 'page_view', undefined, {
      page,
      title: title || document.title,
      url: window.location.href
    });

    if (this.currentSession) {
      this.currentSession.pageViews++;
    }
  }

  public trackFeatureUsage(feature: string, action: string, value?: number): void {
    this.trackEvent(action, 'feature', 'engagement', value, {
      feature,
      timestamp: Date.now()
    });

    this.updateEngagementScore('feature_usage');
  }

  public trackConversion(conversionType: string, value?: number): void {
    this.trackEvent(conversionType, 'conversion', 'conversion', value);
    
    if (this.currentSession) {
      this.currentSession.conversionEvents.push(conversionType);
    }

    this.updateEngagementScore('conversion', 5); // High engagement weight
  }

  public trackError(error: Error, context?: string): void {
    this.trackEvent('error', 'error', 'error', undefined, {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href
    });
  }

  private trackPerformance(metric: string, value: number): void {
    this.trackEvent(`performance_${metric}`, 'performance', 'performance', value, {
      page: window.location.pathname,
      timestamp: Date.now()
    });
  }

  private updateSessionStats(event: AnalyticsEvent): void {
    if (!this.currentSession) return;

    if (event.type === 'interaction') {
      this.currentSession.interactions++;
    }

    this.updateEngagementScore(event.action);
  }

  private updateEngagementScore(action: string, weight: number = 1): void {
    if (!this.currentSession) return;

    const weights: Record<string, number> = {
      'click': 1,
      'scroll_25': 1,
      'scroll_50': 2,
      'scroll_75': 3,
      'scroll_100': 4,
      'form_focus': 2,
      'feature_usage': 3,
      'conversion': 5,
      'page_view': 1
    };

    const engagementWeight = weights[action] || weight;
    this.currentSession.engagementScore += engagementWeight;
  }

  private updateSessionData(): void {
    if (!this.currentSession) return;

    const currentTime = Date.now();
    this.currentSession.timeOnSite = currentTime - this.currentSession.startTime;
    
    // Calculate bounce rate (single page view with < 30 seconds)
    if (this.currentSession.pageViews <= 1 && this.currentSession.timeOnSite < 30000) {
      this.currentSession.bounceRate = 1;
    } else {
      this.currentSession.bounceRate = 0;
    }
  }

  private endSession(): void {
    if (!this.currentSession) return;

    this.updateSessionData();
    this.currentSession.endTime = Date.now();
    
    this.trackEvent('session_end', 'user', 'engagement', this.currentSession.timeOnSite);
    this.saveDataToStorage();
  }

  public getAnalyticsData(): AnalyticsData {
    const storedData = this.loadStoredData();
    const allEvents = [...storedData.events, ...this.events];
    const allSessions = [...storedData.userBehavior, ...(this.currentSession ? [this.currentSession] : [])];

    return {
      events: allEvents,
      userBehavior: allSessions,
      performance: storedData.performance,
      summary: this.calculateSummary(allEvents, allSessions)
    };
  }

  private calculateSummary(events: AnalyticsEvent[], sessions: UserBehavior[]) {
    const totalSessions = sessions.length;
    const totalUsers = new Set(sessions.map(s => s.userId).filter(Boolean)).size || totalSessions;
    const pageViews = events.filter(e => e.action === 'page_view');
    const totalPageViews = pageViews.length;
    
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.timeOnSite || 0), 0) / totalSessions || 0;
    const avgEngagementScore = sessions.reduce((sum, s) => sum + s.engagementScore, 0) / totalSessions || 0;
    
    const conversions = events.filter(e => e.type === 'conversion');
    const conversionRate = totalSessions > 0 ? (conversions.length / totalSessions) * 100 : 0;

    // Top pages analysis
    const pageViewCounts: Record<string, { views: number; totalTime: number }> = {};
    pageViews.forEach(event => {
      const page = event.metadata?.page || 'unknown';
      if (!pageViewCounts[page]) {
        pageViewCounts[page] = { views: 0, totalTime: 0 };
      }
      pageViewCounts[page].views++;
    });

    const topPages = Object.entries(pageViewCounts)
      .map(([page, data]) => ({
        page,
        views: data.views,
        avgTime: data.totalTime / data.views || 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Feature usage analysis
    const featureUsage: Record<string, { usage: number; engagement: number }> = {};
    events
      .filter(e => e.category === 'feature')
      .forEach(event => {
        const feature = event.metadata?.feature || event.action;
        if (!featureUsage[feature]) {
          featureUsage[feature] = { usage: 0, engagement: 0 };
        }
        featureUsage[feature].usage++;
        featureUsage[feature].engagement += event.value || 1;
      });

    const topFeatures = Object.entries(featureUsage)
      .map(([feature, data]) => ({
        feature,
        usage: data.usage,
        engagement: data.engagement
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);

    // Performance score calculation
    const performanceEvents = events.filter(e => e.category === 'performance');
    const performanceScore = this.calculatePerformanceScore(performanceEvents);

    return {
      totalUsers,
      totalSessions,
      totalPageViews,
      averageSessionDuration: avgSessionDuration,
      averageEngagementScore: avgEngagementScore,
      conversionRate,
      topPages,
      topFeatures,
      performanceScore
    };
  }

  private calculatePerformanceScore(performanceEvents: AnalyticsEvent[]): number {
    if (performanceEvents.length === 0) return 0;

    const metrics: Record<string, number[]> = {};
    performanceEvents.forEach(event => {
      const metric = event.action.replace('performance_', '');
      if (!metrics[metric]) metrics[metric] = [];
      if (event.value !== undefined) metrics[metric].push(event.value);
    });

    // Score based on Core Web Vitals
    let score = 100;
    
    // LCP scoring (target < 2500ms)
    if (metrics.lcp?.length > 0) {
      const avgLcp = metrics.lcp.reduce((a, b) => a + b) / metrics.lcp.length;
      if (avgLcp > 4000) score -= 30;
      else if (avgLcp > 2500) score -= 15;
    }

    // FID scoring (target < 100ms)
    if (metrics.fid?.length > 0) {
      const avgFid = metrics.fid.reduce((a, b) => a + b) / metrics.fid.length;
      if (avgFid > 300) score -= 25;
      else if (avgFid > 100) score -= 10;
    }

    // CLS scoring (target < 0.1)
    if (metrics.cls?.length > 0) {
      const avgCls = metrics.cls.reduce((a, b) => a + b) / metrics.cls.length;
      if (avgCls > 0.25) score -= 20;
      else if (avgCls > 0.1) score -= 10;
    }

    return Math.max(0, score);
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    return {
      userAgent: ua,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      deviceType: this.getDeviceType(ua),
      browser: this.getBrowser(ua),
      os: this.getOS(ua)
    };
  }

  private getDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
      return /iPad/.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  private getBrowser(ua: string): string {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getLocationInfo() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private getUTMParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined
    };
  }

  private getElementInfo(element: HTMLElement) {
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      textContent: element.textContent?.slice(0, 100) || undefined,
      href: (element as HTMLAnchorElement).href || undefined
    };
  }

  private throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  private saveDataToStorage(): void {
    try {
      const data = {
        events: this.events,
        userBehavior: this.currentSession ? [this.currentSession] : [],
        performance: []
      };
      localStorage.setItem('arc_analytics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  private loadStoredData(): { events: AnalyticsEvent[]; userBehavior: UserBehavior[]; performance: PerformanceMetrics[] } {
    try {
      const stored = localStorage.getItem('arc_analytics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored analytics data:', error);
    }
    return { events: [], userBehavior: [], performance: [] };
  }

  private sendToExternalAnalytics(event: AnalyticsEvent): void {
    // Integration with Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value
      });
    }
  }

  // Cleanup
  public destroy(): void {
    this.endSession();
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Export singleton instance
export const analytics = new AdvancedAnalytics();

// React hook for using analytics
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    getAnalyticsData: analytics.getAnalyticsData.bind(analytics)
  };
};

export default analytics;
