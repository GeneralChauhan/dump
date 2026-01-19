
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import { Heart, Sparkles, Star, CheckCircle, ArrowRight, Quote, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Mock API service - in a real app, this would be replaced with actual API calls
const fetchStats = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    userCount: 25432,
    matchRate: 86,
    satisfactionScore: 94,
    activeCommunities: 120
  };
};

const fetchTestimonials = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    {
      id: 1,
      name: "Sarah J.",
      role: "Designer, 28",
      content: "Bloom changed how I approach dating. The security deposit feature means everyone is serious about making connections.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      name: "Michael T.",
      role: "Engineer, 32",
      content: "I was skeptical at first, but the quality of matches is so much better than other apps I've tried. Worth every penny!",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Jessica M.",
      role: "Marketing, 29",
      content: "I love that I can invite my friends and we all benefit. It creates a much safer environment for meaningful connections.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];
};

const Index = () => {
  // Animation refs
  const statsRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Fetch data from our mock API
  const { data: stats } = useQuery({
    queryKey: ['homeStats'],
    queryFn: fetchStats,
  });
  
  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
  });
  
  // Scroll animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe elements for scroll animations
    [statsRef, testimonialRef, ctaRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    
    const animateItems = document.querySelectorAll('.animate-on-scroll');
    animateItems.forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      [statsRef, testimonialRef, ctaRef].forEach(ref => {
        if (ref.current) observer.unobserve(ref.current);
      });
      
      animateItems.forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);

  return (
    <AppLayout hideNavigation={true}>
      <Hero />
      <Features />
      
      
      {/* Stats Section with API Data */}
      <div ref={statsRef} className="px-4 py-24 bg-gradient-to-br from-bloom-ultra-light-blue to-white opacity-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-bloom-blue to-bloom-purple">Growing Community</h2>
            <p className="text-bloom-dark-gray max-w-xl mx-auto">Join thousands who have already discovered better connections with Bloom.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard 
              value={stats?.userCount || '20K+'}
              label="Active Users"
              icon={<Users className="w-5 h-5 text-bloom-yellow" />}
            />
            <StatCard 
              value={`${stats?.matchRate || 82}%`}
              label="Match Rate"
              icon={<Heart className="w-5 h-5 text-bloom-pink" />}
            />
            <StatCard 
              value={`${stats?.satisfactionScore || 90}%`}
              label="Satisfaction"
              icon={<Star className="w-5 h-5 text-bloom-bright-yellow" />}
            />
            <StatCard 
              value={stats?.activeCommunities || 100}
              label="Communities"
              icon={<Sparkles className="w-5 h-5 text-bloom-light-purple" />}
            />
          </div>
        </div>
      </div>
      
      {/* How Bloom Works - Enhanced version */}
      <div className="px-4 py-24 bg-bloom-gray relative">
        <div className="absolute inset-0 bg-gradient-to-br from-bloom-ultra-light-blue/30 to-bloom-light-yellow/20 opacity-50"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-1 bg-bloom-ultra-light-blue rounded-full text-bloom-blue text-sm font-medium">
            Simple Process
          </div>
          <h2 className="text-4xl font-bold mb-12">How Bloom Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center animate-on-scroll opacity-0" style={{ transitionDelay: "0.1s" }}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-bloom-yellow to-bloom-bright-yellow flex items-center justify-center mb-6 shadow-lg shadow-bloom-yellow/20">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Match & Connect</h3>
              <p className="text-bloom-dark-gray">Find compatible matches based on shared values and start meaningful conversations.</p>
            </div>
            
            <div className="flex flex-col items-center animate-on-scroll opacity-0" style={{ transitionDelay: "0.2s" }}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-bloom-blue to-bloom-light-blue flex items-center justify-center mb-6 shadow-lg shadow-bloom-blue/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Invite & Earn</h3>
              <p className="text-bloom-dark-gray">Invite friends to join Bloom and earn rewards for growing our vibrant community.</p>
            </div>
            
            <div className="flex flex-col items-center animate-on-scroll opacity-0" style={{ transitionDelay: "0.3s" }}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-bloom-purple to-bloom-light-purple flex items-center justify-center mb-6 shadow-lg shadow-bloom-purple/20">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bloom Together</h3>
              <p className="text-bloom-dark-gray">Build lasting connections with our interactive features and community events.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials section */}
      <div ref={testimonialRef} className="px-4 py-24 bg-white relative opacity-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-bloom-light-yellow/20 via-white to-bloom-light-purple/20 opacity-50"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 mb-16">
          <div className="inline-block mb-4 px-4 py-1 bg-bloom-ultra-light-blue rounded-full text-bloom-blue text-sm font-medium">
            Success Stories
          </div>
          <h2 className="text-4xl font-bold mb-6">What Our Users Say</h2>
          <p className="text-bloom-dark-gray max-w-xl mx-auto">
            Join thousands of happy users who have found meaningful connections through Bloom.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          {testimonials?.map((testimonial, index) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-on-scroll opacity-0" style={{ transitionDelay: `${0.1 * index}s` }}>
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full mr-4 border-2 border-bloom-yellow" 
                />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-bloom-dark-gray">{testimonial.role}</p>
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-bloom-yellow opacity-30" />
                <p className="text-bloom-dark-gray">{testimonial.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced CTA section */}
      <div ref={ctaRef} className="px-4 py-24 bg-gradient-to-br from-bloom-blue/90 via-bloom-blue/80 to-bloom-purple/90 text-white opacity-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Bloom?</h2>
          <p className="text-white/80 mb-10 text-lg max-w-2xl mx-auto">
            Join our growing community of authentic connections and start your journey today. It takes less than 2 minutes to create your profile.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link 
              to="/profile" 
              className="inline-block px-8 py-4 rounded-full bg-white text-bloom-blue font-medium shadow-lg shadow-black/20 transition-transform hover:translate-y-[-2px] group"
            >
              Create Your Profile
              <ArrowRight className="inline-block ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/referrals"
              className="inline-block px-8 py-4 rounded-full bg-transparent border border-white/30 text-white font-medium hover:bg-white/10 transition-all"
            >
              Learn About Rewards
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}

const StatCard = ({ value, label, icon }: StatCardProps) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 text-center animate-on-scroll opacity-0">
    <div className="w-10 h-10 rounded-full bg-bloom-ultra-light-blue flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-bloom-dark-gray">{label}</div>
  </div>
);

export default Index;
