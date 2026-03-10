import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, MessageCircle, User, Settings, LogOut, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const initialMatches = [
  {
    id: 1,
    userId: "sophia_arch",
    name: "Sophia",
    age: 26,
    role: "Architect",
    location: "New York, NY",
    compatibility: "96%",
    clue: "Both love minimalist design",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    userId: "liam_dev",
    name: "Liam",
    age: 29,
    role: "Software Engineer",
    location: "Brooklyn, NY",
    compatibility: "92%",
    clue: "Shared passion for open source",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    userId: "isabella_yoga",
    name: "Isabella",
    age: 24,
    role: "Yoga Instructor",
    location: "Jersey City, NJ",
    compatibility: "89%",
    clue: "Morning routine matches perfectly",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    userId: "noah_chef",
    name: "Noah",
    age: 31,
    role: "Chef",
    location: "Manhattan, NY",
    compatibility: "87%",
    clue: "Both enjoy spicy food adventures",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80"
  }
];

const Dashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Fetch user profile
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => navigate('/login'));

    // Initial fetch for online users
    fetch('/api/online-users')
      .then(res => res.json())
      .then(data => setOnlineUsers(data));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Setup WebSocket for status updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}?roomId=dashboard&userId=${user.userId}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        if (data.status === 'online') {
          setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
        } else {
          setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        }
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-bg)] flex">
      {/* Sidebar */}
      <aside className="w-24 md:w-64 bg-[var(--card-bg)] border-r border-[var(--glass-border)] flex flex-col items-center md:items-stretch py-8 px-4 transition-all">
        <div className="logo mb-12 hidden md:block">HI<span>Clue</span></div>
        <div className="logo mb-12 md:hidden text-2xl">HI</div>

        <nav className="flex-1 flex flex-col gap-4 bg-transparent p-0 border-none sticky top-0">
          <Link to="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-500 font-semibold">
            <Heart size={24} />
            <span className="hidden md:block">Matches</span>
          </Link>
          <Link to="/chat/global" className="flex items-center gap-4 p-4 rounded-2xl text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MessageCircle size={24} />
            <span className="hidden md:block">Messages</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-4 p-4 rounded-2xl text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <User size={24} />
            <span className="hidden md:block">Profile</span>
          </Link>
          <a href="#" className="flex items-center gap-4 p-4 rounded-2xl text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings size={24} />
            <span className="hidden md:block">Settings</span>
          </a>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-auto w-full"
        >
          <LogOut size={24} />
          <span className="hidden md:block text-left">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--text-main)]">Your Clues Found Love</h1>
            <p className="text-[var(--text-muted)]">Based on your compatibility analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-[var(--text-main)]">{user?.fullname || 'Robert Dagadzi'}</p>
              <p className="text-xs text-[var(--text-muted)]">{user?.role || 'Premium Member'}</p>
            </div>
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full border-2 border-pink-400 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {initialMatches.map((match, index) => {
            const isOnline = onlineUsers.includes(match.userId);
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-[var(--card-bg)] rounded-3xl overflow-hidden shadow-[var(--shadow-card)] border border-[var(--glass-border)] hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={match.image} 
                    alt={match.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-pink-500 font-bold text-sm">
                    {match.compatibility} Match
                  </div>
                  {isOnline && (
                    <div className="absolute top-4 left-4 bg-green-500 px-3 py-1 rounded-full text-white font-bold text-xs flex items-center gap-1 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      Online
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <h3 className="text-xl font-bold">{match.name}, {match.age}</h3>
                    <p className="text-sm opacity-80 flex items-center gap-1">
                      <MapPin size={14} /> {match.location}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🧩</span>
                    <p className="text-sm font-medium text-[var(--text-main)] italic">"{match.clue}"</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/chat/match_${match.id}`} className="flex-1 py-3 rounded-xl bg-[var(--accent-gradient)] text-white font-bold hover:opacity-90 transition-opacity text-center">
                      Connect
                    </Link>
                    <button className="p-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-main)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Heart size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
