import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Facebook } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

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
      alert(`Failed to initiate ${provider} login: ${error.message}`);
    }
  };

  return (
    <div className="login-page-body">
      <div className="login-container">
        <div className="login-visual">
          <div className="login-visual-content">
            <h1>Hello, <span>Soulmate.</span></h1>
            <p>Enter your clues to unlock your journey towards meaningful connections.</p>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-form-wrapper">
            <Link to="/" className="logo mb-10 block">HI<span>Clue</span></Link>
            
            <h2>Welcome Back</h2>
            <p className="text-gray-400 mb-10">Please login to your account</p>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <input type="email" id="email" placeholder=" " required />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="input-group">
                <input type="password" id="password" placeholder=" " required />
                <label htmlFor="password">Password</label>
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" className="hidden" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Forgot Password?</a>
              </div>

              <button type="submit" className="btn-cta w-full py-4 text-lg">Login</button>
              
              <div className="divider">
                <span>or continue with</span>
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

            <p className="signup-link">Don't have an account? <Link to="/signup">Sign Up Free</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
