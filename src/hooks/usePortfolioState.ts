'use client';

import { useState, useCallback } from 'react';

export type PortfolioState = 'landing' | 'entering' | 'navigation' | 'content';

export interface UsePortfolioStateReturn {
  currentState: PortfolioState;
  isLowGraphicsMode: boolean;
  visitedSections: string[];
  enterPortfolio: () => void;
  openPanel: (panelId: string) => void;
  returnToNavigation: () => void;
  toggleLowGraphicsMode: () => void;
  markSectionVisited: (sectionId: string) => void;
}

export function usePortfolioState(): UsePortfolioStateReturn {
  const [currentState, setCurrentState] = useState<PortfolioState>('landing');
  const [isLowGraphicsMode, setIsLowGraphicsMode] = useState(false);
  const [visitedSections, setVisitedSections] = useState<string[]>([]);

  const enterPortfolio = useCallback(() => {
    setCurrentState('entering');
    // Transition to navigation after animation completes
    setTimeout(() => {
      setCurrentState('navigation');
    }, 1500); // Match animation duration
  }, []);

  const openPanel = useCallback((panelId: string) => {
    setCurrentState('content');
    markSectionVisited(panelId);
  }, []);

  const returnToNavigation = useCallback(() => {
    setCurrentState('navigation');
  }, []);

  const toggleLowGraphicsMode = useCallback(() => {
    setIsLowGraphicsMode(prev => !prev);
    // Persist preference
    localStorage.setItem('lowGraphicsMode', (!isLowGraphicsMode).toString());
  }, [isLowGraphicsMode]);

  const markSectionVisited = useCallback((sectionId: string) => {
    setVisitedSections(prev => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId];
      }
      return prev;
    });
  }, []);

  return {
    currentState,
    isLowGraphicsMode,
    visitedSections,
    enterPortfolio,
    openPanel,
    returnToNavigation,
    toggleLowGraphicsMode,
    markSectionVisited,
  };
}
