import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Camera, Save, User, MapPin, Briefcase, FileText } from 'lucide-react';

const ProfileEditor = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullname: '',
    role: '',
    location: '',
    bio: '',
    email: 'dagadzirobert990@gmail.com' // Mock current user email
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/profile/${profile.email}`)
      .then(res => res.json())
      .then(data => setProfile(prev => ({ ...prev, ...data })));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-bg)] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-[var(--text-main)]">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-serif font-bold text-[var(--text-main)]">Edit Profile</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="btn-cta flex items-center gap-2 px-6 py-3 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </header>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl mb-8 text-center ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Avatar Section */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" 
                alt="Avatar" 
                className="w-48 h-48 rounded-3xl object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl flex items-center justify-center text-white transition-opacity">
                <Camera size={32} />
              </button>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-4">Click to change photo</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-8">
            <div className="space-y-2">
              <label htmlFor="fullname" className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input 
                type="text" 
                id="fullname" 
                value={profile.fullname}
                onChange={handleChange}
                className="w-full bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-main)] focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
                  <Briefcase size={16} /> Occupation
                </label>
                <input 
                  type="text" 
                  id="role" 
                  value={profile.role}
                  onChange={handleChange}
                  className="w-full bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-main)] focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
                  <MapPin size={16} /> Location
                </label>
                <input 
                  type="text" 
                  id="location" 
                  value={profile.location}
                  onChange={handleChange}
                  className="w-full bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-main)] focus:ring-2 focus:ring-pink-400 outline-none transition-all"
                  placeholder="e.g. New York, NY"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
                <FileText size={16} /> Bio
              </label>
              <textarea 
                id="bio" 
                rows={4}
                value={profile.bio}
                onChange={handleChange}
                className="w-full bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-main)] focus:ring-2 focus:ring-pink-400 outline-none transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
