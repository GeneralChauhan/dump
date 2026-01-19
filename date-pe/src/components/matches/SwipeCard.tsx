
import React, { useState } from "react";
import { Heart, X, MessageCircle, Info } from "lucide-react";

interface SwipeCardProps {
  photo: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  photo,
  name,
  age,
  bio,
  interests,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  
  const handleSwipeLeft = () => {
    setSwipeDirection("left");
    setTimeout(() => {
      onSwipeLeft();
      setSwipeDirection(null);
    }, 300);
  };
  
  const handleSwipeRight = () => {
    setSwipeDirection("right");
    setTimeout(() => {
      onSwipeRight();
      setSwipeDirection(null);
    }, 300);
  };

  return (
    <div 
      className={`w-full max-w-sm mx-auto aspect-[3/4] rounded-3xl overflow-hidden relative shadow-xl transition-all duration-300 ${
        swipeDirection === "left" ? "animate-card-swipe-left" : 
        swipeDirection === "right" ? "animate-card-swipe-right" : ""
      }`}
    >
      {/* Gradient overlay with improved aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/0 to-black/80 z-10"></div>
      
      <img 
        src={photo} 
        alt={name} 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h2 className="text-2xl font-bold text-white flex items-center">
          {name}, {age}
        </h2>
        
        {!showDetails ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {interests.slice(0, 3).map((interest, index) => (
              <span key={index} className="px-2 py-1 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                {interest}
              </span>
            ))}
            {interests.length > 3 && (
              <span className="px-2 py-1 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                +{interests.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <div className="mt-2 animate-fade-in">
            <p className="text-white text-sm mb-3 line-clamp-3">{bio}</p>
            <div className="flex flex-wrap gap-1">
              {interests.map((interest, index) => (
                <span key={index} className="px-2 py-1 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="absolute top-4 right-4 z-20 p-2 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm rounded-full"
      >
        <Info className="w-5 h-5 text-white" />
      </button>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
        <button 
          onClick={handleSwipeLeft}
          className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95"
        >
          <X className="w-6 h-6 text-red-500" />
        </button>
        
        <button 
          onClick={handleSwipeRight}
          className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-bloom-blue to-bloom-light-blue rounded-full shadow-lg transform transition-transform hover:scale-110 active:scale-95"
        >
          <Heart className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
