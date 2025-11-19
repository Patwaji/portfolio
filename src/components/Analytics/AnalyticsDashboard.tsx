'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAnalytics } from '@/lib/advanced-analytics';
import type { AnalyticsData, AnalyticsEvent, UserBehavior } from '@/lib/advanced-analytics';
import './AnalyticsDashboard.css';

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  color?: string;
  icon: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const { getAnalyticsData } = useAnalytics();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = getAnalyticsData();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [getAnalyticsData]);

  const tabs: DashboardTab[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'audience', label: 'Audience', icon: '👥' },
    { id: 'behavior', label: 'Behavior', icon: '🎯' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'realtime', label: 'Real-time', icon: '🔴' },
  ];

  const timeRanges = [
    { id: '1h', label: 'Last Hour' },
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
  ];

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!analyticsData) return null;

    const now = Date.now();
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    }[timeRange] || 7 * 24 * 60 * 60 * 1000;

    const cutoff = now - timeRangeMs;

    return {
      ...analyticsData,
      events: analyticsData.events.filter(e => e.timestamp >= cutoff),
      userBehavior: analyticsData.userBehavior.filter(s => s.startTime >= cutoff),
      performance: analyticsData.performance.filter(p => p.timestamp >= cutoff),
    };
  }, [analyticsData, timeRange]);

  // Calculate metrics for overview
  const overviewMetrics = useMemo((): MetricCard[] => {
    if (!filteredData) return [];

    return [
      {
        title: 'Total Users',
        value: filteredData.summary.totalUsers.toLocaleString(),
        icon: '👤',
        color: '#3b82f6'
      },
      {
        title: 'Sessions',
        value: filteredData.summary.totalSessions.toLocaleString(),
        icon: '🎯',
        color: '#10b981'
      },
      {
        title: 'Page Views',
        value: filteredData.summary.totalPageViews.toLocaleString(),
        icon: '📄',
        color: '#8b5cf6'
      },
      {
        title: 'Avg. Session Duration',
        value: formatDuration(filteredData.summary.averageSessionDuration),
        icon: '⏱️',
        color: '#f59e0b'
      },
      {
        title: 'Engagement Score',
        value: Math.round(filteredData.summary.averageEngagementScore * 100) / 100,
        unit: 'pts',
        icon: '⭐',
        color: '#ef4444'
      },
      {
        title: 'Conversion Rate',
        value: `${Math.round(filteredData.summary.conversionRate * 100) / 100}%`,
        icon: '🎯',
        color: '#06b6d4'
      },
      {
        title: 'Performance Score',
        value: Math.round(filteredData.summary.performanceScore),
        unit: '/100',
        icon: '⚡',
        color: filteredData.summary.performanceScore > 80 ? '#10b981' : 
               filteredData.summary.performanceScore > 60 ? '#f59e0b' : '#ef4444'
      }
    ];
  }, [filteredData]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 3600000)}h`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="analytics-dashboard analytics-dashboard--loading">
        <div className="analytics-loading">
          <div className="analytics-loading__spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!filteredData) {
    return (
      <div className="analytics-dashboard analytics-dashboard--error">
        <div className="analytics-error">
          <span className="analytics-error__icon">⚠️</span>
          <h3>Unable to load analytics data</h3>
          <p>Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-dashboard__header">
        <h1 className="analytics-dashboard__title">
          <span className="analytics-dashboard__title-icon">📊</span>
          Advanced Analytics Dashboard
        </h1>
        
        <div className="analytics-dashboard__controls">
          <div className="analytics-dashboard__time-range">
            <label htmlFor="timeRange">Time Range:</label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="analytics-dashboard__select"
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="analytics-dashboard__tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`analytics-dashboard__tab ${
                  activeTab === tab.id ? 'analytics-dashboard__tab--active' : ''
                }`}
              >
                <span className="analytics-dashboard__tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-dashboard__content">
        {activeTab === 'overview' && (
          <OverviewPanel metrics={overviewMetrics} data={filteredData} />
        )}
        {activeTab === 'audience' && (
          <AudiencePanel data={filteredData} />
        )}
        {activeTab === 'behavior' && (
          <BehaviorPanel data={filteredData} />
        )}
        {activeTab === 'performance' && (
          <PerformancePanel data={filteredData} />
        )}
        {activeTab === 'realtime' && (
          <RealtimePanel data={filteredData} />
        )}
      </div>
    </div>
  );
};

// Overview Panel Component
const OverviewPanel: React.FC<{ metrics: MetricCard[]; data: AnalyticsData }> = ({ metrics, data }) => {
  return (
    <div className="analytics-panel">
      <div className="analytics-metrics">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="analytics-metric"
            style={{ '--metric-color': metric.color } as React.CSSProperties}
          >
            <div className="analytics-metric__header">
              <span className="analytics-metric__icon">{metric.icon}</span>
              <span className="analytics-metric__title">{metric.title}</span>
            </div>
            <div className="analytics-metric__value">
              {metric.value}
              {metric.unit && <span className="analytics-metric__unit">{metric.unit}</span>}
            </div>
            {metric.change !== undefined && (
              <div className={`analytics-metric__change ${
                metric.change >= 0 ? 'analytics-metric__change--positive' : 'analytics-metric__change--negative'
              }`}>
                {metric.change >= 0 ? '↗' : '↘'} {Math.abs(metric.change)}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="analytics-charts">
        <div className="analytics-chart">
          <h3>Top Pages</h3>
          <div className="analytics-top-pages">
            {data.summary.topPages.map((page, index) => (
              <div key={index} className="analytics-top-item">
                <div className="analytics-top-item__rank">#{index + 1}</div>
                <div className="analytics-top-item__info">
                  <div className="analytics-top-item__name">{page.page}</div>
                  <div className="analytics-top-item__stats">
                    {page.views.toLocaleString()} views • {formatDuration(page.avgTime)} avg time
                  </div>
                </div>
                <div className="analytics-top-item__bar">
                  <div 
                    className="analytics-top-item__bar-fill"
                    style={{ 
                      width: `${(page.views / Math.max(...data.summary.topPages.map(p => p.views))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-chart">
          <h3>Top Features</h3>
          <div className="analytics-top-features">
            {data.summary.topFeatures.map((feature, index) => (
              <div key={index} className="analytics-top-item">
                <div className="analytics-top-item__rank">#{index + 1}</div>
                <div className="analytics-top-item__info">
                  <div className="analytics-top-item__name">{feature.feature}</div>
                  <div className="analytics-top-item__stats">
                    {feature.usage} uses • {feature.engagement} engagement
                  </div>
                </div>
                <div className="analytics-top-item__bar">
                  <div 
                    className="analytics-top-item__bar-fill"
                    style={{ 
                      width: `${(feature.usage / Math.max(...data.summary.topFeatures.map(f => f.usage))) * 100}%`,
                      background: '#8b5cf6'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Audience Panel Component
const AudiencePanel: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const deviceTypes = useMemo(() => {
    const devices: Record<string, number> = {};
    data.userBehavior.forEach(session => {
      const deviceType = session.deviceInfo.deviceType;
      devices[deviceType] = (devices[deviceType] || 0) + 1;
    });
    return Object.entries(devices).map(([device, count]) => ({
      device,
      count,
      percentage: (count / data.userBehavior.length) * 100
    }));
  }, [data.userBehavior]);

  const browsers = useMemo(() => {
    const browserCounts: Record<string, number> = {};
    data.userBehavior.forEach(session => {
      const browser = session.deviceInfo.browser;
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });
    return Object.entries(browserCounts)
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: (count / data.userBehavior.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data.userBehavior]);

  return (
    <div className="analytics-panel">
      <div className="analytics-charts">
        <div className="analytics-chart">
          <h3>Device Types</h3>
          <div className="analytics-device-chart">
            {deviceTypes.map(({ device, count, percentage }) => (
              <div key={device} className="analytics-device-item">
                <div className="analytics-device-item__info">
                  <span className="analytics-device-item__icon">
                    {device === 'mobile' ? '📱' : device === 'tablet' ? '📱' : '💻'}
                  </span>
                  <span className="analytics-device-item__name">{device}</span>
                  <span className="analytics-device-item__count">{count}</span>
                </div>
                <div className="analytics-device-item__bar">
                  <div 
                    className="analytics-device-item__bar-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <span className="analytics-device-item__percentage">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-chart">
          <h3>Top Browsers</h3>
          <div className="analytics-browser-chart">
            {browsers.map(({ browser, count, percentage }) => (
              <div key={browser} className="analytics-browser-item">
                <div className="analytics-browser-item__info">
                  <span className="analytics-browser-item__name">{browser}</span>
                  <span className="analytics-browser-item__count">{count} users</span>
                </div>
                <div className="analytics-browser-item__bar">
                  <div 
                    className="analytics-browser-item__bar-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <span className="analytics-browser-item__percentage">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Behavior Panel Component
const BehaviorPanel: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const engagementLevels = useMemo(() => {
    const levels = { low: 0, medium: 0, high: 0 };
    data.userBehavior.forEach(session => {
      if (session.engagementScore < 5) levels.low++;
      else if (session.engagementScore < 15) levels.medium++;
      else levels.high++;
    });
    return levels;
  }, [data.userBehavior]);

  const recentEvents = useMemo(() => {
    return data.events
      .filter(event => event.type === 'interaction' || event.type === 'engagement')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [data.events]);

  return (
    <div className="analytics-panel">
      <div className="analytics-charts">
        <div className="analytics-chart">
          <h3>Engagement Levels</h3>
          <div className="analytics-engagement-chart">
            <div className="analytics-engagement-item">
              <span className="analytics-engagement-item__label">Low (0-5 pts)</span>
              <span className="analytics-engagement-item__count">{engagementLevels.low}</span>
              <div className="analytics-engagement-item__bar">
                <div 
                  className="analytics-engagement-item__bar-fill analytics-engagement-item__bar-fill--low"
                  style={{ 
                    width: `${(engagementLevels.low / data.userBehavior.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="analytics-engagement-item">
              <span className="analytics-engagement-item__label">Medium (5-15 pts)</span>
              <span className="analytics-engagement-item__count">{engagementLevels.medium}</span>
              <div className="analytics-engagement-item__bar">
                <div 
                  className="analytics-engagement-item__bar-fill analytics-engagement-item__bar-fill--medium"
                  style={{ 
                    width: `${(engagementLevels.medium / data.userBehavior.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="analytics-engagement-item">
              <span className="analytics-engagement-item__label">High (15+ pts)</span>
              <span className="analytics-engagement-item__count">{engagementLevels.high}</span>
              <div className="analytics-engagement-item__bar">
                <div 
                  className="analytics-engagement-item__bar-fill analytics-engagement-item__bar-fill--high"
                  style={{ 
                    width: `${(engagementLevels.high / data.userBehavior.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-chart">
          <h3>Recent Activity</h3>
          <div className="analytics-activity-feed">
            {recentEvents.map((event, index) => (
              <div key={event.id} className="analytics-activity-item">
                <div className="analytics-activity-item__time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="analytics-activity-item__content">
                  <span className="analytics-activity-item__action">{event.action}</span>
                  <span className="analytics-activity-item__category">in {event.category}</span>
                  {event.value && (
                    <span className="analytics-activity-item__value">({event.value})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Performance Panel Component
const PerformancePanel: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const performanceMetrics = useMemo(() => {
    const perfEvents = data.events.filter(e => e.category === 'performance');
    const metrics: Record<string, number[]> = {};
    
    perfEvents.forEach(event => {
      const metric = event.action.replace('performance_', '');
      if (!metrics[metric]) metrics[metric] = [];
      if (event.value !== undefined) metrics[metric].push(event.value);
    });

    return Object.entries(metrics).map(([metric, values]) => ({
      metric,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }));
  }, [data.events]);

  return (
    <div className="analytics-panel">
      <div className="analytics-charts">
        <div className="analytics-chart">
          <h3>Performance Metrics</h3>
          <div className="analytics-performance-chart">
            {performanceMetrics.map(({ metric, average, min, max, count }) => (
              <div key={metric} className="analytics-performance-item">
                <div className="analytics-performance-item__header">
                  <span className="analytics-performance-item__name">{metric.toUpperCase()}</span>
                  <span className="analytics-performance-item__count">{count} samples</span>
                </div>
                <div className="analytics-performance-item__stats">
                  <div className="analytics-performance-stat">
                    <span className="analytics-performance-stat__label">Avg</span>
                    <span className="analytics-performance-stat__value">
                      {formatDuration(average)}
                    </span>
                  </div>
                  <div className="analytics-performance-stat">
                    <span className="analytics-performance-stat__label">Min</span>
                    <span className="analytics-performance-stat__value">
                      {formatDuration(min)}
                    </span>
                  </div>
                  <div className="analytics-performance-stat">
                    <span className="analytics-performance-stat__label">Max</span>
                    <span className="analytics-performance-stat__value">
                      {formatDuration(max)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Real-time Panel Component
const RealtimePanel: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const [realtimeData, setRealtimeData] = useState(data);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(data);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const recentEvents = useMemo(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return realtimeData.events
      .filter(event => event.timestamp >= fiveMinutesAgo)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }, [realtimeData]);

  return (
    <div className="analytics-panel">
      <div className="analytics-realtime">
        <div className="analytics-realtime__header">
          <h3>
            <span className="analytics-realtime__indicator"></span>
            Live Activity (Last 5 minutes)
          </h3>
          <div className="analytics-realtime__stats">
            <span>Active Users: {realtimeData.userBehavior.length}</span>
            <span>Events: {recentEvents.length}</span>
          </div>
        </div>
        
        <div className="analytics-realtime__feed">
          {recentEvents.map((event, index) => (
            <div key={`${event.id}-${index}`} className="analytics-realtime__event">
              <div className="analytics-realtime__event-time">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
              <div className="analytics-realtime__event-content">
                <span className="analytics-realtime__event-type">{event.type}</span>
                <span className="analytics-realtime__event-action">{event.action}</span>
                <span className="analytics-realtime__event-category">({event.category})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

// Helper function for formatting duration
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 3600000)}h`;
};
