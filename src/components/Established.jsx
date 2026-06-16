// "use client"
// import React, { useState, useEffect, useRef } from 'react';

// // Figma images aur data ke according timeline structure
// const timelineData = [
//   {
//     id: 1,
//     year: '2006',
//     title: 'Nikita Home Furnishings is Established',
//     description: 'Company registered and studio opened at Govind Nagar West, Jaipur. Initial production focused on kantha bedcovers, quilts, throws, and block-printed bedsheets. The founder, Jay Kumar Maheshwari, brings deep roots in the Rajasthani textile trade and an uncompromising standard from the first day of production. First domestic trade enquiries received within weeks of opening.',
//     images: [
//       'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80', // Replace with your actual Figma Image 1
//       'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80', // Replace with your actual Figma Image 2
//       'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'  // Replace with your actual Figma Image 3
//     ]
//   },
//   {
//     id: 2,
//     year: '2008-2010',
//     title: 'First International Trade Fair Exhibitions',
//     description: 'Trade platforms introduced Nikita Furnishings to the world\'s largest home textiles fair, attended by buyers from over 100 countries. It created perfect initial footsteps. The items attracted automated commercial interest, building a network of export clients spanning Europe and East Asia within a single year.',
//     images: [
//       'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1616176594722-ec9099e033f9?auto=format&fit=crop&w=600&q=80'
//     ]
//   },
//   {
//     id: 3,
//     year: '2012-2014',
//     title: 'Maison & Objet and Top Drawer entered',
//     description: 'Paris and London exhibitions are added to the fair calendar. Maison & Objet introduces Nikita\'s artisan collections to Europe\'s most design-forward buyers, concept stores, interior curators, and lifestyle retailers. Top Drawer London establishes relationships with British independent boutiques.',
//     images: [
//       'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1544207240-8b1025eb7a6c?auto=format&fit=crop&w=600&q=80'
//     ]
//   },
//   {
//     id: 4,
//     year: '2016-2018',
//     title: 'New York and Hong Kong Exhibitions begin',
//     description: 'NY NOW New York opens North America as a meaningful market; US buyers, seeking genuine artisan sourcing and ethical manufacturing, respond strongly. Hong Kong Gifts & Home becomes the gateway to South-East Asian and Australasian buyers. Bags, pouches, and accessories range are beautifully expanded.',
//     images: [
//       'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=600&q=80'
//     ]
//   },
//   {
//     id: 5,
//     year: '2022-2024',
//     title: 'Full global exhibition Presence reinstated',
//     description: 'Exhibition calendar restored at full scale. New collections unveiled at Heimtextil, Ambiente, Maison & Objet, NY NOW, and the IHGF Delhi Fair. Buyer relationships resume in person. New export markets opened in South-East Asia and the Gulf region smoothly.',
//     images: [
//       'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
//     ]
//   },
//   {
//     id: 6,
//     year: '2026',
//     title: 'A Global Name - The same Jaipur studio',
//     description: 'Nikita Home Furnishings stands as India\'s most trusted artisan home textile manufacturer and exporter, with an established presence at the world\'s most important trade fairs, buyers in over 20 countries. The studio address and the artisan families at the heart of production remain unchanged.',
//     images: [
//       'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=600&q=80',
//       'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
//     ]
//   }
// ];

// export default function RotatingTimelineComponent() {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!containerRef.current) return;
      
//       const container = containerRef.current;
//       const rect = container.getBoundingClientRect();
//       const totalScrollableHeight = rect.height - window.innerHeight;
//       const currentScrollPosition = -rect.top;
      
//       if (currentScrollPosition >= 0 && currentScrollPosition <= totalScrollableHeight) {
//         const scrollPercentage = currentScrollPosition / totalScrollableHeight;
//         const index = Math.min(
//           Math.floor(scrollPercentage * timelineData.length),
//           timelineData.length - 1
//         );
//         setActiveIndex(index);
//       } else if (currentScrollPosition < 0) {
//         setActiveIndex(0);
//       } else {
//         setActiveIndex(timelineData.length - 1);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Har ek active item ke degree coordinates shift karne ke liye formula (-32deg step angle)
//   const baseRotation = activeIndex * -32;

//   // Manual trigger click logic for indicator navigation
//   const scrollToSection = (targetIdx) => {
//     if (!containerRef.current) return;
//     const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
//     const targetY = (targetIdx * totalHeight) / (timelineData.length - 1);
    
//     // Smooth window scrolling context
//     const absoluteTargetY = targetY + containerRef.current.offsetTop;
//     window.scrollTo({ top: absoluteTargetY, behavior: 'smooth' });
//   };

//   return (
//     <div ref={containerRef} className="relative w-full bg-[#faf9f5]" style={{ height: '600vh' }}>
//       {/* Sticky Top Section Frame */}
//       <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between py-10 px-4 md:px-16 select-none">
        
//         {/* Branding Brand Text */}
//         <div className="w-full text-center z-20 mt-2">
//           <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-semibold mb-1">Heritage Timeline</p>
//           <h1 className="text-2xl md:text-3xl font-serif text-[#7B7F5C] font-bold tracking-wide">NIKITA HOME FURNISHINGS</h1>
//         </div>

//         {/* Dynamic 3 Images Grid Layout with asymmetric elevations */}
//         <div className="w-full max-w-6xl mx-auto z-10 my-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 transition-all duration-700 ease-in-out">
//           {timelineData[activeIndex].images.map((imgUrl, imgIdx) => (
//             <div 
//               key={imgIdx} 
//               className="relative aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-md shadow-lg border border-[#7B7F5C]/10 bg-white group transition-all duration-1000 ease-out"
//               style={{
//                 // Image columns me depth effects create karne ke liye asymmetry offsets
//                 transform: `translateY(${imgIdx === 1 ? '-15px' : imgIdx === 2 ? '15px' : '0px'})`,
//                 opacity: 1
//               }}
//             >
//               <img 
//                 src={imgUrl} 
//                 alt={`Timeline Event ${timelineData[activeIndex].year} - Showcase ${imgIdx + 1}`}
//                 className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
//                 loading="lazy"
//               />
//               <div className="absolute inset-0 bg-[#7B7F5C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//             </div>
//           ))}
//         </div>

//         {/* Bottom Text content panel */}
//         <div className="w-full max-w-4xl mx-auto text-center z-20 flex flex-col items-center mb-4">
          
//           {/* Year Badge */}
//           <div className="text-2xl font-serif font-bold text-[#7B7F5C] tracking-widest mb-1">
//             {timelineData[activeIndex].year}
//           </div>

//           {/* Heading Title */}
//           <h2 className="text-xl md:text-2xl font-serif font-semibold text-gray-800 mb-3 px-4 max-w-2xl transition-all duration-500">
//             {timelineData[activeIndex].title}
//           </h2>

//           {/* Description Block */}
//           <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-3xl min-h-[90px] md:min-h-[70px] px-6 md:px-12 font-light transition-all duration-500">
//             {timelineData[activeIndex].description}
//           </p>

//           {/* Navigation Controls and Dot Steps */}
//           <div className="flex items-center space-x-6 mt-4">
//             <button 
//               onClick={() => scrollToSection(Math.max(0, activeIndex - 1))}
//               className="text-gray-400 hover:text-[#7B7F5C] transition-colors text-xl font-bold disabled:opacity-20"
//               disabled={activeIndex === 0}
//             >
//               ←
//             </button>
            
//             <div className="flex items-center space-x-2">
//               {timelineData.map((item, idx) => (
//                 <button
//                   key={item.id}
//                   onClick={() => scrollToSection(idx)}
//                   className={`h-1.5 transition-all duration-500 rounded-full ${idx === activeIndex ? 'w-10 bg-[#7B7F5C]' : 'w-2 bg-gray-300 hover:bg-[#7B7F5C]/50'}`}
//                   aria-label={`Go to year ${item.year}`}
//                 />
//               ))}
//             </div>

//             <button 
//               onClick={() => scrollToSection(Math.min(timelineData.length - 1, activeIndex + 1))}
//               className="text-gray-400 hover:text-[#7B7F5C] transition-colors text-xl font-bold disabled:opacity-20"
//               disabled={activeIndex === timelineData.length - 1}
//             >
//               →
//             </button>
//           </div>
//         </div>

//         {/* ROTATING BACKGROUND DIAL (Semicircle Track) */}
//         <div 
//           className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] md:w-[85vw] aspect-square rounded-full border border-[#7B7F5C]/25 pointer-events-none transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) z-0"
//           style={{
//             transform: `translateX(-50%) translateY(62%) rotate(${baseRotation}deg)`,
//           }}
//         >
//           {/* Internal design concentric lines for accurate premium finish */}
//           <div className="absolute inset-6 rounded-full border border-dashed border-[#7B7F5C]/10" />
//           <div className="absolute inset-12 rounded-full border border-[#7B7F5C]/5" />

//           {/* Dynamic Year Labels Distributed Around the Circle Grid */}
//           {timelineData.map((item, index) => {
//             // Arc geometry calibration to position nodes correctly
//             const segmentAngle = index * 32 + 90; 
//             const radian = (segmentAngle * Math.PI) / 180;
            
//             return (
//               <div
//                 key={item.id}
//                 className="absolute text-center select-none"
//                 style={{
//                   left: `calc(50% + ${Math.cos(radian) * 50}% - 45px)`,
//                   top: `calc(50% + ${Math.sin(radian) * 50}% - 25px)`,
//                   width: '90px',
//                   transform: `rotate(${-segmentAngle + 90}deg)`,
//                 }}
//               >
//                 <span className={`block font-serif text-xs tracking-wider transition-all duration-500 ${index === activeIndex ? 'text-[#7B7F5C] scale-125 font-bold' : 'text-gray-400 opacity-50'}`}>
//                   {item.year.split('-')[0]}
//                 </span>
//                 <div className={`mx-auto w-1.5 h-1.5 rounded-full mt-1.5 transition-all duration-500 ${index === activeIndex ? 'bg-[#7B7F5C] scale-125 shadow-sm' : 'bg-gray-300'}`} />
//               </div>
//             );
//           })}
//         </div>

//       </div>
//     </div>
//   );
// }

// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// // आपकी फिग्मा इमेजेस और डेटा के अनुसार टाइमलाइन डेटा
// // हर साल में 3 इमेजेस जोड़ी गई हैं
// const timelineData = [
//   {
//     id: 1,
//     year: "2006",
//     title: "Nikita Home Furnishings is Established",
//     description: "Company registered and studio opened at Govind Nagar West, Jaipur. Initial production focused on kantha bedcovers, quilts, throws, and block-printed bedsheets. The founder, Joy Kumar Maheshwari, brings deep roots in the Rajasthani textile trade.",
//     images: [
//       "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop", 
//       "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop"
//     ],
//     angle: 60, // व्हील रोटेशन एंगल
//   },
//   {
//     id: 2,
//     year: "2008-2010",
//     title: "First International Trade Fair Exhibitions",
//     description: "Trade platforms in Mumbai and New Delhi opened the floor to the world's largest home textile fair. The company attracted a distinct network of international buyers, establishing European collaborations.",
//     images: [
//       "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop"
//     ],
//     angle: 30,
//   },
//   {
//     id: 3,
//     year: "2012-2014",
//     title: "Maison & Objet and Top Drawer Entered",
//     description: "Paris and London exhibitions are added to the fair calendar. Maison & Objet introduces Nikita's artisan collections to Europe's most design-forward buyers, concept stores, and lifestyle retailers.",
//     images: [
//       "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1505693395321-883724634266?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&auto=format&fit=crop"
//     ],
//     angle: 0,
//   },
//   {
//     id: 4,
//     year: "2016-2018",
//     title: "New York and Hong Kong Exhibitions Begin",
//     description: "NY NOW New York opens North America as a meaningful market. Hong Kong Gifts & Home becomes the gateway to South-East Asian and Australasian buyers. Bags, pouches, and accessories range are expanded.",
//     images: [
//       "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1551215934-37d0573e6624?w=500&auto=format&fit=crop"
//     ],
//     angle: -30,
//   },
//   {
//     id: 5,
//     year: "2022-2024",
//     title: "Full Global Exhibition Presence Reinstated",
//     description: "Exhibition calendar restored at full scale. New collections unveiled at Heimtextil, Ambiente, Maison & Objet, NY NOW, and the IHGF Delhi Fair. New export markets opened in South-East Asia and the Gulf.",
//     images: [
//       "https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=500&auto=format&fit=crop"
//     ],
//     angle: -60,
//   },
//   {
//     id: 6,
//     year: "2026",
//     title: "A Global Name - The Same Jaipur Studio",
//     description: "Nikita Home Furnishings stands as India's most trusted artisan home textile manufacturer and exporter, with buyers in over 20 countries. The studio address and uncompromising standard remain exactly the same.",
//     images: [
//       "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop",
//       "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop"
//     ],
//     angle: -90,
//   }
// ];

// export default function TimelineSlider() {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const containerRef = useRef(null);

//   // स्क्रॉल ट्रैकिंग के लिए Framer Motion UseScroll
//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start start", "end end"]
//   });

//   // स्क्रॉल प्रोग्रेस के आधार पर रोटेशन वैल्यू (0 से 1 स्क्रॉल = 60 डिग्री से -90 डिग्री रोटेशन)
//   const rawRotation = useTransform(
//     scrollYProgress,
//     [0, 0.2, 0.4, 0.6, 0.8, 1],
//     [60, 30, 0, -30, -60, -90]
//   );
  
//   // रोटेशन को सुपर स्मूथ बनाने के लिए स्प्रिंग फिजिक्स
//   const wheelRotation = useSpring(rawRotation, { stiffness: 80, damping: 20 });

//   // स्क्रॉल के आधार पर एक्टिव इंडेक्स सेट करना
//   useEffect(() => {
//     return scrollYProgress.onChange((v) => {
//       const index = Math.min(
//         Math.floor(v * timelineData.length),
//         timelineData.length - 1
//       );
//       setActiveIndex(index);
//     });
//   }, [scrollYProgress]);

//   // बटन क्लिक द्वारा हैंडलर
//   const handleNext = () => {
//     if (activeIndex < timelineData.length - 1) {
//       const nextTarget = (activeIndex + 1) / (timelineData.length - 1);
//       window.scrollTo({
//         top: containerRef.current.offsetTop + nextTarget * (containerRef.current.offsetHeight - window.innerHeight),
//         behavior: 'smooth'
//       });
//     }
//   };

//   const handlePrev = () => {
//     if (activeIndex > 0) {
//       const prevTarget = (activeIndex - 1) / (timelineData.length - 1);
//       window.scrollTo({
//         top: containerRef.current.offsetTop + prevTarget * (containerRef.current.offsetHeight - window.innerHeight),
//         behavior: 'smooth'
//       });
//     }
//   };

//   return (
//     // कंटेनर की हाइट 400vh है ताकि स्क्रॉल करने के लिए पर्याप्त जगह मिले और स्मूथ रोटेशन इफ़ेक्ट दिखे
//     <div ref={containerRef} className="relative h-[400vh] bg-[#F9F8F3] text-[#5A634E]">
//       <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-between overflow-hidden px-6 py-12">
        
//         {/* शीर्ष भाग: हर साल की 3 इमेजेस का ग्रिड (Smooth Transition) */}
//         <div className="relative flex h-[40vh] w-full max-w-5xl items-center justify-center">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={activeIndex}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.6, ease: "easeInOut" }}
//               className="grid w-full grid-cols-3 gap-6"
//             >
//               {timelineData[activeIndex].images.map((img, idx) => (
//                 <div 
//                   key={idx} 
//                   className={`overflow-hidden rounded-md shadow-md bg-white ${
//                     idx === 1 ? "transform -translate-y-4 scale-105 z-10" : ""
//                   }`} // बीच वाली इमेज को थोड़ा बड़ा और ऊपर दिखाने के लिए (Figma Premium Vibe)
//                 >
//                   <img
//                     src={img}
//                     alt={`Timeline ${idx}`}
//                     className="h-full w-full object-cover aspect-[4/3]"
//                   />
//                 </div>
//               ))}
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {/* मध्य भाग: कंटेंट (Title & Description) */}
//         <div className="z-10 mt-4 max-w-2xl text-center">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={activeIndex}
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               transition={{ duration: 0.4 }}
//             >
//               <span className="font-serif text-3xl font-bold tracking-wide block mb-2">
//                 {timelineData[activeIndex].year}
//               </span>
//               <h2 className="font-serif text-2xl font-semibold mb-3">
//                 {timelineData[activeIndex].title}
//               </h2>
//               <p className="text-sm leading-relaxed text-[#7A846E] px-4">
//                 {timelineData[activeIndex].description}
//               </p>
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {/* निचला भाग: रोटेटिंग व्हील (Rotating Arc Timeline) */}
//         <div className="relative flex h-[25vh] w-full items-end justify-center">
//           {/* आर्किटेक्चरल आर्क व्हील */}
//           <motion.div
//             style={{ rotate: wheelRotation }}
//             className="absolute bottom-[-450px] flex h-[600px] w-[600px] items-start justify-center rounded-full border-2 border-[#D1D5CB]"
//           >
//             {/* इनर सर्कल लाइन */}
//             <div className="absolute inset-4 rounded-full border border-dashed border-[#E2E4DF]" />

//             {/* व्हील पर इयर्स (Years) के पॉइंट्स */}
//             {timelineData.map((item, index) => {
//               // सर्कल परिधि पर वर्षों को फैलाना
//               const currentAngle = item.angle; 
//               return (
//                 <div
//                   key={item.id}
//                   className="absolute origin-[300px_300px]"
//                   style={{
//                     transform: `rotate(${-currentAngle}deg) translateY(10px)`,
//                     left: "calc(50% - 40px)",
//                   }}
//                 >
//                   <button
//                     className={`text-xs font-semibold tracking-wider transition-all duration-300 ${
//                       index === activeIndex
//                         ? "scale-125 text-[#5A634E] font-bold"
//                         : "text-[#BCBFA8] opacity-60 hover:opacity-100"
//                     }`}
//                   >
//                     {item.year.split("-")[0]} {/* स्पेस कम करने के लिए केवल शुरुआती साल */}
//                   </button>
//                   {/* टिक मार्क */}
//                   <div className="mx-auto mt-1 h-2 w-[1px] bg-[#5A634E]" />
//                 </div>
//               );
//             })}
//           </motion.div>

//           {/* फिग्मा जैसा बॉटम स्लाइडर नेविगेशन बार */}
//           <div className="z-20 mb-4 flex items-center gap-8">
//             <button
//               onClick={handlePrev}
//               disabled={activeIndex === 0}
//               className="rounded-full p-2 text-[#5A634E] transition hover:bg-[#EAE9E2] disabled:opacity-30"
//             >
//               <ChevronLeft size={20} />
//             </button>

//             {/* प्रोग्रेस लाइन इंडिकेटर */}
//             <div className="relative h-[2px] w-48 bg-[#E2E4DF]">
//               <motion.div
//                 className="absolute h-full bg-[#5A634E]"
//                 style={{
//                   width: `${((activeIndex + 1) / timelineData.length) * 100}%`,
//                 }}
//                 transition={{ ease: "easeInOut" }}
//               />
//             </div>

//             <button
//               onClick={handleNext}
//               disabled={activeIndex === timelineData.length - 1}
//               className="rounded-full p-2 text-[#5A634E] transition hover:bg-[#EAE9E2] disabled:opacity-30"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium high-res assets retrieved from your actual Figma-based timeline search results
const timelineData = [
  {
    id: 1,
    year: "2006",
    title: "Nikita Home Furnishings is Established",
    paragraphs: [
      "Company registered and studio opened at Govind Nagar West, Jaipur. Initial production focused on kantha bedcovers, quilts, throws, and block-printed bedsheets.",
      "The founder, Joy Kumar Maheshwari, brings deep roots in the Rajasthani textile trade and an uncompromising standard from the first day of production. First domestic trade enquiries received within weeks of opening."
    ],
    // The exact 3-image layout matching Figma screenshot image_fa34cd.png (flanked by adjacent preview assets)
    images: [
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0", // Left: Next event teaser
      "http://googleusercontent.com/image_collection/image_retrieval/8320105739612527724_0", // Center: Jaipuri quilt/bedroom (Active)
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0"  // Right: Next event teaser
    ],
    angle: 60, // Symmetrical coordinate on the arc
  },
  {
    id: 2,
    year: "2008-2010",
    title: "First International Trade Fair Exhibitions",
    paragraphs: [
      "Trade platforms in Mumbai and New Delhi opened the floor to the world's largest home textile fair, aligned with buyers from over 40 countries. This introduced our artisan hand-printed collection to premium global boutique chains.",
      "The warm responses attracted a distinct network of international showroom distributors, establishing European collaborations that double-down on Nikita's creative heritage. Production capacity is expanded to meet demand."
    ],
    // Matching image_fa34ae.png
    images: [
      "http://googleusercontent.com/image_collection/image_retrieval/8320105739612527724_0", // Left: 2006 Bedroom
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0", // Center: Showroom display (Active)
      "http://googleusercontent.com/image_collection/image_retrieval/9859142491169099678_0"  // Right: 2012 Paris Collection
    ],
    angle: 36,
  },
  {
    id: 3,
    year: "2012-2014",
    title: "Maison & Objet and Top Drawer Entered",
    paragraphs: [
      "Paris and London exhibitions are added to the international fair calendar. Maison & Objet introduces Nikita's artisan collections to Europe's most design-forward buyers, concept stores, and lifestyle retailers.",
      "Top Drawer London establishes relationships with British independent boutique design houses and department store buyers that continue to flourish to the present day."
    ],
    // Matching image_fa31bf.png
    images: [
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0", // Left: Showroom
      "http://googleusercontent.com/image_collection/image_retrieval/9859142491169099678_0", // Center: Boutique hanger garments (Active)
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0"  // Right: Showroom
    ],
    angle: 12,
  },
  {
    id: 4,
    year: "2016-2018",
    title: "New York and Hong Kong Exhibitions Begin",
    paragraphs: [
      "NY NOW New York opens North America as a meaningful market. US buyers, seeking genuine artisan sourcing and ethical manufacturing, respond strongly to our classic collections.",
      "Hong Kong Gifts & Home becomes the gateway to South-East Asian and Australasian buyers. Bags, pouches, and accessory ranges are expanded, driven by high demand from American and Asian wholesale buyers."
    ],
    // Matching image_fa31c8.png
    images: [
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0", // Left: Showroom
      "http://googleusercontent.com/image_collection/image_retrieval/5850757660442711740_0", // Center: Modern trade show hall (Active)
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0"  // Right: Showroom
    ],
    angle: -12,
  },
  {
    id: 5,
    year: "2022-2024",
    title: "Full Global Exhibition Presence Reinstated",
    paragraphs: [
      "Exhibition calendar restored at full scale. New collections unveiled at Heimtextil, Ambiente, Maison & Objet, NY NOW, and the IHGF Delhi Fair. Buyer relationships resume in person.",
      "New export markets opened in South-East Asia and the Gulf. The response from buyers returning to the stands confirms that the Nikita brand has, if anything, grown stronger during the period of disruption."
    ],
    // Matching image_fa31e4.png
    images: [
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0", // Left: Showroom
      "http://googleusercontent.com/image_collection/image_retrieval/7911121687003143256_0", // Center: White textiles installation (Active)
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0"  // Right: Showroom
    ],
    angle: -36,
  },
  {
    id: 6,
    year: "2026",
    title: "A Global Name - The Same Jaipur Studio",
    paragraphs: [
      "Nikita Home Furnishings stands as India's most trusted artisan home textile manufacturer and exporter, with an established presence at the world's most important trade fairs, buyers in over 20 countries, and active production.",
      "The studio address is the same as it has always been. The artisan families at the heart of the production are the same ones who worked the first collections. The standards have never been lower than on day one."
    ],
    // Matching image_fa3205.png
    images: [
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0", // Left: Showroom
      "http://googleusercontent.com/image_collection/image_retrieval/15148172857180748952_0", // Center: Jaipur craft studio linens (Active)
      "http://googleusercontent.com/image_collection/image_retrieval/8227643171010110850_0"  // Right: Showroom
    ],
    angle: -60,
  }
];

export default function TimelineCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartY = useRef(0);
  const scrollAccumulator = useRef(0);
  const containerRef = useRef(null);

  // Smooth scroll translation logic matching figma wheel behavior
  const handleWheel = (e) => {
    // Prevent default scroll only if hovering within our main interactive layout
    if (e.deltaY !== 0) {
      scrollAccumulator.current += e.deltaY;
      if (Math.abs(scrollAccumulator.current) > 150) {
        if (scrollAccumulator.current > 0) {
          // Scroll Down -> Go Next
          if (activeIndex < timelineData.length - 1) {
            setActiveIndex((prev) => prev + 1);
          }
        } else {
          // Scroll Up -> Go Prev
          if (activeIndex > 0) {
            setActiveIndex((prev) => prev - 1);
          }
        }
        scrollAccumulator.current = 0;
      }
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        if (activeIndex < timelineData.length - 1) setActiveIndex((prev) => prev + 1);
      } else {
        if (activeIndex > 0) setActiveIndex((prev) => prev - 1);
      }
      touchStartY.current = touchEndY;
    }
  };

  const selectIndex = (index) => {
    if (index >= 0 && index < timelineData.length) {
      setActiveIndex(index);
    }
  };

  // Base rotation of entire wheel so active index is at 0 degrees (top apex)
  const activeOffsetAngle = timelineData[activeIndex].angle;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="relative flex h-screen w-full flex-col justify-between overflow-hidden bg-[#FAF9F5] px-8 py-10 font-sans text-[#4C5840] select-none"
    >
      {/* Import Premium Serif Fonts */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');
        .font-serif-luxury {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-sans-clean {
          font-family: 'Montserrat', sans-serif;
        }
      `}} />

      {/* TOP: FIGMA Carousel Grid (3-Image Symmetrical Layout) */}
      <div className="relative mx-auto mt-2 flex w-full max-w-6xl items-center justify-between gap-6 px-12 h-[34%]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.75, ease: [0.19, 1, 0.22, 1] }}
            className="grid w-full grid-cols-3 items-center justify-center gap-12"
          >
            {/* LEFT IMAGE (Adjacent event preview, matching image_fa34cd.png layout) */}
            <div className="flex justify-center opacity-40 transition-opacity duration-500 hover:opacity-65">
              <div className="h-[230px] w-[172px] overflow-hidden rounded-[2px] border border-[#4C5840]/10 shadow-[0_8px_20px_rgba(76,88,64,0.06)]">
                <img
                  src={timelineData[activeIndex].images[0]}
                  alt="Previous Year Preview"
                  className="h-full w-full object-cover grayscale-[20%]"
                />
              </div>
            </div>

            {/* CENTER ACTIVE IMAGE (Prominent focal point sitting atop arc apex) */}
            <div className="z-10 flex justify-center">
              <div className="relative h-[270px] w-[202px] overflow-hidden rounded-[3px] border border-[#4C5840]/25 shadow-[0_12px_28px_rgba(76,88,64,0.12)]">
                <img
                  src={timelineData[activeIndex].images[1]}
                  alt={timelineData[activeIndex].year}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* RIGHT IMAGE (Adjacent event preview, matching image_fa34cd.png layout) */}
            <div className="flex justify-center opacity-40 transition-opacity duration-500 hover:opacity-65">
              <div className="h-[230px] w-[172px] overflow-hidden rounded-[2px] border border-[#4C5840]/10 shadow-[0_8px_20px_rgba(76,88,64,0.06)]">
                <img
                  src={timelineData[activeIndex].images[2]}
                  alt="Next Year Preview"
                  className="h-full w-full object-cover grayscale-[20%]"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* MID-BOTTOM: Interactive Arc and Texts */}
      <div className="relative flex flex-grow flex-col justify-end">
        
        {/* ROTATING ARC WHEEL WITH PRECISION TICKS */}
        <div className="absolute inset-x-0 bottom-[-280px] flex justify-center pointer-events-none">
          <div className="relative h-[680px] w-[680px]">
            
            {/* The Concentric Semi-Circle Line Art System (Figma Style) */}
            <motion.div
              animate={{ rotate: -activeOffsetAngle }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
              className="absolute inset-0 rounded-full border-t border-b border-[#4C5840]/30"
            >
              {/* Secondary Internal Double-ruled Accent Circle */}
              <div className="absolute inset-[15px] rounded-full border-t border-[#4C5840]/15" />

              {/* Radial ticks and text nodes along the arch */}
              {timelineData.map((item, idx) => {
                const isSelected = idx === activeIndex;
                const radians = (item.angle * Math.PI) / 180;
                // Position vectors for each tick label
                const x = 340 + 340 * Math.sin(radians);
                const y = 340 - 340 * Math.cos(radians);

                return (
                  <div
                    key={item.id}
                    onClick={() => selectIndex(idx)}
                    className="absolute cursor-pointer select-none pointer-events-auto"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="flex flex-col items-center">
                      {/* Interactive Year Node text always rotated upright */}
                      <motion.span
                        animate={{ 
                          scale: isSelected ? 1.15 : 0.9,
                          color: isSelected ? "#4C5840" : "#BCBFA8"
                        }}
                        transition={{ duration: 0.4 }}
                        className={`font-sans-clean text-[10px] tracking-widest font-semibold ${
                          isSelected ? "font-bold text-[#4C5840]" : "text-[#4C5840]/40"
                        }`}
                      >
                        {item.year}
                      </motion.span>
                      
                      {/* Vertical line connector (tick) */}
                      <div className={`mt-1.5 h-3 w-[1px] transition-all duration-300 ${
                        isSelected ? "bg-[#4C5840] h-4" : "bg-[#4C5840]/25"
                      }`} />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* YEAR CONTENT BLOCK - Sits Centrally under active image, atop Arc Apex */}
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center select-text">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center h-[240px]"
            >
              {/* Year Apex Identifier */}
              <span className="font-serif-luxury text-xl font-medium italic text-[#4C5840]/80 tracking-wide">
                {timelineData[activeIndex].year}
              </span>

              {/* Event Title */}
              <h2 className="font-serif-luxury mt-2 text-[26px] font-semibold text-[#4C5840] leading-tight tracking-normal">
                {timelineData[activeIndex].title}
              </h2>

              {/* Split Paragraphs */}
              <div className="mt-5 space-y-4 max-w-2xl text-[12.5px] leading-[1.75] font-sans-clean text-[#6B7462]">
                {timelineData[activeIndex].paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="font-light tracking-wide text-center">
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM: Horizontal Scroll Progress Indicator & Controller Buttons */}
        <div className="relative z-20 mx-auto mt-2 flex w-full max-w-md items-center justify-between px-10 pb-4">
          {/* Left Navigation Arrow */}
          <button
            onClick={() => selectIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="group flex items-center justify-center p-2 text-[#4C5840]/60 transition-all duration-300 hover:text-[#4C5840] disabled:opacity-20"
          >
            <span className="text-sm font-light tracking-wider transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </button>

          {/* Symmetrical timeline Slider Progress Line */}
          <div className="relative mx-4 flex-grow h-[1.5px] bg-[#4C5840]/10 rounded-full">
            <motion.div
              className="absolute top-0 h-full bg-[#4C5840]"
              animate={{
                left: `${(activeIndex / (timelineData.length - 1)) * 80}%`,
                width: '20%'
              }}
              transition={{ type: "spring", stiffness: 85, damping: 18 }}
            />
          </div>

          {/* Right Navigation Arrow */}
          <button
            onClick={() => selectIndex(activeIndex + 1)}
            disabled={activeIndex === timelineData.length - 1}
            className="group flex items-center justify-center p-2 text-[#4C5840]/60 transition-all duration-300 hover:text-[#4C5840] disabled:opacity-20"
          >
            <span className="text-sm font-light tracking-wider transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}