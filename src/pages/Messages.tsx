import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useStore';
import { Send, MailPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/conversations');
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, []);

  const openChat = async (convUser: any) => {
    setActiveChat(convUser);
    try {
      const res = await fetch(`/api/messages/${convUser.id}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          receiverId: activeChat.id, 
          content: input,
          senderId: user?.id
        })
      });
      const newMsg = await res.json();
      setMessages([...messages, newMsg]);
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-white h-full flex flex-col md:flex-row pb-16 md:pb-0 relative min-h-screen">
      {/* Conversations List */}
      <div className={`w-full md:w-80 md:border-r border-gray-100 flex flex-col h-screen md:h-auto ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#0A192F]">Messages</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#0A192F]">
            <MailPlus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div 
              key={conv.user.id} 
              onClick={() => openChat(conv.user)}
              className="p-4 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
            >
              <img src={conv.user.avatar} className="w-12 h-12 rounded-full object-cover" alt="avatar" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[#0A192F] truncate">{conv.user.name}</h3>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm truncate">@{conv.user.username}</p>
                {conv.lastMessage && (
                  <p className="text-gray-600 text-sm truncate mt-1">{conv.lastMessage.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col h-screen md:h-auto ${!activeChat ? 'hidden md:flex' : 'flex'} bg-white absolute md:relative top-0 left-0 w-full z-20`}>
        {activeChat ? (
          <>
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 p-3 flex items-center gap-3">
              <button 
                onClick={() => setActiveChat(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600"
              >
                <ArrowLeft size={20} />
              </button>
              <img src={activeChat.avatar} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
              <div>
                <h2 className="font-bold text-[#0A192F]">{activeChat.name}</h2>
                <p className="text-xs text-gray-500">@{activeChat.username}</p>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isMine 
                        ? 'bg-[#1769FF] text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}>
                      <p className="text-[15px] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-3 border-t border-gray-100 bg-white sticky bottom-16 md:bottom-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Start a new message"
                  className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1769FF]/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-3 bg-[#1769FF] text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 hidden md:flex">
            <h2 className="text-2xl font-bold text-[#0A192F] mb-2">Select a message</h2>
            <p className="max-w-xs">Choose from your existing conversations, start a new one, or just keep swimming.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Just add this import to avoid error in the code block
import { ArrowLeft } from 'lucide-react';
