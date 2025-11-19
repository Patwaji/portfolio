'use client';

import { useEffect } from 'react';

// Google Analytics 4 implementation
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface AnalyticsProps {
  GA_MEASUREMENT_ID?: string;
  GTM_ID?: string;
}

export default function Analytics({ 
  GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  GTM_ID = process.env.NEXT_PUBLIC_GTM_ID 
}: AnalyticsProps) {
  useEffect(() => {
    // Only run analytics in production
    if (process.env.NODE_ENV !== 'production') return;
    
    // Google Analytics
    if (GA_MEASUREMENT_ID) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      const gtag = (...args: any[]) => {
        window.dataLayer.push(args);
      };
      window.gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }

    // Google Tag Manager
    if (GTM_ID) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `;
      document.head.appendChild(gtmScript);

      // GTM noscript fallback
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.appendChild(noscript);
    }
  }, [GA_MEASUREMENT_ID, GTM_ID]);

  return null;
}

// Analytics tracking functions
export const trackEvent = (
  action: string, 
  category: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    });
  }
};

// Portfolio-specific tracking events
export const trackPortfolioEvents = {
  orbClick: () => trackEvent('orb_click', 'engagement', 'arc_reactor_orb'),
  panelOpen: (panelId: string) => trackEvent('panel_open', 'navigation', panelId),
  contactFormSubmit: () => trackEvent('form_submit', 'contact', 'contact_form'),
  accessibilityToggle: (feature: string) => trackEvent('accessibility_toggle', 'accessibility', feature),
  skillInteraction: (skill: string) => trackEvent('skill_interaction', 'portfolio', skill),
  projectView: (projectId: string) => trackEvent('project_view', 'portfolio', projectId),
};
