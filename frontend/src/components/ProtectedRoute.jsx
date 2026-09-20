import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="h-screen app-bg flex items-center justify-center text-white text-lg">
        <div className="flex items-center gap-3 glass-panel px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
