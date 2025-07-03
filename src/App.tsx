import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { VenuePlayer } from './components/VenuePlayer';
import { MobileRemote } from './components/MobileRemote';
import { AdminDashboard } from './components/AdminDashboard';
import { VenueDashboard } from './components/VenueDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/player/:venueId" element={<VenuePlayer />} />
            <Route path="/remote" element={<MobileRemote />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/venue/:venueId" element={<VenueDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;