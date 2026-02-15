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
import { Textarea } from '@/components/ui/textarea';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { toast } from 'sonner';
import { Loader2, Plus, Eye, Search } from 'lucide-react';
import { formatCurrency, calculateOrderItem, calculateOrderTotals, type ConfigForCalc } from '@/lib/calculations';
import { format } from 'date-fns';

const STATUSES = ['Orçado', 'Aprovado', 'Produzindo', 'Pronto', 'Entregue', 'Cancelado'];
const STATUS_COLORS: Record<string, string> = {
  'Orçado': 'bg-muted text-muted-foreground',
  'Aprovado': 'bg-primary/10 text-primary',
  'Produzindo': 'bg-warning/10 text-warning-foreground',
  'Pronto': 'bg-success/10 text-success-foreground',
  'Entregue': 'bg-success text-success-foreground',
  'Cancelado': 'bg-destructive/10 text-destructive',
};

export default function Orders() {
  const { profile, canEdit } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Order form
  const [form, setForm] = useState({
    order_date: format(new Date(), 'yyyy-MM-dd'),
    client_id: '',
    status: 'Orçado',
    payment_method: '',
    delivery_method: '',
    city: '',
    discount: 0,
    freight: 0,
    notes: '',
  });
  const [items, setItems] = useState<any[]>([]);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [viewItems, setViewItems] = useState<any[]>([]);
  const [viewOpen, setViewOpen] = useState(false);

  const workspaceId = profile?.workspace_id;

  const fetchData = async () => {
    if (!workspaceId) return;
    setLoading(true);
    const [ordRes, cliRes, prodRes, matRes, confRes] = await Promise.all([
      supabase.from('orders').select('*, clients(name)').eq('workspace_id', workspaceId).order('order_date', { ascending: false }),
      supabase.from('clients').select('*').eq('workspace_id', workspaceId).order('name'),
      supabase.from('products').select('*').eq('workspace_id', workspaceId).order('name'),
      supabase.from('materials').select('*').eq('workspace_id', workspaceId).eq('active', true).order('name'),
      supabase.from('config').select('*').eq('workspace_id', workspaceId).maybeSingle(),
    ]);
    setOrders(ordRes.data ?? []);
    setClients(cliRes.data ?? []);
    setProducts(prodRes.data ?? []);
    setMaterials(matRes.data ?? []);
    setConfig(confRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [workspaceId]);

  const addItem = () => {
    setItems(prev => [...prev, { product_id: '', material_id: '', color: '', qty: 1, time_h: 0, weight_g: 0, fixed_price: null, other_cost: 0 }]);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Auto-fill from product
      if (field === 'product_id') {
        const prod = products.find(p => p.id === value);
        if (prod) {
          next[idx].material_id = prod.default_material_id ?? '';
          next[idx].color = prod.default_color ?? '';
          next[idx].time_h = prod.avg_time_h ?? 0;
          next[idx].weight_g = prod.avg_weight_g ?? 0;
          next[idx].fixed_price = prod.fixed_price ?? null;
        }
      }
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const getItemCalc = (item: any) => {
    if (!config) return null;
    const mat = materials.find(m => m.id === item.material_id);
    if (!mat) return null;
    const cfgForCalc: ConfigForCalc = {
      energy_per_h: config.energy_per_h ?? 0,
      labor_per_h: config.labor_per_h ?? 0,
      markup_material: config.markup_material ?? 1.5,
      print_price_per_h: config.print_price_per_h ?? 0,
      base_fee: config.base_fee ?? 0,
      min_order_price: config.min_order_price ?? 0,
      fortaleza_discount: config.fortaleza_discount ?? 0,
    };
    return calculateOrderItem({
      qty: item.qty || 1,
      time_h: item.time_h || 0,
      weight_g: item.weight_g || 0,
      material: { price_per_kg: mat.price_per_kg },
      config: cfgForCalc,
      fixed_price: item.fixed_price,
      other_cost: item.other_cost || 0,
      is_fortaleza: form.city?.toLowerCase().includes('fortaleza'),
    });
  };

  const itemCalcs = items.map(getItemCalc);
  const validCalcs = itemCalcs.filter(Boolean) as any[];
  const totals = calculateOrderTotals(validCalcs, form.discount, form.freight);

  const saveOrder = async () => {
    if (!form.client_id || !form.order_date) { toast.error('Preencha data e cliente'); return; }
    if (items.length === 0) { toast.error('Adicione pelo menos um item'); return; }
    setSaving(true);
    const { data: order, error } = await supabase.from('orders').insert({
      workspace_id: workspaceId!,
      order_date: form.order_date,
      client_id: form.client_id,
      status: form.status,
      payment_method: form.payment_method || null,
      delivery_method: form.delivery_method || null,
      city: form.city || null,
      discount: form.discount,
      freight: form.freight,
      notes: form.notes || null,
      totals_json: totals as any,
    }).select().single();

    if (error || !order) { toast.error(error?.message ?? 'Erro ao criar pedido'); setSaving(false); return; }

    const orderItems = items.map((item, idx) => ({
      workspace_id: workspaceId!,
      order_id: order.id,
      product_id: item.product_id || null,
      material_id: item.material_id || null,
      color: item.color || null,
      qty: item.qty || 1,
      time_h: item.time_h || null,
      weight_g: item.weight_g || null,
      fixed_price: item.fixed_price ?? null,
      other_cost: item.other_cost || 0,
      calculated_json: itemCalcs[idx] as any,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) toast.error(itemsErr.message);
    else toast.success('Pedido criado!');

    setSaving(false);
    setDialogOpen(false);
    setItems([]);
    fetchData();
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) toast.error(error.message);
    else {
      toast.success(`Status atualizado para ${newStatus}`);
      // If delivered, decrement stock
      if (newStatus === 'Entregue') {
        const { data: orderItemsData } = await supabase.from('order_items').select('*, products(category)').eq('order_id', orderId);
        if (orderItemsData) {
          for (const item of orderItemsData) {
            if ((item.products as any)?.category === 'Impressão 3D' && item.material_id && item.color && item.weight_g) {
              const delta = -(item.weight_g * item.qty);
              const { data: stockRow } = await supabase.from('stock')
                .select('*')
                .eq('workspace_id', workspaceId!)
                .eq('material_id', item.material_id)
                .eq('color', item.color)
                .maybeSingle();
              if (stockRow) {
                await supabase.from('stock').update({ qty_g: (stockRow.qty_g ?? 0) + delta }).eq('id', stockRow.id);
                await supabase.from('stock_movements').insert({
                  workspace_id: workspaceId!,
                  material_id: item.material_id,
                  color: item.color,
                  qty_delta_g: delta,
                  reason: 'Pedido entregue',
                  ref_type: 'order',
                  ref_id: orderId,
                  created_by: profile?.id,
                });
              }
            }
          }
        }
      }
      fetchData();
    }
  };

  const openView = async (order: any) => {
    setViewOrder(order);
    const { data } = await supabase.from('order_items').select('*, products(name), materials(name)').eq('order_id', order.id);
    setViewItems(data ?? []);
    setViewOpen(true);
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || (o.clients?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        {canEdit() && <Button onClick={() => { setForm({ order_date: format(new Date(), 'yyyy-MM-dd'), client_id: '', status: 'Orçado', payment_method: '', delivery_method: '', city: '', discount: 0, freight: 0, notes: '' }); setItems([]); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Novo Pedido</Button>}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell>{o.order_date}</TableCell>
                <TableCell className="font-medium">{o.clients?.name ?? '-'}</TableCell>
                <TableCell>
                  {canEdit() ? (
                    <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Badge className={STATUS_COLORS[o.status]}>{o.status}</Badge>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(o.totals_json?.total_revenue ?? 0)}</TableCell>
                <TableCell>{formatCurrency(o.totals_json?.total_profit ?? 0)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => openView(o)}><Eye className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum pedido encontrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* New Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Novo Pedido</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Data *</Label><Input type="date" value={form.order_date} onChange={e => setForm(p => ({ ...p, order_date: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={form.client_id} onValueChange={v => setForm(p => ({ ...p, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Pagamento</Label><Input value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} placeholder="Pix, Cartão..." /></div>
              <div className="space-y-2"><Label>Entrega</Label><Input value={form.delivery_method} onChange={e => setForm(p => ({ ...p, delivery_method: e.target.value }))} placeholder="Correios, Retirada..." /></div>
              <div className="space-y-2"><Label>Observações</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Itens</h3>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="mr-1 h-3 w-3" />Adicionar Item</Button>
              </div>
              {items.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum item adicionado</p>}
              {items.map((item, idx) => {
                const calc = itemCalcs[idx];
                return (
                  <div key={idx} className="border rounded-lg p-3 mb-2 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Produto</Label>
                        <Select value={item.product_id} onValueChange={v => updateItem(idx, 'product_id', v)}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Material</Label>
                        <Select value={item.material_id} onValueChange={v => updateItem(idx, 'material_id', v)}>
                          <SelectTrigger className="h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>{materials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1"><Label className="text-xs">Cor</Label><Input className="h-8" value={item.color} onChange={e => updateItem(idx, 'color', e.target.value)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Qtd</Label><Input className="h-8" type="number" min={1} value={item.qty} onChange={e => updateItem(idx, 'qty', parseInt(e.target.value) || 1)} /></div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-5">
                      <div className="space-y-1"><Label className="text-xs">Tempo (h)</Label><Input className="h-8" type="number" step="0.1" value={item.time_h} onChange={e => updateItem(idx, 'time_h', parseFloat(e.target.value) || 0)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Peso (g)</Label><Input className="h-8" type="number" step="0.1" value={item.weight_g} onChange={e => updateItem(idx, 'weight_g', parseFloat(e.target.value) || 0)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Preço Fixo</Label><CurrencyInput className="h-8" value={item.fixed_price ?? ''} onCustomValueChange={v => updateItem(idx, 'fixed_price', v ?? null)} /></div>
                      <div className="space-y-1"><Label className="text-xs">Outro Custo</Label><CurrencyInput className="h-8" value={item.other_cost} onCustomValueChange={v => updateItem(idx, 'other_cost', v ?? 0)} /></div>
                      <div className="flex items-end gap-2">
                        {calc && <span className="text-xs text-muted-foreground">Preço: {formatCurrency(calc.price_final)} | Lucro: {formatCurrency(calc.profit)}</span>}
                        <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => removeItem(idx)}>✕</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Desconto</Label><CurrencyInput value={form.discount} onCustomValueChange={v => setForm(p => ({ ...p, discount: v ?? 0 }))} /></div>
              <div className="space-y-2"><Label>Frete</Label><CurrencyInput value={form.freight} onCustomValueChange={v => setForm(p => ({ ...p, freight: v ?? 0 }))} /></div>
            </div>

            {items.length > 0 && (
              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(totals.subtotal)}</span></div>
                <div className="flex justify-between"><span>Desconto:</span><span>-{formatCurrency(totals.discount)}</span></div>
                <div className="flex justify-between"><span>Frete:</span><span>+{formatCurrency(totals.freight)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>TOTAL:</span><span>{formatCurrency(totals.total_revenue)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Lucro:</span><span>{formatCurrency(totals.total_profit)} ({totals.margin.toFixed(1)}%)</span></div>
              </div>
            )}

            <Button onClick={saveOrder} className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Pedido - {viewOrder?.clients?.name}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Data:</span> {viewOrder.order_date}</div>
                <div><span className="text-muted-foreground">Status:</span> {viewOrder.status}</div>
                <div><span className="text-muted-foreground">Cidade:</span> {viewOrder.city ?? '-'}</div>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Material</TableHead><TableHead>Qtd</TableHead><TableHead>Preço</TableHead></TableRow></TableHeader>
                <TableBody>
                  {viewItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{(item.products as any)?.name ?? '-'}</TableCell>
                      <TableCell>{(item.materials as any)?.name ?? '-'} {item.color ? `(${item.color})` : ''}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{formatCurrency((item.calculated_json as any)?.price_final ?? 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t pt-2 space-y-1 text-sm">
                <div className="flex justify-between font-bold"><span>Total:</span><span>{formatCurrency(viewOrder.totals_json?.total_revenue ?? 0)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Lucro:</span><span>{formatCurrency(viewOrder.totals_json?.total_profit ?? 0)} ({(viewOrder.totals_json?.margin ?? 0).toFixed(1)}%)</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
