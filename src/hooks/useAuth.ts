import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: { id: string; name: string; workspace_id: string | null } | null;
  roles: AppRole[];
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);
    setState(prev => ({
      ...prev,
      profile: profileRes.data,
      roles: (rolesRes.data?.map(r => r.role as AppRole)) ?? [],
      loading: false,
    }));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null, session }));
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setState(prev => ({ ...prev, profile: null, roles: [], loading: false }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, user: session?.user ?? null, session }));
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const hasRole = useCallback((role: AppRole) => state.roles.includes(role), [state.roles]);
  const isAdmin = useCallback(() => hasRole('ADMIN'), [hasRole]);
  const canEdit = useCallback(() => hasRole('ADMIN') || hasRole('OPERADOR'), [hasRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, hasRole, isAdmin, canEdit, signOut };
}
