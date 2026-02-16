import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  workspace_name: string;
  role: string;
  created_at: string;
}

export default function PendingInvitations() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    // Query invitations for the user's email (RLS policy filters by email)
    const { data, error } = await supabase
      .from('invitations')
      .select('id, role, created_at, workspace_id')
      .eq('status', 'pending');

    if (error || !data || data.length === 0) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // We can't read the workspace name due to RLS, so we'll show a generic label
    setInvitations(data.map(i => ({
      id: i.id,
      workspace_name: 'Novo Workspace',
      role: i.role,
      created_at: i.created_at,
    })));
    setLoading(false);
  };

  const handleAction = async (invitationId: string, action: 'accept' | 'reject') => {
    setProcessing(invitationId);
    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: { invitation_id: invitationId, action },
      });

      if (error) {
        toast.error(error.message || 'Erro ao processar convite');
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
        if (action === 'accept') {
          // Refresh session to get updated profile
          await supabase.auth.refreshSession();
          window.location.href = '/dashboard';
          return;
        }
        // Remove from list
        setInvitations(prev => prev.filter(i => i.id !== invitationId));
        if (invitations.length <= 1) {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      toast.error('Erro ao processar convite');
    }
    setProcessing(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <Mail className="h-12 w-12 mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold">Convites Pendentes</h1>
          <p className="text-muted-foreground mt-1">Você tem convites para participar de workspaces</p>
        </div>

        {invitations.map(inv => (
          <Card key={inv.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{inv.workspace_name}</CardTitle>
              <CardDescription>
                Convite recebido em {new Date(inv.created_at).toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={inv.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {inv.role}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processing === inv.id}
                    onClick={() => handleAction(inv.id, 'reject')}
                  >
                    {processing === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                    Recusar
                  </Button>
                  <Button
                    size="sm"
                    disabled={processing === inv.id}
                    onClick={() => handleAction(inv.id, 'accept')}
                  >
                    {processing === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Aceitar
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Ao aceitar, você será transferido para este workspace. Seus dados atuais serão mantidos no workspace anterior.
              </p>
            </CardContent>
          </Card>
        ))}

        <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
          Pular por agora
        </Button>
      </div>
    </div>
  );
}
