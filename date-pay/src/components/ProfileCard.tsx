
import React, { useState, useRef } from 'react';
import { Heart, X, MessageCircle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSwipeable } from 'react-swipeable';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileCardProps {
  id: string; // This should be the user_id, not the profile id
  name: string;
  age: number;
  location: string;
  image: string;
  bio: string;
  depositAmount?: number;
  onSwipe?: (direction: 'left' | 'right') => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  age,
  location,
  image,
  bio,
  depositAmount,
  onSwipe
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSwiped = async (direction: 'left' | 'right') => {
    if (!user || isProcessing) return;
    
    // Validate that we have a valid user ID
    if (!id || id === user.id) {
      console.error('Invalid user ID for swipe:', { id, currentUserId: user.id });
      toast({
        title: "Error",
        description: "Invalid profile. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Processing ${direction} swipe for user ${id} by user ${user.id}`);
    console.log(`Profile name: ${name}, User ID: ${id}, Current user ID: ${user.id}`);
    setIsProcessing(true);
    setSwipeDirection(direction);
    
    try {
      const action = direction === 'right' ? 'like' : 'pass';
      
      console.log(`Recording ${action} swipe in database...`);
      console.log(`Inserting swipe: swiper_id=${user.id}, swiped_id=${id}, action=${action}`);
      
      // Record the swipe in the database
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: id,
          action: action
        });

      if (swipeError) {
        console.error('Error recording swipe:', swipeError);
        console.error('Swipe data attempted:', { swiper_id: user.id, swiped_id: id, action: action });
        toast({
          title: "Error",
          description: "Failed to record your swipe. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log(`Swipe recorded successfully. Action: ${action}`);

      // Show feedback for the swipe action
      if (action === 'like') {
        toast({
          title: "Profile Liked! ❤️",
          description: `You liked ${name}'s profile`,
        });
      } else {
        toast({
          title: "Profile Passed",
          description: `You passed on ${name}'s profile`,
        });
      }

      // Call the parent's onSwipe callback if provided
      if (onSwipe) {
        onSwipe(direction);
      }

      // Reset after animation completes
      setTimeout(() => {
        setSwipeDirection(null);
        setOffset(0);
        setIsProcessing(false);
      }, 300);

    } catch (error) {
      console.error('Error processing swipe:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwiping: (event) => {
      if (isProcessing) return;
      setIsDragging(true);
      setOffset(event.deltaX);
    },
    onSwiped: (event) => {
      if (isProcessing) return;
      setIsDragging(false);
      if (event.deltaX < -100) {
        handleSwiped('left');
      } else if (event.deltaX > 100) {
        handleSwiped('right');
      } else {
        setOffset(0);
      }
    },
    trackMouse: true
  });

  const cardStyle = {
    transform: swipeDirection 
      ? `translateX(${swipeDirection === 'left' ? '-120%' : '120%'}) rotate(${swipeDirection === 'left' ? '-10deg' : '10deg'})` 
      : isDragging 
        ? `translateX(${offset}px) rotate(${offset * 0.05}deg)` 
        : 'translateX(0)',
    transition: isDragging ? 'none' : 'transform 0.3s ease'
  };

  return (
    <div 
      className="w-full max-w-sm mx-auto overflow-hidden"
      {...swipeHandlers}
    >
      <div 
        className={cn(
          "bg-white rounded-xl shadow-lg border border-gray-100 cursor-grab active:cursor-grabbing",
          isProcessing && "pointer-events-none"
        )}
        style={cardStyle}
      >
        <div className="relative">
          <img 
            src={image} 
            alt={name}
            className="w-full h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white text-xl font-semibold">{name}, {age}</h3>
            <p className="text-white/90 text-sm">{location}</p>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4 line-clamp-3">{bio}</p>
          
          {depositAmount && (
            <div className="mb-4 p-3 bg-coral-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Security Deposit</p>
                <p className="text-xl font-bold text-coral-600">${depositAmount.toFixed(2)}</p>
              </div>
              <Button size="sm" variant="outline" className="border-coral-200 text-coral-600 hover:bg-coral-100">
                <Info className="h-4 w-4 mr-1" />
                Details
              </Button>
            </div>
          )}
          
          <div className="flex space-x-3 mt-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex-1 h-12 w-12"
              onClick={() => handleSwiped('left')}
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </Button>
            <Button 
              className="rounded-full bg-gradient-to-r from-pink-rose-500 to-peony-500 hover:from-pink-rose-600 hover:to-peony-600 text-white flex-1 h-12 shadow-lg"
              onClick={() => handleSwiped('right')}
              disabled={isProcessing}
            >
              <Heart className="h-5 w-5 mr-1" />
              Like
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-gray-400 text-center">
            Swipe left to pass, right to like
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
