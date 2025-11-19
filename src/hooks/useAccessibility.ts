'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseAccessibilityReturn {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
  isHighContrastMode: boolean;
  isReducedMotionMode: boolean;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  announceToScreenReader: (message: string) => void;
}

export function useAccessibility(): UseAccessibilityReturn {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersColorScheme, setPrefersColorScheme] = useState<'light' | 'dark' | 'no-preference'>('no-preference');
  const [isHighContrastMode, setIsHighContrastMode] = useState(false);
  const [isReducedMotionMode, setIsReducedMotionMode] = useState(false);

  useEffect(() => {
    // Check system preferences
    if (typeof window !== 'undefined') {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

      setPrefersReducedMotion(reducedMotionQuery.matches);
      setPrefersHighContrast(highContrastQuery.matches);
      setPrefersColorScheme(
        colorSchemeQuery.matches ? 'dark' : 
        window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 
        'no-preference'
      );

      // Load saved preferences
      const savedHighContrast = localStorage.getItem('highContrastMode') === 'true';
      const savedReducedMotion = localStorage.getItem('reducedMotionMode') === 'true';
      
      setIsHighContrastMode(savedHighContrast || prefersHighContrast);
      setIsReducedMotionMode(savedReducedMotion || reducedMotionQuery.matches);

      // Listen for system preference changes
      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
        if (!localStorage.getItem('reducedMotionMode')) {
          setIsReducedMotionMode(e.matches);
        }
      };

      const handleHighContrastChange = (e: MediaQueryListEvent) => {
        setPrefersHighContrast(e.matches);
        if (!localStorage.getItem('highContrastMode')) {
          setIsHighContrastMode(e.matches);
        }
      };

      reducedMotionQuery.addListener?.(handleReducedMotionChange);
      highContrastQuery.addListener?.(handleHighContrastChange);

      return () => {
        reducedMotionQuery.removeListener?.(handleReducedMotionChange);
        highContrastQuery.removeListener?.(handleHighContrastChange);
      };
    }
  }, [prefersHighContrast]);

  const toggleHighContrast = useCallback(() => {
    const newValue = !isHighContrastMode;
    setIsHighContrastMode(newValue);
    localStorage.setItem('highContrastMode', newValue.toString());
    
    // Apply high contrast CSS class
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrastMode]);

  const toggleReducedMotion = useCallback(() => {
    const newValue = !isReducedMotionMode;
    setIsReducedMotionMode(newValue);
    localStorage.setItem('reducedMotionMode', newValue.toString());
    
    // Apply reduced motion CSS class
    if (newValue) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [isReducedMotionMode]);

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersColorScheme,
    isHighContrastMode,
    isReducedMotionMode,
    toggleHighContrast,
    toggleReducedMotion,
    announceToScreenReader
  };
}
