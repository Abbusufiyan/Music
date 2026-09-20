import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  const handleReturn = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="h-screen w-screen app-bg flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 max-w-md w-full flex flex-col items-center shadow-2xl relative z-10">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-inner">
          <AlertCircle size={40} className="text-white/60" />
        </div>

        <h1 className="text-6xl font-extrabold text-white mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-white/90 mb-3">Page Not Found</h2>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          The requested URL does not exist or has been moved. Check the address bar or return back to safety.
        </p>

        <button
          onClick={handleReturn}
          className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all shadow-lg cursor-pointer w-full"
        >
          <Home size={18} />
          <span>Return to {isAuthenticated ? 'Home' : 'Login'}</span>
        </button>
      </div>
    </div>
  );
}
