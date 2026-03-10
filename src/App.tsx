import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import CompatibilityQuiz from './components/CompatibilityQuiz';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import ProfileEditor from './components/ProfileEditor';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/quiz" element={<CompatibilityQuiz />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/profile" element={<ProfileEditor />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
