// AI Integration and Recommendations for Arc Reactor Portfolio
// This module provides intelligent content suggestions and AI-powered features

import React from 'react';

export interface AIRecommendation {
  id: string;
  type: 'project' | 'skill' | 'content' | 'interaction';
  title: string;
  description: string;
  confidence: number;
  relevance: number;
  category: string;
  timestamp: Date;
}

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
  };
}

export interface AIInsight {
  type: 'engagement' | 'performance' | 'accessibility' | 'content';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  implementation?: string;
}

export class AIPortfolioAssistant {
  private apiKey: string | null;
  private endpoint: string;
  private cache: Map<string, any> = new Map();
  private userBehavior: UserBehaviorData | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || null;
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Initialize AI assistant with user behavior data
   */
  async initialize(behaviorData: Partial<UserBehaviorData>): Promise<void> {
    this.userBehavior = {
      visitedPanels: behaviorData.visitedPanels || [],
      timeSpent: behaviorData.timeSpent || {},
      interactions: behaviorData.interactions || [],
      preferences: {
        animationSpeed: 'normal',
        theme: 'auto',
        language: 'en',
        ...behaviorData.preferences
      },
      deviceInfo: {
        type: this.detectDeviceType(),
        capabilities: this.detectCapabilities(),
        ...behaviorData.deviceInfo
      }
    };
  }

  /**
   * Generate personalized content recommendations
   */
  async getPersonalizedRecommendations(): Promise<AIRecommendation[]> {
    if (!this.userBehavior) {
      return this.getFallbackRecommendations();
    }

    const cacheKey = this.generateCacheKey('recommendations', this.userBehavior);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const recommendations = await this.generateAIRecommendations();
      this.cache.set(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.warn('AI recommendations unavailable, using fallback:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Generate smart content suggestions based on user behavior
   */
  async getSmartContentSuggestions(currentPanel: string): Promise<string[]> {
    const suggestions = [];
    
    if (!this.userBehavior) return this.getDefaultSuggestions(currentPanel);

    // Analyze user behavior patterns
    const mostVisited = Object.entries(this.userBehavior.timeSpent)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([panel]) => panel);

    // Generate contextual suggestions
    switch (currentPanel) {
      case 'projects':
        if (mostVisited.includes('skills')) {
          suggestions.push('Explore how my skills were applied in these projects');
        }
        if (this.userBehavior.deviceInfo.type === 'mobile') {
          suggestions.push('Swipe through project demos optimized for mobile');
        }
        break;

      case 'skills':
        if (!this.userBehavior.visitedPanels.includes('projects')) {
          suggestions.push('See these skills in action in my project showcase');
        }
        break;

      case 'experience':
        if (this.userBehavior.timeSpent.projects > 30000) {
          suggestions.push('Compare my professional experience with project complexity');
        }
        break;

      case 'contact':
        if (Object.keys(this.userBehavior.timeSpent).length > 3) {
          suggestions.push("Let's discuss how my skills can benefit your project");
        }
        break;
    }

    return suggestions.length > 0 ? suggestions : this.getDefaultSuggestions(currentPanel);
  }

  /**
   * Generate AI-powered portfolio insights
   */
  async generatePortfolioInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Performance insights
    if (this.userBehavior && Object.values(this.userBehavior.timeSpent).some(time => time > 60000)) {
      insights.push({
        type: 'engagement',
        title: 'High Engagement Detected',
        description: 'Users are spending significant time exploring your portfolio, indicating strong interest.',
        actionable: true,
        priority: 'high',
        implementation: 'Consider adding more detailed case studies or interactive elements.'
      });
    }

    // Accessibility insights
    if (this.userBehavior?.preferences.animationSpeed === 'reduced') {
      insights.push({
        type: 'accessibility',
        title: 'Accessibility-Conscious Audience',
        description: 'Users are utilizing reduced motion preferences, showing accessibility awareness.',
        actionable: true,
        priority: 'medium',
        implementation: 'Ensure all content is accessible without animations.'
      });
    }

    // Device-specific insights
    if (this.userBehavior?.deviceInfo.type === 'mobile') {
      insights.push({
        type: 'performance',
        title: 'Mobile-First Audience',
        description: 'Majority of users are accessing from mobile devices.',
        actionable: true,
        priority: 'high',
        implementation: 'Optimize touch interactions and ensure fast mobile performance.'
      });
    }

    return insights;
  }

  /**
   * Generate dynamic content based on user context
   */
  async generateDynamicContent(contentType: 'greeting' | 'summary' | 'cta', context?: any): Promise<string> {
    const templates = {
      greeting: [
        "Welcome to my Arc Reactor Portfolio! ⚡",
        "Power up your project with cutting-edge development! 🚀",
        "Step into the future of web development! ✨"
      ],
      summary: [
        "Crafting immersive digital experiences with React, TypeScript, and advanced animations.",
        "Building accessible, performant web applications that push the boundaries of user experience.",
        "Specializing in production-ready applications with stunning visual design."
      ],
      cta: [
        "Ready to build something amazing together?",
        "Let's create the future, one line of code at a time!",
        "Your next breakthrough project starts here!"
      ]
    };

    // Personalize based on user behavior
    if (this.userBehavior) {
      const timeOfDay = new Date().getHours();
      if (contentType === 'greeting') {
        if (timeOfDay < 12) return "Good morning! Ready to power up your day with innovative development? 🌅⚡";
        if (timeOfDay < 18) return "Good afternoon! Let's energize your project with cutting-edge solutions! ⚡🚀";
        return "Good evening! Time to illuminate your vision with stunning web experiences! 🌙✨";
      }
    }

    const template = templates[contentType];
    return template[Math.floor(Math.random() * template.length)];
  }

  /**
   * Smart project filtering based on user interests
   */
  getSmartProjectFilter(userInterests: string[]): (project: any) => boolean {
    return (project) => {
      if (!this.userBehavior || userInterests.length === 0) return true;

      // Score projects based on user behavior
      let score = 0;
      
      // Interest matching
      if (project.technologies?.some((tech: string) => 
        userInterests.some(interest => tech.toLowerCase().includes(interest.toLowerCase())))) {
        score += 3;
      }

      // Complexity preference (based on time spent)
      const avgTimeSpent = Object.values(this.userBehavior.timeSpent).reduce((a, b) => a + b, 0) / 
                          Object.values(this.userBehavior.timeSpent).length;
      
      if (avgTimeSpent > 45000 && project.complexity === 'advanced') score += 2;
      if (avgTimeSpent < 20000 && project.complexity === 'beginner') score += 2;

      // Device optimization
      if (this.userBehavior.deviceInfo.type === 'mobile' && project.mobileOptimized) score += 1;

      return score >= 2;
    };
  }

  // Private helper methods
  private async generateAIRecommendations(): Promise<AIRecommendation[]> {
    if (!this.apiKey) {
      return this.getFallbackRecommendations();
    }

    // This would integrate with actual AI API
    // For now, return intelligent fallbacks based on behavior analysis
    return this.getIntelligentRecommendations();
  }

  private getIntelligentRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    if (!this.userBehavior) return this.getFallbackRecommendations();

    // Analyze user patterns
    const { visitedPanels, timeSpent, deviceInfo } = this.userBehavior;
    
    // Recommend based on unvisited areas
    const allPanels = ['projects', 'skills', 'experience', 'about', 'contact'];
    const unvisited = allPanels.filter(panel => !visitedPanels.includes(panel));
    
    unvisited.forEach(panel => {
      recommendations.push({
        id: `explore-${panel}`,
        type: 'content',
        title: `Explore ${panel.charAt(0).toUpperCase() + panel.slice(1)}`,
        description: this.getPanelDescription(panel),
        confidence: 0.8,
        relevance: 0.9,
        category: 'exploration',
        timestamp: new Date()
      });
    });

    // Device-specific recommendations
    if (deviceInfo.type === 'mobile') {
      recommendations.push({
        id: 'mobile-interactions',
        type: 'interaction',
        title: 'Try Touch Gestures',
        description: 'Swipe and tap to discover hidden animations optimized for mobile',
        confidence: 0.9,
        relevance: 0.8,
        category: 'interaction',
        timestamp: new Date()
      });
    }

    return recommendations.slice(0, 5); // Return top 5
  }

  private getFallbackRecommendations(): AIRecommendation[] {
    return [
      {
        id: 'explore-projects',
        type: 'project',
        title: 'Explore Featured Projects',
        description: 'Discover innovative web applications with stunning animations',
        confidence: 0.9,
        relevance: 0.9,
        category: 'showcase',
        timestamp: new Date()
      },
      {
        id: 'accessibility-features',
        type: 'interaction',
        title: 'Customize Accessibility',
        description: 'Personalize your experience with accessibility controls',
        confidence: 0.8,
        relevance: 0.7,
        category: 'accessibility',
        timestamp: new Date()
      },
      {
        id: 'contact-connect',
        type: 'content',
        title: 'Connect & Collaborate',
        description: "Let's discuss your next innovative project",
        confidence: 0.7,
        relevance: 0.8,
        category: 'engagement',
        timestamp: new Date()
      }
    ];
  }

  private getDefaultSuggestions(panel: string): string[] {
    const suggestions = {
      projects: ['Explore interactive demos', 'View source code', 'Check out live deployments'],
      skills: ['See skills in action', 'Explore related projects', 'View certifications'],
      experience: ['Download resume', 'View recommendations', 'Explore career timeline'],
      about: ['Learn my story', 'Explore interests', 'Connect on social media'],
      contact: ['Start a conversation', 'Schedule a meeting', 'View availability']
    };
    return suggestions[panel as keyof typeof suggestions] || ['Explore more content'];
  }

  private getPanelDescription(panel: string): string {
    const descriptions = {
      projects: 'Discover cutting-edge web applications and interactive experiences',
      skills: 'Explore technical expertise and development capabilities',
      experience: 'Review professional background and career achievements',
      about: 'Learn about my journey and passion for innovative development',
      contact: 'Connect for collaboration opportunities and project discussions'
    };
    return descriptions[panel as keyof typeof descriptions] || 'Discover more content';
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private detectCapabilities(): string[] {
    if (typeof window === 'undefined') return [];
    
    const capabilities = [];
    
    if ('ontouchstart' in window) capabilities.push('touch');
    if (window.DeviceOrientationEvent) capabilities.push('orientation');
    if ('vibrate' in navigator) capabilities.push('haptic');
    if ('speechSynthesis' in window) capabilities.push('speech');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) capabilities.push('reduced-motion');
    
    return capabilities;
  }

  private generateCacheKey(operation: string, data: any): string {
    return `ai-${operation}-${JSON.stringify(data).substring(0, 50)}`;
  }
}

// Export singleton instance
export const aiAssistant = new AIPortfolioAssistant();

// Hook for React components
export function useAIRecommendations() {
  const [recommendations, setRecommendations] = React.useState<AIRecommendation[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  const refreshRecommendations = React.useCallback(async () => {
    setLoading(true);
    try {
      const newRecommendations = await aiAssistant.getPersonalizedRecommendations();
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  return { recommendations, loading, refreshRecommendations };
}
