import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';

export default function Clients() {
  const { profile, canEdit } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [form, setForm] = useState({ name: '', whatsapp: '', city: '', neighborhood: '', channel: '', notes: '' });

  const workspaceId = profile?.workspace_id;

  const fetchClients = async () => {
    if (!workspaceId) return;
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').eq('workspace_id', workspaceId).order('name');
    setClients(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, [workspaceId]);

  const openEdit = (c: any) => {
    setEditClient(c);
    setForm({ name: c.name, whatsapp: c.whatsapp ?? '', city: c.city ?? '', neighborhood: c.neighborhood ?? '', channel: c.channel ?? '', notes: c.notes ?? '' });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditClient(null);
    setForm({ name: '', whatsapp: '', city: '', neighborhood: '', channel: '', notes: '' });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    if (editClient) {
      const { error } = await supabase.from('clients').update(form).eq('id', editClient.id);
      if (error) toast.error(error.message); else toast.success('Cliente atualizado!');
    } else {
      const { error } = await supabase.from('clients').insert({ ...form, workspace_id: workspaceId! });
      if (error) toast.error(error.message); else toast.success('Cliente criado!');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchClients();
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Cliente excluído!'); fetchClients(); }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clientes</h2>
        {canEdit() && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Cliente</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="85988887777" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Bairro</Label><Input value={form.neighborhood} onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))} /></div>
                </div>
                <div className="space-y-2"><Label>Canal</Label><Input value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} placeholder="Instagram, WhatsApp..." /></div>
                <div className="space-y-2"><Label>Observações</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                <Button onClick={save} className="w-full" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Canal</TableHead>
              {canEdit() && <TableHead className="w-20"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.whatsapp}</TableCell>
                <TableCell>{c.city}{c.neighborhood ? ` - ${c.neighborhood}` : ''}</TableCell>
                <TableCell>{c.channel}</TableCell>
                {canEdit() && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Excluir cliente?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => del(c.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum cliente encontrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
