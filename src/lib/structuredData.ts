// Structured data (JSON-LD) for SEO

export const getPersonStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Suryansh",
  "jobTitle": "Full Stack Developer",
  "description": "Engineer, builder, and dreamer creating futuristic web experiences with modern technologies.",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  "sameAs": [
    "https://linkedin.com/in/yourprofile", // Update with actual profiles
    "https://github.com/yourusername",
    "https://twitter.com/yourtwitterhandle"
  ],
  "knowsAbout": [
    "JavaScript",
    "TypeScript", 
    "React",
    "Next.js",
    "Node.js",
    "Web Development",
    "Frontend Development",
    "Full Stack Development",
    "3D Web Animations",
    "GSAP",
    "Accessibility",
    "Performance Optimization"
  ],
  "alumniOf": {
    "@type": "Organization",
    "name": "Your University" // Update with actual education
  }
});

export const getPortfolioStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Arc Reactor Portfolio",
  "description": "Interactive portfolio showcasing modern web development with 3D animations and holographic interfaces.",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  "author": {
    "@type": "Person",
    "name": "Suryansh"
  },
  "publisher": {
    "@type": "Person", 
    "name": "Suryansh"
  },
  "inLanguage": "en-US",
  "copyrightYear": new Date().getFullYear(),
  "genre": "Portfolio",
  "keywords": "portfolio, web development, react, next.js, typescript, 3D animations, interactive design"
});

export const getOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Suryansh - Web Development Services",
  "description": "Professional web development services specializing in modern React applications, 3D animations, and interactive user experiences.",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  "founder": {
    "@type": "Person",
    "name": "Suryansh"
  },
  "serviceType": "Web Development",
  "areaServed": "Worldwide",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Web Development Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Frontend Development",
          "description": "Modern React and Next.js applications with exceptional user experiences"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Service",
          "name": "Full Stack Development",
          "description": "Complete web application development from frontend to backend"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "3D Web Animations",
          "description": "Interactive 3D animations and immersive web experiences using GSAP and modern web technologies"
        }
      }
    ]
  }
});

export const getAllStructuredData = () => [
  getPersonStructuredData(),
  getPortfolioStructuredData(),
  getOrganizationStructuredData()
];
