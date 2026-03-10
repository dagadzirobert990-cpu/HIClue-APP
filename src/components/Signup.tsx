import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Facebook } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        navigate('/dashboard');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleOAuth = async (provider: 'google' | 'apple' | 'github' | 'facebook') => {
    try {
      const apiUrl = `${window.location.origin}/api/auth/${provider}/url`;
      console.log(`Fetching OAuth URL from: ${apiUrl}`);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get auth URL: ${response.status} ${errorText}`);
      }
      const { url } = await response.json();
      
      if (!url) throw new Error('No URL returned from server');

      window.open(
        url,
        `${provider}_oauth`,
        'width=600,height=700'
      );
    } catch (error: any) {
      console.error(`${provider} OAuth error:`, error);
      alert(`Failed to initiate ${provider} signup: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/login');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="login-page-body">
      <div className="login-container">
        <div className="login-visual">
          <div className="login-visual-content">
            <h1>Start Your <span>Journey.</span></h1>
            <p>Create your profile and let the clues lead you to your perfect match.</p>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-form-wrapper">
            <Link to="/" className="logo mb-8 block">HI<span>Clue</span></Link>
            
            <h2>Create Account</h2>
            <p className="text-gray-400 mb-10">Join the community of meaningful connections</p>

            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input 
                  type="text" 
                  id="fullname" 
                  placeholder=" " 
                  required 
                  value={formData.fullname}
                  onChange={handleChange}
                />
                <label htmlFor="fullname">Full Name</label>
              </div>

              <div className="input-group">
                <input 
                  type="email" 
                  id="email" 
                  placeholder=" " 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="input-group">
                <input 
                  type="password" 
                  id="password" 
                  placeholder=" " 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
                <label htmlFor="password">Password</label>
              </div>

              <div className="input-group">
                <input 
                  type="password" 
                  id="confirmPassword" 
                  placeholder=" " 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>

              <div className="form-options mb-8">
                <label className="checkbox-container">
                  <input type="checkbox" className="hidden" required />
                  <span className="checkmark"></span>
                  <span>I agree to the <a href="#" className="text-pink-400">Terms & Conditions</a></span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-cta w-full py-4 text-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create My Account'}
              </button>
              
              <div className="divider">
                <span>or sign up with</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn" onClick={() => handleOAuth('google')} title="Google">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                </button>
                <button type="button" className="social-btn" onClick={() => handleOAuth('apple')} title="Apple">
                  <img src="https://www.apple.com/favicon.ico" alt="Apple" className="w-6 h-6" />
                </button>
                <button type="button" className="social-btn" onClick={() => handleOAuth('github')} title="GitHub">
                  <Github className="w-6 h-6 text-gray-800" />
                </button>
                <button type="button" className="social-btn" onClick={() => handleOAuth('facebook')} title="Facebook">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </button>
              </div>
            </form>

            <p className="signup-link">Already have an account? <Link to="/login">Login Here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
