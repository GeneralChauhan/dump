import React, { useState, useRef } from 'react';
import { Calendar, Clock, DollarSign, MapPin, Heart, X, MessageCircle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSwipeable } from 'react-swipeable';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DateRequest {
  id: string;
  requester_id: string;
  date_time: string;
  location: string;
  deposit_amount: number;
  description?: string;
  requester: {
    user_id: string;
    full_name: string;
    profile_image_url?: string;
    age?: number;
    location?: string;
  };
}

interface DateRequestSwipeProps {
  dateRequests: DateRequest[];
  onSwipe?: (requestId: string, direction: 'left' | 'right') => void;
  isLoading?: boolean;
}

const DateRequestSwipe: React.FC<DateRequestSwipeProps> = ({
  dateRequests,
  onSwipe,
  isLoading
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentRequest = dateRequests[currentIndex];

  const handleSwiped = async (direction: 'left' | 'right') => {
    if (!user || isProcessing || !currentRequest) return;
    
    // Validate that we have a valid user ID
    if (!currentRequest.requester.user_id || currentRequest.requester.user_id === user.id) {
      console.error('Invalid requester ID for date request swipe:', { 
        requesterId: currentRequest.requester.user_id, 
        currentUserId: user.id 
      });
      toast({
        title: "Error",
        description: "Invalid date request. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Processing ${direction} swipe on date request ${currentRequest.id} by user ${user.id}`);
    setIsProcessing(true);
    setSwipeDirection(direction);
    
    try {
      const action = direction === 'right' ? 'like' : 'pass';
      
      console.log(`Recording ${action} swipe on date request in database...`);
      
      // Record the swipe on the date request
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentRequest.requester.user_id,
          action: action
        });

      if (swipeError) {
        console.error('Error recording date request swipe:', swipeError);
        toast({
          title: "Error",
          description: "Failed to record your interest. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // If it's a like, also update the date request status
      if (action === 'like') {
        const { error: updateError } = await supabase
          .from('date_requests')
          .update({ status: 'accepted' })
          .eq('id', currentRequest.id);

        if (updateError) {
          console.error('Error updating date request status:', updateError);
        } else {
          // Create a match since both parties are interested
          const { error: matchError } = await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: currentRequest.requester.user_id
            });

          if (matchError) {
            console.error('Error creating match from date request:', matchError);
          } else {
            toast({
              title: "Date Request Accepted! 🎉",
              description: `You and ${currentRequest.requester.full_name} are now matched for your date!`,
            });
          }
        }
      } else {
        // Update date request status to declined
        const { error: updateError } = await supabase
          .from('date_requests')
          .update({ status: 'declined' })
          .eq('id', currentRequest.id);

        if (updateError) {
          console.error('Error updating date request status:', updateError);
        }
      }

      console.log(`Date request swipe recorded successfully. Action: ${action}`);

      // Show feedback for the swipe action
      if (action === 'like') {
        toast({
          title: "Date Request Liked! ❤️",
          description: `You're interested in ${currentRequest.requester.full_name}'s date proposal!`,
        });
      } else {
        toast({
          title: "Date Request Passed",
          description: `You passed on ${currentRequest.requester.full_name}'s date proposal`,
        });
      }

      // Call the parent's onSwipe callback if provided
      if (onSwipe) {
        onSwipe(currentRequest.id, direction);
      }

      // Move to next request or reset
      if (currentIndex < dateRequests.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0); // Loop back to first request
      }

      // Reset after animation completes
      setTimeout(() => {
        setSwipeDirection(null);
        setOffset(0);
        setIsProcessing(false);
      }, 300);

    } catch (error) {
      console.error('Error processing date request swipe:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading date requests...</p>
        </div>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending date requests at the moment.</p>
        <p className="text-sm text-muted-foreground mt-2">Check back later for new date proposals!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          Date Request {currentIndex + 1} of {dateRequests.length}
        </p>
      </div>
      
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
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img 
                  src={currentRequest.requester.profile_image_url || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600`} 
                  alt={currentRequest.requester.full_name} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentRequest.requester.full_name}</h3>
                <p className="text-sm text-gray-500">Date Request</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-coral-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-coral-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(currentRequest.date_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Date & Time</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-coral-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-coral-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentRequest.location}</p>
                  <p className="text-xs text-gray-500">Location</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-coral-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-coral-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">${currentRequest.deposit_amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Security Deposit</p>
                </div>
              </div>
            </div>
            
            {currentRequest.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-700">{currentRequest.description}</p>
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
                variant="outline" 
                size="icon" 
                className="rounded-full hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 flex-1 h-12 w-12"
                onClick={() => {/* TODO: Implement messaging */}}
                disabled={isProcessing}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                className="rounded-full bg-coral-500 hover:bg-coral-600 text-white flex-1 h-12"
                onClick={() => handleSwiped('right')}
                disabled={isProcessing}
              >
                <Heart className="h-5 w-5 mr-1" />
                Accept
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-gray-400 text-center">
              Swipe left to decline, right to accept
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRequestSwipe;
