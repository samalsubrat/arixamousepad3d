'use client'
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ModelCarousel = dynamic(() => import('./components/ModelCarousel'), {
  ssr: false,
});

const CARDS = [
  { title: "Agni", subtitle: "The Fire Starter" },
  { title: "Cordura", subtitle: "The Tank" },
  { title: "Tejas", subtitle: "The Radiance" },
  { title: "Velura", subtitle: "The Velvet Touch" },
];

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const card = CARDS[activeIndex];

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      {/* Full-screen 3D carousel */}
      <ModelCarousel onActiveChange={setActiveIndex} />

      {/* Text overlay — pointer-events-none so scroll passes through */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-48">
        {/* Left text */}
        <div className="max-w-xs">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-950">
            Pro Series
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Pro-Level. Lightweight. Superior.
          </p>
        </div>

        {/* Right text */}
        <div className="max-w-64">
          <p className="text-sm text-gray-500 leading-relaxed">
            Premium 4mm Original Poron foam provides unmatched cushioning,
            stability, and consistency. The gold standard for competitive
            gaming. Poron foam delivers consistent performance across all desk
            surfaces. Premium cushioning reduces fatigue during marathon gaming
            sessions.
          </p>
        </div>
      </div>

      {/* Bottom-center caption — updates per card */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p
          key={activeIndex}
          className="text-lg font-semibold text-gray-950 animate-fade-in"
        >
          {card.title}
        </p>
        <p
          key={`sub-${activeIndex}`}
          className="text-sm text-gray-500 animate-fade-in"
        >
          {card.subtitle}
        </p>
      </div>
    </div>
  );
}
