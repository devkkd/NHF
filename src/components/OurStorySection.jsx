import React from 'react';

const OurStorySection = () => {
  return (
    <section className="w-full bg-[#FAF9F5] py-16 px-6 md:px-12 flex flex-col items-center justify-center text-center font-sans">
      
      {/* Main Heading Quote */}
      <div className="max-w-5xl mb-8">
        <h2 
          className="tracking-[-0.02em] leading-[160%] text-[#7B7F5C]"
          style={{
            fontFamily: "'Tobias TRIAL', serif",
            fontWeight: 600,
            fontSize: '30px'
          }}
        >
          "Nikita Began With A Single Conviction:<br></br>{' '}
          <span className="text-[#7B7F5C]">That The Finest Homes</span>{' '}
          <span className="text-[#8C906B]">Are Not Decorated, They Are Felt.</span>{' '}
          <span className="text-[#B5B79C]">Felt In The Weight Of A Kantha Quilt On A Cold Morning. In The Softness Of Hand-block Cotton Against The Skin. In The Quiet Beauty Of An Ajrakh-printed Cushion That Catches The Evening Light."</span>
        </h2>
      </div>

      {/* Sub-paragraph Description */}
      <div className="max-w-4xl text-[#8E8F7A] text-xs md:text-[13px] leading-[180%] font-light tracking-wide mb-14 px-4">
        <p className="mb-2">
          Since 2008, from our studio in Jaipur, we have been manufacturing and exporting artisan home furnishings and lifestyle textiles to homes across the world. Every piece is made by skilled hands who have inherited their craft. Every design carries the mark of our corner of Rajasthan.
        </p>
        <p className="font-medium italic text-[#7B7F5C]/90">
          This is not mass production. This is not trend-chasing. This is craft slow, intentional, irreplaceable.
        </p>
      </div>

      {/* Stats Grid / Row */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 items-center justify-center border-b border-[#7B7F5C]/10 pb-12 mb-10">
        
        {/* Stat 1 */}
        <div className="flex flex-col items-center md:border-r border-[#7B7F5C]/20 last:border-0 px-4">
          <span className="text-3xl md:text-4xl text-[#7B7F5C] font-light tracking-tight mb-1" style={{ fontFamily: "'Tobias TRIAL', serif" }}>
            18<span className="text-[#B5B79C] ml-0.5">+</span>
          </span>
          <span className="text-[11px] md:text-xs uppercase tracking-widest text-[#8E8F7A] font-medium">
            Years of Craft
          </span>
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col items-center md:border-r border-[#7B7F5C]/20 last:border-0 px-4">
          <span className="text-3xl md:text-4xl text-[#7B7F5C] font-light tracking-tight mb-1" style={{ fontFamily: "'Tobias TRIAL', serif" }}>
            30<span className="text-[#B5B79C] ml-0.5">+</span>
          </span>
          <span className="text-[11px] md:text-xs uppercase tracking-widest text-[#8E8F7A] font-medium">
            Countries Served
          </span>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col items-center md:border-r border-[#7B7F5C]/20 last:border-0 px-4">
          <span className="text-3xl md:text-4xl text-[#7B7F5C] font-light tracking-tight mb-1" style={{ fontFamily: "'Tobias TRIAL', serif" }}>
            15K<span className="text-[#B5B79C] ml-0.5">+</span>
          </span>
          <span className="text-[11px] md:text-xs uppercase tracking-widest text-[#8E8F7A] font-medium">
            Pieces Crafted
          </span>
        </div>

        {/* Stat 4 */}
        <div className="flex flex-col items-center px-4">
          <span className="text-3xl md:text-4xl text-[#7B7F5C] font-light tracking-tight mb-1" style={{ fontFamily: "'Tobias TRIAL', serif" }}>
            80<span className="text-[#B5B79C] ml-0.5">+</span>
          </span>
          <span className="text-[11px] md:text-xs uppercase tracking-widest text-[#8E8F7A] font-medium">
            Artisan Partners
          </span>
        </div>

      </div>

      {/* Discover Our Story Button */}
      <button className="bg-[#7B7F5C] hover:bg-[#686B4E] text-white text-xs tracking-widest uppercase font-medium py-3.5 px-8 flex items-center gap-2 transition-all shadow-sm">
        Discover Our Story 
        <span className="text-xs font-light">→</span>
      </button>

    </section>
  );
};

export default OurStorySection;