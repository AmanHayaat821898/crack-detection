import { EaseType } from '../utils/singletons/Easing';
import { gsap } from 'gsap';
import { RefObject } from 'react';

const OPEN_DURATION = 1;

export const createSOAPAnimation = (elements: (HTMLDivElement | null)[]) => {
  const tl = gsap.timeline({ paused: true });

  tl.addLabel('start');

//   tl.fromTo(
//       img,
//       { opacity: 0 },
//       { 
//         opacity: 1, 
//         duration: OPEN_DURATION, 
//         ease: EaseType.BASIC_BUTTER 
//       },
//       'start'
//   );

  elements.forEach((element, index) => {
    if (!element) return;

    tl.fromTo(
      element,
      { opacity: 0, x: 20 },
      { 
        opacity: 1, 
        x: 0, 
        duration: OPEN_DURATION, 
        delay: index * 0.1, 
        ease: EaseType.BASIC_BUTTER 
      },
      'start'
    );
  });

  return tl;
};