
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import ProfileCard from '@/components/ProfileCard';
import DateRequest from '@/components/DateRequest';
import DateRequestSwipe from '@/components/DateRequestSwipe';
import FeatureCard from '@/components/FeatureCard';
import ReferralDashboard from '@/components/ReferralDashboard';
import ChatInterface from '@/components/ChatInterface';
import ChatList from '@/components/ChatList';
import { MessageCircle } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const POTENTIAL_MATCHES = [
  {
    id: 1,
    name: "Emma",
    age: 26,
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
    bio: "Passionate about photography and outdoor adventures. Looking for someone who enjoys hiking and trying new restaurants.",
    depositAmount: 50
  },
  {
    id: 2,
    name: "Michael",
    age: 30,
    location: "Chicago, IL",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
    bio: "Software engineer by day, amateur chef by night. Looking for someone to share my culinary experiments with.",
    depositAmount: 75
  },
  {
    id: 3,
    name: "Sophia",
    age: 28,
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&q=80&w=600",
    bio: "Art gallery curator with a love for cinema and fine wine. Seeking intellectual conversations and cultural experiences.",
    depositAmount: 100
  },
  {
    id: 4,
    name: "James",
    age: 32,
    location: "Seattle, WA",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
    bio: "Passionate traveler who has visited over 30 countries. Looking for someone to explore new places and cultures with.",
    depositAmount: 80
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, loading } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [activeChatProfile, setActiveChatProfile] = useState<{
    name: string;
    image: string;
  } | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [dateRequests, setDateRequests] = useState<any[]>([]);
  const [isLoadingDateRequests, setIsLoadingDateRequests] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    matchId: string;
    otherUser: any;
  } | null>(null);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load user profile and other users
    loadUserData();
    
    // Set up periodic match checking
    const matchCheckInterval = setInterval(checkForNewMatches, 5000); // Check every 5 seconds
    
    return () => clearInterval(matchCheckInterval);
  }, [user, loading, navigate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        setReferralCode(`${profile.full_name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`);
      }

      // Load other profiles for browsing (excluding current user and already swiped profiles)
      await loadAvailableProfiles();
      
      // Load existing matches
      await loadMatches();
      
      // Load date requests
      await loadDateRequests();

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
    }
  };

  const loadDateRequests = async () => {
    if (!user) return;

    setIsLoadingDateRequests(true);
    try {
      // Load date requests first (without foreign key join)
      const { data: dateRequests, error: dateError } = await supabase
        .from('date_requests')
        .select('*')
        .eq('requested_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (dateError) {
        throw dateError;
      }

      if (dateRequests && dateRequests.length > 0) {
        // Load profile information for each requester
        const requestsWithProfiles = await Promise.all(
          dateRequests.map(async (request) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, full_name, profile_image_url, age, location')
              .eq('user_id', request.requester_id)
              .single();
            
            return {
              ...request,
              requester: profile || {
                user_id: request.requester_id,
                full_name: 'Unknown User',
                profile_image_url: null,
                age: null,
                location: null
              }
            };
          })
        );
        
        setDateRequests(requestsWithProfiles);
      } else {
        setDateRequests([]);
      }
    } catch (error) {
      console.error('Error loading date requests:', error);
      toast({
        title: "Error",
        description: "Something went wrong while loading date requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDateRequests(false);
    }
  };

  const loadAvailableProfiles = async () => {
    if (!user) return;

    setIsLoadingProfiles(true);
    try {
      // First, get all profiles excluding the current user
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load profiles. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Get the user's swipes
      const { data: userSwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      if (swipesError) {
        console.error('Error loading user swipes:', swipesError);
        toast({
          title: "Error",
          description: "Failed to load your swipe history. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Filter out already swiped profiles
      const swipedIds = new Set(userSwipes?.map(swipe => swipe.swiped_id) || []);
      const availableProfiles = allProfiles?.filter(profile => !swipedIds.has(profile.user_id)) || [];

      console.log('Profile loading debug:', {
        totalProfiles: allProfiles?.length || 0,
        userSwipes: userSwipes?.length || 0,
        availableProfiles: availableProfiles.length,
        sampleProfile: availableProfiles[0] ? {
          id: availableProfiles[0].id,
          user_id: availableProfiles[0].user_id,
          full_name: availableProfiles[0].full_name
        } : null
      });

      // Limit to 10 profiles
      setProfiles(availableProfiles.slice(0, 10));
    } catch (error) {
      console.error('Error loading available profiles:', error);
      toast({
        title: "Error",
        description: "Something went wrong while loading profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadMoreProfiles = async () => {
    if (!user) return;

    setIsLoadingProfiles(true);
    try {
      // Get all profiles excluding the current user
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load more profiles. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Get the user's swipes
      const { data: userSwipes, error: swipesError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      if (swipesError) {
        console.error('Error loading user swipes:', swipesError);
        toast({
          title: "Error",
          description: "Failed to load your swipe history. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Filter out already swiped profiles
      const swipedIds = new Set(userSwipes?.map(swipe => swipe.swiped_id) || []);
      const availableProfiles = allProfiles?.filter(profile => !swipedIds.has(profile.user_id)) || [];

      // Add more profiles to the existing list
      setProfiles(prev => {
        const existingIds = new Set(prev.map(p => p.user_id));
        const newProfiles = availableProfiles.filter(profile => !existingIds.has(profile.user_id));
        return [...prev, ...newProfiles.slice(0, 5)]; // Add 5 more profiles
      });

      if (availableProfiles.length === 0) {
        toast({
          title: "No More Profiles",
          description: "You've seen all available profiles. Check back later!",
        });
      }
    } catch (error) {
      console.error('Error loading more profiles:', error);
      toast({
        title: "Error",
        description: "Something went wrong while loading more profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  const loadMatches = async () => {
    if (!user) return;

    try {
      const { data: userMatches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) {
        console.error('Error loading matches:', error);
      } else if (userMatches) {
        // Load profile information for matched users
        const matchesWithProfiles = await Promise.all(
          userMatches.map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, profile_image_url')
              .eq('user_id', otherUserId)
              .single();
            
            return {
              ...match,
              otherUser: profile
            };
          })
        );
        
        setMatches(matchesWithProfiles);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const checkForNewMatches = async () => {
    if (!user) return;

    try {
      const { data: newMatches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .gt('matched_at', new Date(Date.now() - 10000).toISOString()); // Matches from last 10 seconds

      if (error) {
        console.error('Error checking for new matches:', error);
      } else if (newMatches && newMatches.length > 0) {
        // Show notification for new matches
        newMatches.forEach(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', otherUserId)
            .single();
          
          if (profile) {
            toast({
              title: "New Match! 🎉",
              description: `You and ${profile.full_name} liked each other!`,
            });
          }
        });
        
        // Reload matches
        await loadMatches();
      }
    } catch (error) {
      console.error('Error checking for new matches:', error);
    }
  };

  const handleSwipe = async (userId: string, direction: 'left' | 'right') => {
    // Remove the swiped profile from the list
    setProfiles(prev => prev.filter(profile => profile.user_id !== userId));
    
    // If we're running low on profiles, load more
    if (profiles.length <= 3) {
      await loadMoreProfiles();
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleOpenChat = (matchId: string, otherUser: any) => {
    setActiveChat({ matchId, otherUser });
    setShowChatList(false);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const handleOpenChatList = () => {
    setShowChatList(true);
  };

  const handleCloseChatList = () => {
    setShowChatList(false);
  };

  const handleDateRequestSwipe = async (requestId: string, direction: 'left' | 'right') => {
    // Remove the swiped date request from the list
    setDateRequests(prev => prev.filter(request => request.id !== requestId));
    
    // Reload date requests to get updated statuses
    await loadDateRequests();
  };

  const createTestDateRequest = async () => {
    if (!user) return;

    try {
      // Get a random profile that's not the current user
      const { data: otherProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .neq('user_id', user.id)
        .limit(1);

      if (profilesError || !otherProfiles || otherProfiles.length === 0) {
        toast({
          title: "Error",
          description: "No other profiles available to create test date request.",
          variant: "destructive",
        });
        return;
      }

      const otherProfile = otherProfiles[0];
      
      // Create multiple test date requests with different scenarios
      const testRequests = [
        {
          requester_id: otherProfile.user_id,
          requested_id: user.id,
          date_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          location: "Central Park, New York",
          deposit_amount: 75,
          description: "Would you like to grab coffee and take a walk in the park? I'm thinking we could meet at the Bethesda Fountain and then explore the area together."
        },
        {
          requester_id: otherProfile.user_id,
          requested_id: user.id,
          date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          location: "Brooklyn Bridge Park",
          deposit_amount: 50,
          description: "How about a sunset walk across the Brooklyn Bridge? We could start at the park and walk to Manhattan, then grab dinner somewhere nice."
        }
      ];

      let createdCount = 0;
      for (const request of testRequests) {
        const { error: createError } = await supabase
          .from('date_requests')
          .insert(request);

        if (!createError) {
          createdCount++;
        }
      }

      if (createdCount > 0) {
        toast({
          title: "Test Date Requests Created!",
          description: `${createdCount} test date requests have been created. Check the Date Requests tab to see them.`,
        });
        
        // Reload date requests
        await loadDateRequests();
      } else {
        toast({
          title: "Error",
          description: "Failed to create test date requests. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating test date requests:', error);
      toast({
        title: "Error",
        description: "Something went wrong while creating the test date requests.",
        variant: "destructive",
      });
    }
  };

  const createDateRequestFromCurrentUser = async () => {
    if (!user) return;

    try {
      // Get a random profile that's not the current user
      const { data: otherProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .neq('user_id', user.id)
        .limit(1);

      if (profilesError || !otherProfiles || otherProfiles.length === 0) {
        toast({
          title: "Error",
          description: "No other profiles available to send date request to.",
          variant: "destructive",
        });
        return;
      }

      const otherProfile = otherProfiles[0];
      
      // Create a date request FROM the current user TO another user
      const { error: createError } = await supabase
        .from('date_requests')
        .insert({
          requester_id: user.id,
          requested_id: otherProfile.user_id,
          date_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          location: "Times Square, New York",
          deposit_amount: 100,
          description: "I'd love to take you to a Broadway show! We could meet at Times Square, grab dinner, and then see a performance. What do you think?"
        });

      if (createError) {
        console.error('Error creating date request:', createError);
        toast({
          title: "Error",
          description: "Failed to create date request. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Date Request Sent! 📤",
          description: `Your date request has been sent to ${otherProfile.full_name}. They'll see it in their Date Requests tab!`,
        });
      }
    } catch (error) {
      console.error('Error creating date request:', error);
      toast({
        title: "Error",
        description: "Something went wrong while creating the date request.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {activeChat && (
        <ChatInterface 
          matchId={activeChat.matchId}
          otherUser={activeChat.otherUser}
          onClose={handleCloseChat}
        />
      )}

      {showChatList && (
        <ChatList 
          onClose={handleCloseChatList}
          onOpenChat={handleOpenChat}
        />
      )}
      
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {userProfile?.full_name || 'User'}!</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your DatePay account</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              onClick={handleOpenChatList}
              className="flex items-center space-x-2 border-peony-200 text-peony-600 hover:bg-peony-50"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chats</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-slate-blue-200 text-slate-blue-600 hover:bg-slate-blue-50"
            >
              Log out
            </Button>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-md border mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Referral Code</h2>
              <p className="text-muted-foreground mt-1">Share this code to earn rewards when friends join DatePay</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="bg-primary/10 px-4 py-2 rounded-lg mr-2">
                <span className="font-mono font-bold text-primary">{referralCode}</span>
              </div>
              <Button size="icon" variant="outline" onClick={handleCopyReferralCode}>
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto mb-8 bg-gradient-to-r from-peony-100 via-pink-rose-100 to-indigo-100 border border-gray-200 rounded-2xl p-2">
            <TabsTrigger value="browse" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-peony-500 data-[state=active]:to-pink-rose-500 data-[state=active]:text-white rounded-xl">Browse</TabsTrigger>
            <TabsTrigger value="matches" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-rose-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl">Matches</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-slate-blue-500 data-[state=active]:text-white rounded-xl">Chat</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-blue-500 data-[state=active]:to-peony-500 data-[state=active]:text-white rounded-xl">Date Requests</TabsTrigger>
            <TabsTrigger value="referrals" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-peony-500 data-[state=active]:via-pink-rose-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl">Referrals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles.length > 0 ? profiles.map((profile) => (
                <ProfileCard 
                  key={profile.id}
                  id={profile.user_id}
                  name={profile.full_name}
                  age={profile.age}
                  location={profile.location}
                  image={profile.profile_image_url || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600`}
                  bio={profile.bio || "No bio available yet."}
                  depositAmount={profile.deposit_amount}
                  onSwipe={(direction) => handleSwipe(profile.user_id, direction)}
                />
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No more profiles to browse. Check back later!</p>
                </div>
              )}
            </div>
            
            {profiles.length > 0 && (
              <div className="text-center mt-8">
                <Button 
                  onClick={loadMoreProfiles}
                  variant="outline"
                  className="px-8"
                  disabled={isLoadingProfiles}
                >
                  {isLoadingProfiles ? 'Loading...' : 'Load More Profiles'}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="matches" className="mt-0">
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <div key={match.id} className="bg-white rounded-xl shadow-md border p-6">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                        <img 
                          src={match.otherUser?.profile_image_url || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600`}
                          alt={match.otherUser?.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{match.otherUser?.full_name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Matched on {new Date(match.matched_at).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-coral-500 hover:bg-coral-600"
                          onClick={() => handleOpenChat(match.id, match.otherUser)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You don't have any matches yet. Start swiping to find your perfect match!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chat" className="mt-0">
            <div className="text-center py-12 bg-gradient-to-br from-indigo-50 to-slate-blue-50 rounded-2xl border border-indigo-200">
              <MessageCircle className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-indigo-900 mb-3">Start Chatting</h3>
              <p className="text-indigo-600 mb-6">Connect with your matches and start conversations</p>
              <Button 
                onClick={handleOpenChatList}
                className="bg-gradient-to-r from-indigo-500 to-slate-blue-500 hover:from-indigo-600 hover:to-slate-blue-600 text-white px-8 py-3 rounded-xl"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Open Chats
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="requests" className="mt-0">
            <DateRequestSwipe 
              dateRequests={dateRequests} 
              onSwipe={handleDateRequestSwipe}
              isLoading={isLoadingDateRequests}
            />
            <Button 
              onClick={createTestDateRequest}
              className="mt-4"
              disabled={isLoadingDateRequests}
            >
              {isLoadingDateRequests ? 'Creating...' : 'Create Test Date Requests'}
            </Button>
            <Button 
              onClick={createDateRequestFromCurrentUser}
              className="mt-4"
              disabled={isLoadingDateRequests}
            >
              {isLoadingDateRequests ? 'Sending...' : 'Send Date Request to Random User'}
            </Button>
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-0">
            <ReferralDashboard />
            
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-6">How Referrals Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard 
                  icon={Copy}
                  title="Share Your Code"
                  description="Send your unique referral code to friends who might be interested in joining DatePay"
                />
                <FeatureCard 
                  icon={Copy}
                  title="Friends Sign Up"
                  description="When your friends register using your code, they become part of your referral network"
                />
                <FeatureCard 
                  icon={Copy}
                  title="Earn Rewards"
                  description="Earn $10 for each friend who joins and $5 when their referrals join"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
