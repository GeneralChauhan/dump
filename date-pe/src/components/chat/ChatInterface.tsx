
import React, { useState } from "react";
import { Send, ArrowLeft, MoreVertical } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "other";
  timestamp: Date;
}

interface ChatInterfaceProps {
  contactName: string;
  contactPhoto: string;
  onBack?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  contactName, 
  contactPhoto,
  onBack
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I saw that we matched and wanted to say hello.",
      sender: "other",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      text: "Hey! Thanks for reaching out. How are you doing today?",
      sender: "user",
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: 3,
      text: "I'm doing well, thanks for asking! I noticed we both enjoy hiking. Do you have any favorite trails?",
      sender: "other",
      timestamp: new Date(Date.now() - 3400000)
    }
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message,
        sender: "user",
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      
      // Simulate a reply (for demo purposes)
      setTimeout(() => {
        const replyMessage: Message = {
          id: messages.length + 2,
          text: "That sounds great! Looking forward to chatting more.",
          sender: "other",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center">
        {onBack && (
          <button onClick={onBack} className="mr-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
          <img src={contactPhoto} alt={contactName} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-grow min-w-0">
          <h2 className="font-medium truncate">{contactName}</h2>
          <div className="text-xs text-green-600">Online</div>
        </div>
        
        <button className="ml-2">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.sender === "user" 
                  ? "bg-bloom-blue text-white rounded-tr-none" 
                  : "bg-white border border-gray-100 rounded-tl-none"
              }`}
            >
              <p className="mb-1">{msg.text}</p>
              <div 
                className={`text-xs ${
                  msg.sender === "user" ? "text-white/70" : "text-gray-500"
                } text-right`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow bg-transparent outline-none"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button 
            onClick={sendMessage} 
            className="ml-2 p-2 rounded-full bg-bloom-blue text-white disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
