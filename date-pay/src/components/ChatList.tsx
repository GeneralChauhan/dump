import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatListProps {
  onClose: () => void;
  onOpenChat: (matchId: string, otherUser: any) => void;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  otherUser: {
    user_id: string;
    full_name: string;
    profile_image_url?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
}

const ChatList: React.FC<ChatListProps> = ({ onClose, onOpenChat }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadMatchesWithLastMessages();
    }
  }, [user]);

  const loadMatchesWithLastMessages = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load matches
      const { data: userMatches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) {
        throw matchesError;
      }

      if (userMatches) {
        // Load profile information and last messages for each match
        const matchesWithDetails = await Promise.all(
          userMatches.map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            
            // Load other user's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, full_name, profile_image_url')
              .eq('user_id', otherUserId)
              .single();

            // Load last message
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            // Count unread messages
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('receiver_id', user.id)
              .eq('sender_id', otherUserId)
              .is('read_at', null);

            return {
              ...match,
              otherUser: profile || {
                user_id: otherUserId,
                full_name: 'Unknown User',
                profile_image_url: null
              },
              lastMessage: lastMessage || null,
              unreadCount: unreadCount || 0
            };
          })
        );

        // Sort by last message time (most recent first)
        const sortedMatches = matchesWithDetails.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) {
            return new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime();
          }
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        });

        setMatches(sortedMatches);
      }
    } catch (error) {
      console.error('Error loading matches with messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = matches.filter(match =>
    match.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between bg-white shadow-sm">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Chats</h2>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white shadow-sm">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="w-10" />
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start swiping to find matches and begin chatting!'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onOpenChat(match.id, match.otherUser)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={match.otherUser.profile_image_url || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600`}
                      alt={match.otherUser.full_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    {match.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {match.unreadCount > 9 ? '9+' : match.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {match.otherUser.full_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {match.lastMessage 
                          ? formatTime(match.lastMessage.created_at)
                          : formatTime(match.matched_at)
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {match.lastMessage 
                          ? (match.lastMessage.sender_id === user?.id ? 'You: ' : '') + truncateMessage(match.lastMessage.content)
                          : 'Start a conversation! 💬'
                        }
                      </p>
                      {match.unreadCount > 0 && (
                        <div className="bg-coral-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center ml-2">
                          {match.unreadCount > 9 ? '9+' : match.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
