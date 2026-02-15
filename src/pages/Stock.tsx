import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, AlertTriangle } from 'lucide-react';

export default function Stock() {
  const { profile, canEdit } = useAuth();
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'entrada' | 'saida'>('entrada');
  const [adjustReason, setAdjustReason] = useState('Compra');
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newMat, setNewMat] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newMinG, setNewMinG] = useState('');

  const workspaceId = profile?.workspace_id;

  const fetchData = async () => {
    if (!workspaceId) return;
    setLoading(true);
    const [stockRes, matRes] = await Promise.all([
      supabase.from('stock').select('*, materials(name)').eq('workspace_id', workspaceId).order('color'),
      supabase.from('materials').select('*').eq('workspace_id', workspaceId).eq('active', true).order('name'),
    ]);
    setStockItems(stockRes.data ?? []);
    setMaterials(matRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [workspaceId]);

  const handleAdjust = async () => {
    if (!adjustQty || !selectedStock) return;
    const qty = parseFloat(adjustQty);
    const delta = adjustType === 'entrada' ? qty : -qty;
    setSaving(true);
    const newQty = (selectedStock.qty_g ?? 0) + delta;
    const { error: stockErr } = await supabase.from('stock').update({ qty_g: newQty }).eq('id', selectedStock.id);
    if (stockErr) { toast.error(stockErr.message); setSaving(false); return; }
    await supabase.from('stock_movements').insert({
      workspace_id: workspaceId!,
      material_id: selectedStock.material_id,
      color: selectedStock.color,
      qty_delta_g: delta,
      reason: adjustReason,
      created_by: profile?.id,
    });
    toast.success('Estoque ajustado!');
    setSaving(false);
    setAdjustOpen(false);
    fetchData();
  };

  const handleAddStock = async () => {
    if (!newMat || !newColor) { toast.error('Preencha material e cor'); return; }
    setSaving(true);
    const { error } = await supabase.from('stock').insert({
      workspace_id: workspaceId!,
      material_id: newMat,
      color: newColor,
      min_g: newMinG ? parseFloat(newMinG) : 0,
    });
    if (error) toast.error(error.message); else toast.success('Item de estoque criado!');
    setSaving(false);
    setAddOpen(false);
    setNewMat('');
    setNewColor('');
    setNewMinG('');
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estoque</h2>
        {canEdit() && <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo Item</Button>}
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Qtd Atual (g)</TableHead>
              <TableHead>Mínimo (g)</TableHead>
              <TableHead>Status</TableHead>
              {canEdit() && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockItems.map(s => {
              const low = (s.qty_g ?? 0) <= (s.min_g ?? 0);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.materials?.name ?? '-'}</TableCell>
                  <TableCell>{s.color}</TableCell>
                  <TableCell>{s.qty_g?.toFixed(0)}g</TableCell>
                  <TableCell>{s.min_g?.toFixed(0)}g</TableCell>
                  <TableCell>{low ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Baixo</Badge> : <Badge variant="secondary">OK</Badge>}</TableCell>
                  {canEdit() && (
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedStock(s); setAdjustQty(''); setAdjustOpen(true); }}>Ajustar</Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {stockItems.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum item no estoque</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajustar Estoque - {selectedStock?.materials?.name} ({selectedStock?.color})</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={adjustType} onValueChange={v => setAdjustType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="entrada">Entrada (+)</SelectItem><SelectItem value="saida">Saída (-)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Quantidade (g)</Label><Input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select value={adjustReason} onValueChange={setAdjustReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Compra">Compra</SelectItem><SelectItem value="Perda">Perda</SelectItem><SelectItem value="Ajuste">Ajuste</SelectItem><SelectItem value="Outros">Outros</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdjust} className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Item de Estoque</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Material</Label>
              <Select value={newMat} onValueChange={setNewMat}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{materials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Cor</Label><Input value={newColor} onChange={e => setNewColor(e.target.value)} /></div>
            <div className="space-y-2"><Label>Mínimo (g)</Label><Input type="number" value={newMinG} onChange={e => setNewMinG(e.target.value)} /></div>
            <Button onClick={handleAddStock} className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
