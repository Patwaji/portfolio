// SEO and metadata configuration for Arc Reactor Portfolio

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  url: string;
  image: string;
  twitterHandle: string;
  linkedin: string;
  github: string;
}

export const seoConfig: SEOConfig = {
  title: "Suryansh Patwa | Portfolio",
  description: "Explore an innovative portfolio powered by Arc Reactor technology. Interactive 3D animations, holographic panels, and cutting-edge web development showcase featuring React, Next.js, TypeScript, and GSAP.",
  keywords: [
    "portfolio",
    "web developer", 
    "react developer",
    "next.js developer",
    "typescript developer",
    "frontend developer",
    "full stack developer",
    "3D animations",
    "GSAP",
    "interactive design",
    "arc reactor",
    "holographic interface",
    "modern web development",
    "accessibility",
    "performance optimization"
  ],
  author: "Suryansh",
  url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  image: "/images/og-arc-reactor.jpg", // We'll create this
  twitterHandle: "@yourtwitterhandle", // Update with actual handle
  linkedin: "https://linkedin.com/in/yourprofile", // Update with actual profile
  github: "https://github.com/yourusername" // Update with actual username
};

export const getPageMetadata = (page?: {
  title?: string;
  description?: string;
  image?: string;
}) => {
  const title = page?.title 
    ? `${page.title} | ${seoConfig.title.split(' | ')[0]}`
    : seoConfig.title;
    
  return {
    title,
    description: page?.description || seoConfig.description,
    keywords: seoConfig.keywords.join(', '),
    authors: [{ name: seoConfig.author }],
    creator: seoConfig.author,
    publisher: seoConfig.author,
    metadataBase: new URL(seoConfig.url),
    alternates: {
      canonical: seoConfig.url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: seoConfig.url,
      title,
      description: page?.description || seoConfig.description,
      siteName: seoConfig.title.split(' | ')[0],
      images: [
        {
          url: page?.image || seoConfig.image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page?.description || seoConfig.description,
      images: [page?.image || seoConfig.image],
      creator: seoConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-site-verification-code', // Add your verification code
    },
  };
};
