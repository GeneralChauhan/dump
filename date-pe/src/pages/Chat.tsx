
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import ChatInterface from "@/components/chat/ChatInterface";

interface ChatPreviewProps {
  id: number;
  name: string;
  photo: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  onClick: () => void;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({
  name,
  photo,
  lastMessage,
  time,
  unread,
  onClick
}) => (
  <div onClick={onClick} className="cursor-pointer hover:bg-gray-50 transition-colors">
    <div className="flex items-center p-4">
      <div className="relative mr-3">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        </div>
        {unread && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-bloom-blue rounded-full border-2 border-white"></div>
        )}
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium truncate">{name}</h3>
          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{time}</span>
        </div>
        <p className={`text-sm truncate ${unread ? "font-medium text-gray-900" : "text-gray-600"}`}>
          {lastMessage}
        </p>
      </div>
    </div>
  </div>
);

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  
  const chatPreviews = [
    {
      id: 1,
      name: "Emma Watson",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
      lastMessage: "I noticed we both enjoy hiking. Do you have any favorite trails?",
      time: "2:30 PM",
      unread: true
    },
    {
      id: 2,
      name: "Olivia Johnson",
      photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
      lastMessage: "That coffee shop you recommended was amazing! Thanks!",
      time: "Yesterday",
      unread: false
    },
    {
      id: 3,
      name: "Sophia Rodriguez",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80",
      lastMessage: "Are we still on for Saturday?",
      time: "Monday",
      unread: false
    }
  ];
  
  const currentChat = chatPreviews.find(chat => chat.id === selectedChat);

  if (selectedChat && currentChat) {
    return (
      <ChatInterface 
        contactName={currentChat.name}
        contactPhoto={currentChat.photo}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          <Card>
            {chatPreviews.map((chat, index) => (
              <React.Fragment key={chat.id}>
                {index > 0 && <div className="h-px bg-gray-100" />}
                <ChatPreview 
                  {...chat} 
                  onClick={() => setSelectedChat(chat.id)} 
                />
              </React.Fragment>
            ))}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
