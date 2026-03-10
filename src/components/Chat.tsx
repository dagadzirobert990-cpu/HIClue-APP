import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Send, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';

interface Message {
  id?: number;
  sender_id: string;
  text: string;
  timestamp: string;
}

const Chat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user profile
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Extract other user ID from roomId (e.g., match_sophia_arch)
  const matchIdMap: Record<string, string> = {
    "match_1": "sophia_arch",
    "match_2": "liam_dev",
    "match_3": "isabella_yoga",
    "match_4": "noah_chef"
  };
  const otherUserId = roomId ? matchIdMap[roomId] : null;

  useEffect(() => {
    if (!user) return;

    // Fetch history
    fetch(`/api/messages/${roomId}`)
      .then(res => res.json())
      .then(data => setMessages(data));

    // Fetch online status
    fetch('/api/online-users')
      .then(res => res.json())
      .then((data: string[]) => {
        if (otherUserId && data.includes(otherUserId)) {
          setIsOtherUserOnline(true);
        }
      });

    // Setup WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}?roomId=${roomId}&userId=${user.userId}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data]);
      } else if (data.type === 'status') {
        if (data.userId === otherUserId) {
          setIsOtherUserOnline(data.status === 'online');
        }
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [roomId, otherUserId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !ws.current || !user) return;

    const payload = {
      type: 'chat',
      senderId: user.userId,
      text: inputText
    };

    ws.current.send(JSON.stringify(payload));
    setInputText('');
  };

  const currentUserId = user?.userId;

  return (
    <div className="h-screen flex flex-col bg-[var(--gradient-bg)]">
      {/* Chat Header */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--glass-border)] p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-[var(--text-main)]">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" 
                alt="Match" 
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isOtherUserOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--card-bg)] rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-main)]">Sophia</h3>
              <p className={`text-xs font-medium ${isOtherUserOnline ? 'text-green-500' : 'text-gray-400'}`}>
                {isOtherUserOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-[var(--text-muted)]"><Phone size={20} /></button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-[var(--text-muted)]"><Video size={20} /></button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-[var(--text-muted)]"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[70%] p-4 rounded-2xl shadow-sm
                ${isMe 
                  ? 'bg-pink-500 text-white rounded-tr-none' 
                  : 'bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--glass-border)] rounded-tl-none'}
              `}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--card-bg)] border-t border-[var(--glass-border)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl px-6 py-3 text-[var(--text-main)] focus:ring-2 focus:ring-pink-400 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-pink-500 text-white p-3 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
