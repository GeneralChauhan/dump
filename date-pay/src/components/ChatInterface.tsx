
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface ChatInterfaceProps {
  matchId: string;
  otherUser: {
    user_id: string;
    full_name: string;
    profile_image_url?: string;
  };
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  matchId,
  otherUser,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && otherUser) {
      loadMessages();
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel(`messages:${matchId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.user_id}),and(sender_id.eq.${otherUser.user_id},receiver_id.eq.${user.id}))`
        }, (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          // Mark message as read if we're the receiver
          if (newMessage.receiver_id === user.id) {
            markMessageAsRead(newMessage.id);
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, otherUser, matchId]);

  const loadMessages = async () => {
    if (!user || !otherUser) return;

    try {
      setIsLoading(true);
      
      const { data: chatMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.user_id}),and(sender_id.eq.${otherUser.user_id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(chatMessages || []);

      // Mark all messages from the other user as read
      const unreadMessages = chatMessages?.filter(
        msg => msg.receiver_id === user.id && msg.sender_id === otherUser.user_id && !msg.read_at
      ) || [];

      for (const message of unreadMessages) {
        await markMessageAsRead(message.id);
      }

    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !otherUser || newMessage.trim() === '' || isSending) return;

    try {
      setIsSending(true);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherUser.user_id,
          content: newMessage.trim()
        });

      if (error) {
        throw error;
      }

      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const isOwnMessage = (message: Message) => message.sender_id === user?.id;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between bg-white shadow-sm">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <img 
              src={otherUser.profile_image_url || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600`} 
              alt={otherUser.full_name} 
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
            <div>
              <h3 className="font-semibold">{otherUser.full_name}</h3>
              <div className="text-xs text-gray-500">Loading...</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading messages...</p>
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
        
        <div className="flex items-center">
          <img 
            src={otherUser.profile_image_url || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600`} 
            alt={otherUser.full_name} 
            className="h-10 w-10 rounded-full object-cover mr-3"
          />
          <div>
            <h3 className="font-semibold">{otherUser.full_name}</h3>
            <div className="text-xs text-green-500">Online</div>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation!</h3>
            <p className="text-gray-500">Send the first message to begin chatting with {otherUser.full_name}</p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  isOwnMessage(message) ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] rounded-2xl p-4",
                    isOwnMessage(message)
                      ? "bg-coral-500 text-white rounded-br-none" 
                      : "bg-white shadow-sm border border-gray-100 rounded-bl-none"
                  )}
                >
                  <p>{message.content}</p>
                  <div 
                    className={cn(
                      "text-xs mt-1 flex items-center space-x-1",
                      isOwnMessage(message) ? "text-white/70" : "text-gray-400"
                    )}
                  >
                    <span>{formatTime(message.created_at)}</span>
                    {isOwnMessage(message) && message.read_at && (
                      <span>✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="border-t p-4 bg-white">
        <div className="flex max-w-lg mx-auto">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="rounded-full bg-gray-100 border-transparent focus:border-gray-200"
            disabled={isSending}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={sendMessage}
            disabled={newMessage.trim() === '' || isSending}
            className="ml-2 rounded-full hover:bg-coral-100 text-coral-500"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coral-500"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
