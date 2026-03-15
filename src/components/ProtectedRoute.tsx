import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireModerator = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isModerator } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireModerator && !isModerator && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
