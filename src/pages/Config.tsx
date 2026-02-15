import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  status: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  roles: AppRole[];
}

export default function Config() {
  const { profile } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matDialogOpen, setMatDialogOpen] = useState(false);
  const [editMat, setEditMat] = useState<any>(null);
  const [matName, setMatName] = useState('');
  const [matPrice, setMatPrice] = useState<number | undefined>();

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('OPERADOR');
  const [inviting, setInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const workspaceId = profile?.workspace_id;

  const fetchTeam = async () => {
    if (!workspaceId) return;
    const [profilesRes, rolesRes, invitesRes] = await Promise.all([
      supabase.from('profiles').select('id, name').eq('workspace_id', workspaceId),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('invitations').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
    ]);

    const profiles = profilesRes.data ?? [];
    const roles = rolesRes.data ?? [];
    const members: TeamMember[] = profiles.map(p => ({
      id: p.id,
      name: p.name,
      roles: roles.filter(r => r.user_id === p.id).map(r => r.role as AppRole),
    }));
    setTeamMembers(members);
    setInvitations((invitesRes.data as any[] ?? []).map((i: any) => ({
      id: i.id,
      email: i.email,
      role: i.role as AppRole,
      status: i.status,
      created_at: i.created_at,
    })));
  };

  useEffect(() => {
    if (!workspaceId) return;
    const fetchData = async () => {
      const [configRes, matRes] = await Promise.all([
        supabase.from('config').select('*').eq('workspace_id', workspaceId).maybeSingle(),
        supabase.from('materials').select('*').eq('workspace_id', workspaceId).order('name'),
      ]);
      setConfig(configRes.data);
      setMaterials(matRes.data ?? []);
      await fetchTeam();
      setLoading(false);
    };
    fetchData();
  }, [workspaceId]);

  const sendInvite = async () => {
    if (!inviteEmail || !workspaceId) return;
    setInviting(true);
    const { error } = await supabase.from('invitations').insert({
      workspace_id: workspaceId,
      email: inviteEmail.toLowerCase().trim(),
      role: inviteRole,
      invited_by: profile!.id,
    } as any);
    setInviting(false);
    if (error) {
      if (error.code === '23505') toast.error('Este email já foi convidado.');
      else toast.error(error.message);
    } else {
      toast.success(`Convite enviado para ${inviteEmail}!`);
      setInviteEmail('');
      setInviteDialogOpen(false);
      fetchTeam();
    }
  };

  const cancelInvite = async (id: string) => {
    const { error } = await supabase.from('invitations').update({ status: 'cancelled' } as any).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Convite cancelado.');
      fetchTeam();
    }
  };

  const changeRole = async (userId: string, newRole: AppRole) => {
    // Delete existing roles and insert new one
    const { error: delError } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (delError) { toast.error(delError.message); return; }
    const { error: insError } = await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
    if (insError) { toast.error(insError.message); return; }
    toast.success('Papel atualizado!');
    fetchTeam();
  };

  const removeMember = async (userId: string, memberName: string) => {
    if (!confirm(`Tem certeza que deseja remover "${memberName}" do workspace?`)) return;
    // Delete roles first, then profile
    await supabase.from('user_roles').delete().eq('user_id', userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) { toast.error(error.message); return; }
    toast.success(`${memberName} removido do workspace.`);
    fetchTeam();
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase.from('config').update(config).eq('workspace_id', workspaceId!);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Configurações salvas!');
  };

  const saveMaterial = async () => {
    if (!matName || matPrice === undefined) return;
    setSaving(true);
    if (editMat) {
      const { error } = await supabase.from('materials').update({ name: matName, price_per_kg: matPrice }).eq('id', editMat.id);
      if (error) toast.error(error.message);
      else {
        setMaterials(prev => prev.map(m => m.id === editMat.id ? { ...m, name: matName, price_per_kg: matPrice } : m));
        toast.success('Material atualizado!');
      }
    } else {
      const { data, error } = await supabase.from('materials').insert({ name: matName, price_per_kg: matPrice, workspace_id: workspaceId! }).select().single();
      if (error) toast.error(error.message);
      else {
        setMaterials(prev => [...prev, data]);
        toast.success('Material criado!');
      }
    }
    setSaving(false);
    setMatDialogOpen(false);
    setEditMat(null);
    setMatName('');
    setMatPrice(undefined);
  };

  const toggleMaterial = async (id: string, active: boolean) => {
    await supabase.from('materials').update({ active }).eq('id', id);
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, active } : m));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const configField = (label: string, key: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <CurrencyInput value={config?.[key] ?? 0} onCustomValueChange={v => setConfig((p: any) => ({ ...p, [key]: v ?? 0 }))} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configurações</h2>
      <Tabs defaultValue="costs">
        <TabsList>
          <TabsTrigger value="costs">Custos Gerais</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" />Equipe</TabsTrigger>
        </TabsList>
        <TabsContent value="costs">
          <Card>
            <CardHeader><CardTitle>Parâmetros de Custo</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {configField('Energia por hora (R$)', 'energy_per_h')}
              {configField('Mão de obra por hora (R$)', 'labor_per_h')}
              {configField('Embalagem padrão (R$)', 'packaging_default')}
              <div className="space-y-2">
                <Label>Markup Material (x)</Label>
                <Input type="number" step="0.1" value={config?.markup_material ?? 1.5} onChange={e => setConfig((p: any) => ({ ...p, markup_material: parseFloat(e.target.value) || 0 }))} />
              </div>
              {configField('Preço impressão/hora (R$)', 'print_price_per_h')}
              {configField('Taxa base (R$)', 'base_fee')}
              {configField('Preço mínimo pedido (R$)', 'min_order_price')}
              {configField('Desconto Fortaleza (R$)', 'fortaleza_discount')}
              <div className="sm:col-span-2">
                <Button onClick={saveConfig} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="materials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Materiais</CardTitle>
              <Dialog open={matDialogOpen} onOpenChange={o => { setMatDialogOpen(o); if (!o) { setEditMat(null); setMatName(''); setMatPrice(undefined); } }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />Novo Material</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editMat ? 'Editar Material' : 'Novo Material'}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Nome</Label><Input value={matName} onChange={e => setMatName(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Preço por Kg (R$)</Label><CurrencyInput value={matPrice} onCustomValueChange={setMatPrice} /></div>
                    <Button onClick={saveMaterial} disabled={saving} className="w-full">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>R$/Kg</TableHead>
                    <TableHead>R$/g</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{formatCurrency(m.price_per_kg)}</TableCell>
                      <TableCell>{formatCurrency(m.price_per_kg / 1000)}</TableCell>
                      <TableCell><Switch checked={m.active} onCheckedChange={v => toggleMaterial(m.id, v)} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => { setEditMat(m); setMatName(m.name); setMatPrice(m.price_per_kg); setMatDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {materials.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum material cadastrado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Equipe do Workspace</CardTitle>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><UserPlus className="mr-2 h-4 w-4" />Convidar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Convidar Membro</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@exemplo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Papel</Label>
                      <Select value={inviteRole} onValueChange={v => setInviteRole(v as AppRole)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="OPERADOR">Operador</SelectItem>
                          <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">O usuário convidado precisará criar uma conta com este email. Ao se cadastrar, será automaticamente adicionado ao seu workspace.</p>
                    <Button onClick={sendInvite} disabled={inviting || !inviteEmail} className="w-full">
                      {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enviar Convite
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Membros Atuais</h4>
                <Table>
                  <TableHeader>
                     <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Papel</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map(m => {
                      const isCurrentUser = m.id === profile?.id;
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            {m.name} {isCurrentUser && <span className="text-muted-foreground text-xs">(você)</span>}
                          </TableCell>
                          <TableCell>
                            {isCurrentUser ? (
                              <div className="flex gap-1">
                                {m.roles.map(r => (
                                  <Badge key={r} variant={r === 'ADMIN' ? 'default' : 'secondary'}>{r}</Badge>
                                ))}
                              </div>
                            ) : (
                              <Select value={m.roles[0] || 'OPERADOR'} onValueChange={v => changeRole(m.id, v as AppRole)}>
                                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                  <SelectItem value="OPERADOR">Operador</SelectItem>
                                  <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            {!isCurrentUser && (
                              <Button variant="ghost" size="icon" onClick={() => removeMember(m.id, m.name)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {invitations.filter(i => i.status === 'pending').length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Convites Pendentes</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.filter(i => i.status === 'pending').map(i => (
                        <TableRow key={i.id}>
                          <TableCell>{i.email}</TableCell>
                          <TableCell><Badge variant="outline">{i.role}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{new Date(i.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => cancelInvite(i.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
