import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { MusicPlayer } from './components/MusicPlayer/MusicPlayer';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import { useApp } from './context/AppContext';

function MainAppLayout() {
  const { currentSong, activeNav } = useApp();

  return (
    <div className="relative h-screen overflow-hidden flex flex-col bg-[#07080c] text-white">
      {/* Ambient background layer between base dark background and application content */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft colorful blurred orbs */}
        <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-indigo-600/15 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/15 blur-[130px] mix-blend-screen" />
        <div className="absolute -bottom-[10%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-blue-600/12 blur-[140px] mix-blend-screen" />

        {/* Dynamic playing song artwork glow */}
        {currentSong?.artwork && (
          <div
            className="absolute inset-0 opacity-30 blur-[100px] scale-125 transition-all duration-1000 bg-center bg-cover"
            style={{ backgroundImage: `url(${currentSong.artwork})` }}
          />
        )}
      </div>

      {/* Main Application Content Container */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        <Header />
        <Dashboard />
        {activeNav !== 'Songs' && <MusicPlayer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Landing (Public) */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />

          {/* Login (Public) */}
          <Route path="/login" element={<Login />} />

          {/* Register (Public) */}
          <Route path="/register" element={<Register />} />

          {/* Protected Main App Route */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <MainAppLayout />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-all for any unknown/invalid route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;