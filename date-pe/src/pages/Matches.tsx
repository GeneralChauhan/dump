import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import SwipeCard from "@/components/matches/SwipeCard";
import { useToast } from "@/hooks/use-toast";
import { Heart, Filter, MapPin, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const mockProfiles = [
  {
    id: 1,
    name: "Emma",
    age: 28,
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
    bio: "Passionate photographer and coffee enthusiast. Love hiking on weekends and exploring new cafes in the city.",
    interests: ["Photography", "Coffee", "Hiking", "Travel"],
    location: "San Francisco, CA",
    distance: "5 miles away"
  },
  {
    id: 2,
    name: "Olivia",
    age: 26,
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
    bio: "Yoga instructor who loves cooking plant-based meals. Looking for someone to share adventures and quiet moments with.",
    interests: ["Yoga", "Cooking", "Reading", "Nature"],
    location: "Oakland, CA",
    distance: "8 miles away"
  },
  {
    id: 3,
    name: "Sophia",
    age: 29,
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
    bio: "Tech professional by day, amateur painter by night. I enjoy live music, art galleries, and trying new restaurants.",
    interests: ["Art", "Music", "Food", "Technology"],
    location: "Berkeley, CA",
    distance: "12 miles away"
  }
];

const Matches = () => {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);
  
  const handleSwipeLeft = () => {
    if (currentProfileIndex < mockProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      toast({
        title: "No more profiles",
        description: "Check back later for more matches!",
      });
    }
  };
  
  const handleSwipeRight = () => {
    toast({
      title: "It's a match!",
      description: `You and ${mockProfiles[currentProfileIndex].name} like each other!`,
      variant: "default",
    });
    
    if (currentProfileIndex < mockProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      toast({
        title: "No more profiles",
        description: "Check back later for more matches!",
      });
    }
  };
  
  const currentProfile = mockProfiles[currentProfileIndex];

  return (
    <AppLayout>
      <div className="relative w-full min-h-screen bg-gradient-to-br from-white via-bloom-ultra-light-blue to-bloom-light-pink/20">
        <div className="max-w-6xl mx-auto px-4 py-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-bloom-blue to-bloom-purple">Discover</h1>
          
          {!isMobile && (
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
          )}
        </div>
        
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
          <div className={`flex justify-center items-center ${isMobile ? 'w-full' : 'w-7/12'} mx-auto md:mx-0`}>
            {currentProfileIndex < mockProfiles.length ? (
              <div className="w-full max-w-sm animate-fade-in">
                <SwipeCard
                  photo={currentProfile.photo}
                  name={currentProfile.name}
                  age={currentProfile.age}
                  bio={currentProfile.bio}
                  interests={currentProfile.interests}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl max-w-sm w-full">
                <div className="text-6xl mb-4">🌱</div>
                <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-bloom-blue to-bloom-purple">No More Profiles</h2>
                <p className="text-bloom-dark-gray mb-6">
                  We're working on finding more matches for you. Check back soon!
                </p>
                <button 
                  onClick={() => setCurrentProfileIndex(0)} 
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-bloom-blue to-bloom-light-blue text-white font-medium transition-all hover:shadow-lg hover:translate-y-[-2px]"
                >
                  Restart Demo
                </button>
              </div>
            )}
          </div>
          
          {!isMobile && currentProfileIndex < mockProfiles.length && (
            <div className="w-5/12 hidden md:block">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 animate-slide-up">
                <h2 className="text-2xl font-bold mb-2">{currentProfile.name}, {currentProfile.age}</h2>
                
                <div className="flex items-center text-bloom-dark-gray mb-6">
                  <MapPin size={16} className="mr-1" />
                  <span>{currentProfile.location}</span>
                  <span className="mx-2">•</span>
                  <span>{currentProfile.distance}</span>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-bloom-dark-gray">{currentProfile.bio}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest, index) => (
                      <span key={index} className="px-3 py-1 bg-bloom-light-purple/20 text-bloom-purple rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center mt-10">
                  <button 
                    onClick={handleSwipeLeft}
                    className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95 border border-gray-200"
                  >
                    <X className="w-7 h-7 text-red-500" />
                  </button>
                  
                  <button 
                    onClick={handleSwipeRight}
                    className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-bloom-blue to-bloom-light-blue rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart className="w-7 h-7 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Matches;
