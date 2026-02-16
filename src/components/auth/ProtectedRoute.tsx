import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: AppRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  const [hasPendingInvite, setHasPendingInvite] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setHasPendingInvite(false); return; }
    supabase
      .from('invitations')
      .select('id')
      .eq('status', 'pending')
      .limit(1)
      .then(({ data }) => {
        setHasPendingInvite(!!(data && data.length > 0));
      });
  }, [user]);

  if (loading || hasPendingInvite === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Redirect to pending invitations if there are any (unless already on that page)
  if (hasPendingInvite && location.pathname !== '/pending-invitations') {
    return <Navigate to="/pending-invitations" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/dashboard" replace />;

  return children ? <>{children}</> : <Outlet />;
}
