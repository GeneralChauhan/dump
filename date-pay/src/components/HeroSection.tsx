
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden py-12 sm:py-16 lg:py-20 mb-8">
      {/* Background circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-coral-100 opacity-50 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sage-100 opacity-50 blur-3xl"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <div className="animate-slide-in">
              <span className="inline-block rounded-full bg-coral-100 px-3 py-1 text-sm font-medium text-coral-800 mb-4">
                Dating Reimagined
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Dating with <span className="text-coral-500">Security</span> and <span className="text-coral-500">Rewards</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                DatePay revolutionizes online dating with a secure deposit system and lucrative referral program. 
                Connect authentically knowing commitments are backed by security, and earn rewards for growing our community.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <Button size="lg" className="bg-coral-500 hover:bg-coral-600 text-white button-highlight">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-coral-200 text-coral-600 hover:bg-coral-50 button-highlight">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center lg:justify-end animate-scale-in">
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white/80 backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600"
                  alt="DatePay mobile app preview"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" 
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Jessica, 28</p>
                      <p className="text-xs text-white/80">New York, NY</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -right-8 -top-8 h-16 w-40 rounded-lg glass-card p-3 animate-float">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-coral-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-coral-500">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Match Alert</p>
                    <p className="text-xs text-gray-600">New connection!</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 h-16 w-40 rounded-lg glass-card p-3 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-sage-500">
                      <path d="M12 2v6.5" />
                      <path d="M20 14v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3" />
                      <path d="M18 8.5V7h0a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3h0v1.5" />
                      <path d="M12 17v-6" />
                      <path d="M9 11h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Deposit Secured</p>
                    <p className="text-xs text-gray-600">$50.00</p>
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

export default HeroSection;
