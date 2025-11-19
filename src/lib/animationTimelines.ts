// GSAP animation timelines and utilities
import gsap from 'gsap';

export function createBreathingAnimation(element: Element) {
  return gsap.timeline({ 
    repeat: -1, 
    defaults: { ease: 'sine.inOut' } 
  })
  .to(element, { scale: 1.02, duration: 1.8 })
  .to(element, { scale: 1, duration: 1.8 });
}

export function createRingRotation(element: Element) {
  return gsap.to(element, {
    rotation: 360,
    duration: 30,
    repeat: -1,
    ease: 'none',
    transformOrigin: '50% 50%'
  });
}

export function createProximityTilt(element: Element, rx: number, ry: number) {
  return gsap.to(element, {
    rotateX: rx,
    rotateY: ry,
    duration: 0.3,
    ease: 'power2.out',
    transformOrigin: '50% 50%'
  });
}

export function createEnterAnimation(
  orb: Element,
  rings: Element[],
  panels: Element[] = [],
  onComplete?: () => void
) {
  const timeline = gsap.timeline({ onComplete });
  
  timeline
    // Phase 1: Orb scale up
    .to(orb, { 
      scale: 1.1, 
      duration: 0.18, 
      ease: 'power2.out' 
    })
    
    // Phase 2: Rings split and expand
    .to(rings, { 
      rotation: 180, 
      scale: 1.8, 
      opacity: 0.6, 
      duration: 0.38,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.1')
    
    // Phase 3: Panels emerge from rings
    .fromTo(panels, {
      scale: 0,
      opacity: 0,
      rotateZ: 180
    }, {
      scale: 1,
      opacity: 1,
      rotateZ: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'back.out(1.7)'
    }, '-=0.2')
    
    // Phase 4: Orb returns to normal, becomes mini
    .to(orb, { 
      scale: 0.3, 
      duration: 0.25,
      ease: 'power2.inOut'
    }, '-=0.1')
    
    // Phase 5: Move orb to top-left corner
    .to(orb, {
      x: -200,
      y: -180,
      duration: 0.3,
      ease: 'power2.inOut'
    });
    
  return timeline;
}

export function createPanelOrbitAnimation(panels: Element[], centerX: number, centerY: number) {
  const panelPositions = [
    { x: 0, y: -220, rotation: 0 },     // Work - Top
    { x: 190, y: -110, rotation: 72 },  // Skills - Top Right  
    { x: 118, y: 180, rotation: 144 },  // About - Bottom Right
    { x: -118, y: 180, rotation: 216 }, // Playground - Bottom Left
    { x: -190, y: -110, rotation: 288 } // Contact - Top Left
  ];
  
  const timeline = gsap.timeline();
  
  panels.forEach((panel, index) => {
    const pos = panelPositions[index] || panelPositions[0];
    timeline.to(panel, {
      x: pos.x,
      y: pos.y,
      rotation: pos.rotation,
      duration: 0.6,
      ease: 'power2.out'
    }, index * 0.1);
  });
  
  return timeline;
}

export function killAllOrbAnimations(elements: Element[]) {
  elements.forEach(element => {
    gsap.killTweensOf(element);
  });
}
