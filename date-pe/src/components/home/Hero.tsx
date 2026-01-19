
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowDownCircle, ChevronDown } from "lucide-react";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  // Enhanced scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const elements = document.querySelectorAll('.scroll-animate');
      
      elements.forEach((el) => {
        const elementTop = (el as HTMLElement).offsetTop;
        if (scrollPosition > elementTop - window.innerHeight + 100) {
          el.classList.add('animate-fade-in');
        }
      });
      
      // Parallax effect for hero section
      if (heroRef.current) {
        const parallaxOffset = scrollPosition * 0.4;
        heroRef.current.style.transform = `translateY(${parallaxOffset}px)`;
      }
      
      // Text reveal effect
      if (textRef.current) {
        const opacity = Math.max(1 - scrollPosition / 500, 0);
        textRef.current.style.opacity = opacity.toString();
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Enhanced gradient background with particle effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-bloom-light-yellow via-white to-bloom-light-purple opacity-70"></div>
      
      {/* Animated blobs */}
      <div className="absolute -top-64 -right-64 w-[40rem] h-[40rem] rounded-full bg-gradient-to-r from-bloom-yellow to-bloom-bright-yellow opacity-30 animate-float blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-r from-bloom-light-purple to-bloom-purple opacity-30 animate-float blur-3xl" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] rounded-full bg-gradient-to-r from-bloom-light-blue to-bloom-blue opacity-20 animate-float blur-2xl" style={{ animationDelay: "4s" }}></div>
      
      <div ref={heroRef} className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
        <div ref={textRef} className="space-y-8">
          <div className="inline-flex items-center justify-center mb-6 bg-gradient-to-r from-bloom-yellow to-bloom-bright-yellow rounded-full px-6 py-3 text-sm font-medium text-black animate-fade-in shadow-lg shadow-bloom-yellow/20 transform hover:scale-105 transition-transform">
            <Heart className="w-4 h-4 mr-2 fill-bloom-yellow stroke-black" />
            <span>Experience the future of connections</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 animate-slide-up leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-bloom-black via-bloom-blue to-bloom-purple">
              Where Meaningful Connections 
            </span>
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-bloom-yellow to-bloom-pink">
              Bloom Into Life
            </span>
          </h1>
          
          <p className="text-xl text-bloom-dark-gray opacity-90 mb-8 max-w-2xl mx-auto animate-slide-up scroll-animate" style={{ animationDelay: "0.2s" }}>
            Discover authentic connections in a fun, secure environment where community growth is rewarded and genuine interactions are valued above all.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up scroll-animate" style={{ animationDelay: "0.3s" }}>
            <Link 
              to="/profile" 
              className="px-10 py-4 rounded-full bg-gradient-to-r from-bloom-yellow to-bloom-bright-yellow text-black font-medium shadow-xl hover:shadow-2xl shadow-bloom-yellow/30 transition-all hover:translate-y-[-4px] text-lg"
            >
              Create Your Profile
            </Link>
            <Link 
              to="/matches" 
              className="px-10 py-4 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-bloom-dark-gray font-medium transition-all hover:shadow-xl hover:translate-y-[-4px] text-lg hover:bg-white"
            >
              Explore Matches
            </Link>
          </div>
        </div>
        
        <div className="absolute top-[65vh] left-[45%] transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-bloom-dark-gray">
            <span className="text-sm font-medium">Scroll to discover</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
