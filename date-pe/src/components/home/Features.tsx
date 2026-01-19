
import React, { useEffect, useRef } from "react";
import { Users, MessageCircle, DollarSign, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const Features = () => {
  // Animation for reveal on scroll
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card) => {
      observer.observe(card);
    });
    
    return () => {
      featureCards.forEach((card) => {
        observer.unobserve(card);
      });
    };
  }, []);

  return (
    <div ref={featuresRef} className="px-4 py-24 bg-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-bloom-ultra-light-blue/50 via-white to-bloom-light-yellow/30 opacity-70"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
      
      <div className="max-w-3xl mx-auto text-center mb-16 relative z-10">
        <div className="inline-block mb-4 px-4 py-1 bg-bloom-ultra-light-blue rounded-full text-bloom-blue text-sm font-medium">
          Our Unique Approach
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-bloom-black to-bloom-blue">Why Choose Bloom?</h2>
        <p className="text-bloom-dark-gray max-w-xl mx-auto text-lg">
          Our innovative platform combines security, authentic connections, and community rewards to create a genuinely different dating experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto relative z-10">
        <FeatureCard
          icon={<Users className="text-bloom-blue" />}
          title="Community Rewards"
          description="Build the community you want to be part of. Invite friends and earn rewards as our network grows."
          delay={0.1}
        />
        
        <FeatureCard
          icon={<Shield className="text-bloom-blue" />}
          title="Secure Interactions"
          description="Our security deposit system ensures genuine intentions and safer dating experiences for everyone."
          delay={0.2}
        />
        
        <FeatureCard
          icon={<MessageCircle className="text-bloom-blue" />}
          title="Meaningful Connections"
          description="Our carefully designed matching system helps you find compatible connections based on values and interests."
          delay={0.3}
        />
        
        <FeatureCard
          icon={<DollarSign className="text-bloom-blue" />}
          title="Transparent System"
          description="Clear, upfront rules about payments and referrals with no hidden fees or surprises at any point."
          delay={0.4}
        />
      </div>
      
      <div className="mt-24 max-w-4xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-3xl p-8 md:p-12 border border-gray-100 relative z-10 opacity-0 feature-card" style={{ transitionDelay: "0.5s" }}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-3/5">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-bloom-black">How Bloom Stands Out</h3>
            <p className="text-bloom-dark-gray mb-6">Unlike traditional dating apps, Bloom creates an ecosystem where everyone benefits from building a better community.</p>
            
            <ul className="space-y-3">
              {['No swiping fatigue', 'Security by design', 'Community-focused growth', 'Reward-based system'].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="text-bloom-blue h-5 w-5 flex-shrink-0" />
                  <span className="text-bloom-dark-gray">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:w-2/5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-bloom-yellow to-bloom-bright-yellow rounded-2xl transform rotate-3 scale-105 opacity-30 blur-md"></div>
              <div className="relative bg-gradient-to-r from-bloom-yellow to-bloom-bright-yellow p-1 rounded-2xl">
                <div className="bg-white rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-bloom-blue to-bloom-purple">94%</div>
                    <p className="text-bloom-dark-gray font-medium">User satisfaction</p>
                  </div>
                  
                  <div className="bg-bloom-ultra-light-blue h-px w-full my-4"></div>
                  
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1 text-bloom-blue">3x</div>
                      <p className="text-xs text-bloom-dark-gray">More meaningful matches</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1 text-bloom-blue">80%</div>
                      <p className="text-xs text-bloom-dark-gray">Lower ghosting rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 feature-card" style={{ transitionDelay: `${delay}s` }}>
    <CardContent className="p-8">
      <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-r from-bloom-ultra-light-blue to-bloom-light-blue/30">
        <div className="w-8 h-8">{icon}</div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-bloom-black">{title}</h3>
      <p className="text-bloom-dark-gray">{description}</p>
    </CardContent>
  </Card>
);

export default Features;
