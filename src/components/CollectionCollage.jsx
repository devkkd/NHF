"use client"; // ← Yeh directive top par hona zaroori hai

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Mock data based directly on your image layout items (Scatter Grid Coordinates)
const items = [
  { id: 1, src: '/images/item1.png', top: '10%', left: '10%', rotate: '-15deg', speed: 20 },
  { id: 2, src: '/images/item2.png', top: '15%', left: '30%', rotate: '12deg', speed: -30 },
  { id: 3, src: '/images/item3.png', top: '5%', left: '45%', rotate: '0deg', speed: 15 },
  { id: 4, src: '/images/item4.png', top: '20%', left: '60%', rotate: '-20deg', speed: -40 },
  { id: 5, src: '/images/item5.png', top: '18%', left: '75%', rotate: '15deg', speed: 25 },
  { id: 6, src: '/images/item6.png', top: '35%', left: '6%', rotate: '90deg', speed: -15 },
  { id: 7, src: '/images/item7.png', top: '32%', left: '22%', rotate: '-5deg', speed: 35 },
  { id: 8, src: '/images/item8.png', top: '42%', left: '62%', rotate: '25deg', speed: -25 },
  { id: 9, src: '/images/item9.png', top: '45%', left: '76%', rotate: '-10deg', speed: 45 },
  { id: 10, src: '/images/item10.png', top: '40%', left: '90%', rotate: '5deg', speed: -20 },
  { id: 11, src: '/images/item11.png', top: '60%', left: '10%', rotate: '-35deg', speed: 30 },
  { id: 12, src: '/images/item12.png', top: '56%', left: '26%', rotate: '18deg', speed: -15 },
  { id: 13, src: '/images/item13.png', top: '52%', left: '48%', rotate: '0deg', speed: 10 },
  { id: 14, src: '/images/item14.png', top: '65%', left: '68%', rotate: '-12deg', speed: -35 },
  { id: 15, src: '/images/item15.png', top: '70%', left: '85%', rotate: '40deg', speed: 20 },
  { id: 16, src: '/images/item16.png', top: '82%', left: '18%', rotate: '15deg', speed: -25 },
  { id: 17, src: '/images/item17.png', top: '72%', left: '38%', rotate: '-15deg', speed: 40 },
  { id: 18, src: '/images/item18.png', top: '75%', left: '54%', rotate: '8deg', speed: -30 },
  { id: 19, src: '/images/item19.png', top: '90%', left: '35%', rotate: '0deg', speed: 15 },
  { id: 20, src: '/images/item20.png', top: '92%', left: '56%', rotate: '-5deg', speed: -10 },
  { id: 21, src: '/images/item21.png', top: '85%', left: '74%', rotate: '22deg', speed: 25 },
];

const CollectionCollage = () => {
  const containerRef = useRef(null);

  // Scroll tracking for the Vogue Parallax Effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-[100vh] bg-[#FAF9F5] overflow-hidden py-24 flex items-center justify-center select-none"
    >
      
      {/* Background/Floating Scattered Cards Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {items.map((item) => {
          const rawY = useTransform(scrollYProgress, [0, 1], [0, item.speed * 4]);
          const y = useSpring(rawY, { stiffness: 60, damping: 20 });

          return (
            <motion.div
              key={item.id}
              className="absolute w-16 h-16 md:w-24 md:h-24 bg-white/40 border border-black/5 p-1 shadow-sm flex items-center justify-center overflow-hidden transition-shadow duration-300 pointer-events-auto cursor-pointer hover:shadow-xl hover:scale-105 hover:z-50"
              style={{
                top: item.top,
                left: item.left,
                transform: `rotate(${item.rotate})`,
                y: y
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="w-full h-full relative bg-neutral-200">
                <img 
                  src={item.src} 
                  alt={`Collection Item ${item.id}`}
                  className="w-full h-full object-cover mix-blend-multiply"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Central Content */}
      <div className="relative z-10 max-w-xl text-center px-6 pointer-events-auto bg-[#FAF9F5]/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-8 md:p-0 rounded-2xl">
        <h2 
          className="tracking-[0.06em] leading-tight text-[#7B7F5C] uppercase mb-4"
          style={{
            fontFamily: "'Tobias TRIAL', serif",
            fontWeight: 600,
            fontSize: '44px'
          }}
        >
          The Collection
        </h2>
        <p className="text-xs md:text-[13px] leading-[170%] text-[#8E8F7A] font-light tracking-wide max-w-sm mx-auto uppercase">
          Explore Every Corner Of The Nikita World,<br />
          From Bedroom Essentials<br />
          To Wearable Artisan Textiles.
        </p>
      </div>

    </div>
  );
};

export default CollectionCollage;