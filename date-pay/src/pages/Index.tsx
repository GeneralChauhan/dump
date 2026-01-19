
import { useState } from 'react';
import { Shield, Heart, GiftIcon, Users, DollarSign, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';
import ProfileCard from '@/components/ProfileCard';
import ReferralDashboard from '@/components/ReferralDashboard';
import DateRequest from '@/components/DateRequest';
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-coral-100 px-3 py-1 text-sm font-medium text-coral-800 mb-4">
            Why DatePay
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Changing the Dating Game
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            We've redesigned online dating with security and opportunity in mind.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={Shield}
            title="Secure Deposit System"
            description="Our unique deposit system ensures commitment from both parties, making ghosting and time-wasting a thing of the past."
            delay={100}
          />
          <FeatureCard 
            icon={GiftIcon}
            title="Rewarding Referrals"
            description="Invite your friends to join DatePay and earn rewards for each successful signup, creating a community of like-minded individuals."
            delay={200}
          />
          <FeatureCard 
            icon={Heart}
            title="Quality Connections"
            description="With our commitment-based model, you'll connect with people who are serious about dating and building meaningful relationships."
            delay={300}
          />
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 rounded-3xl my-16">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-coral-100 px-3 py-1 text-sm font-medium text-coral-800 mb-4">
              The Process
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How DatePay Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Our platform combines security with incentives for a better dating experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Create Profile</h3>
              <p className="text-gray-600 text-sm">Sign up and create your detailed profile to start matching with others.</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Match & Connect</h3>
              <p className="text-gray-600 text-sm">Match with potential dates and start meaningful conversations.</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Secure Date</h3>
              <p className="text-gray-600 text-sm">Place a security deposit to book a date, ensuring commitment from both sides.</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-coral-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">4. Meet & Return</h3>
              <p className="text-gray-600 text-sm">Meet for your date and get your deposit back upon completion.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Profiles Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-coral-100 px-3 py-1 text-sm font-medium text-coral-800 mb-4">
            Featured Profiles
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Discover Our Community
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Meet some of our amazing members who are looking for meaningful connections.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileCard 
            name="Emma"
            age={26}
            location="Los Angeles, CA"
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600"
            bio="Passionate about photography and outdoor adventures. Looking for someone who enjoys hiking and trying new restaurants."
            depositAmount={50}
          />
          <ProfileCard 
            name="Michael"
            age={30}
            location="Chicago, IL"
            image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600"
            bio="Software engineer by day, amateur chef by night. Looking for someone to share my culinary experiments with."
            depositAmount={75}
          />
          <ProfileCard 
            name="Sophia"
            age={28}
            location="New York, NY"
            image="https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&q=80&w=600"
            bio="Art gallery curator with a love for cinema and fine wine. Seeking intellectual conversations and cultural experiences."
            depositAmount={100}
          />
        </div>
        
        <div className="mt-12 text-center">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => window.location.href = '/auth'}>
            View More Profiles
          </Button>
        </div>
      </section>
      
      {/* Demo Section */}
      <section className="py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-coral-100 px-3 py-1 text-sm font-medium text-coral-800 mb-4">
              Demo: Referral System
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Earn While You Connect
            </h2>
            
            <ReferralDashboard />
          </div>
          
          <div>
            <span className="inline-block rounded-full bg-coral-100 px-3 py-1 text-sm font-medium text-coral-800 mb-4">
              Demo: Date Requests
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Secure Date Invitations
            </h2>
            
            <div className="space-y-6">
              <DateRequest 
                profileName="Alex Johnson"
                profileImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                dateTime="Saturday, Oct 28 • 7:00 PM"
                location="Bluestone Lane, Downtown"
                depositAmount={75}
              />
              
              <DateRequest 
                profileName="Ryan Parker"
                profileImage="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
                dateTime="Sunday, Oct 29 • 2:00 PM"
                location="Central Park, Art Gallery"
                depositAmount={50}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-coral-500 to-coral-600 rounded-3xl my-16 text-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Transform Your Dating Experience?
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/90 mb-8">
            Join DatePay today and experience dating with security, incentives, and quality connections.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 button-highlight" onClick={() => window.location.href = '/auth'}>
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 button-highlight">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
