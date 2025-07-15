import React, { useEffect, useRef, useState } from 'react';
import { gsap } from "gsap";
import { createSOAPAnimation } from './animation';

type ReportProps = {
  image: string; // base64 or url
  report: { [key: string]: string };
  onBack: () => void;
};


const Report: React.FC<ReportProps> = ({ image, report, onBack }) => {
  
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  //const detectImageRef = useRef<HTMLImageElement | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  
  useEffect(() => {

    itemRefs.current = itemRefs.current.slice(0, Object.keys(report).length);
    
    const animationTimeout = setTimeout(() => {
      const validRefs = itemRefs.current.filter(Boolean);
      
      if (validRefs.length > 0) {
        animation.current = createSOAPAnimation(validRefs);
        animation.current.play();
      }
    }, 100);

    return () => {
      clearTimeout(animationTimeout);
      if (animation.current) {
        animation.current.kill();
      }
    };
  }, []);

  const setItemRef = (el: HTMLDivElement | null, index: number) => {
    itemRefs.current[index] = el;
  };
  
  return (
  <div className="min-h-screen w-screen flex justify-center items-center bg-gray-50 px-4 py-10">
    <div className="max-w-5xl w-full bg-white rounded-xl shadow-md overflow-hidden flex flex-row">
      
      {/* Left: Image */}
      <div className="w-2/5 bg-[white] flex justify-center items-start p-6">
        <img
          //ref={detectImageRef}
          src={image.startsWith('data:') ? image : `data:image/png;base64,${image}`}
          alt="Detection result"
          className="rounded-lg max-w-full max-h-[600px] object-contain"
        />
      </div>

      {/* Right: Report Text */}
      <div className="w-3/5 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Detection Report</h2>

        {/* Dynamically render all report fields */}
        {Object.entries(report).map(([key, value], index) => (
        <div className="mb-8" key={key} ref={(el) => setItemRef(el, index)}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{key}</h3>
            <p className="text-gray-700 text-sm">{value}</p>
        </div>
        ))}

        <button
          className="mt-4 bg-black text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-900"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  </div>
)};

export default Report;