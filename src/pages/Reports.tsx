import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { format, subMonths } from 'date-fns';

export default function Reports() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState('all');

  const workspaceId = profile?.workspace_id;

  useEffect(() => {
    if (!workspaceId) return;
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from('orders').select('*, clients(name)').eq('workspace_id', workspaceId).gte('order_date', startDate).lte('order_date', endDate).order('order_date', { ascending: false });
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data } = await query;
      setOrders(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [workspaceId, startDate, endDate, statusFilter]);

  const totalRevenue = orders.reduce((s, o) => s + (o.totals_json?.total_revenue ?? 0), 0);
  const totalProfit = orders.reduce((s, o) => s + (o.totals_json?.total_profit ?? 0), 0);
  const totalCost = orders.reduce((s, o) => s + (o.totals_json?.total_cost ?? 0), 0);

  const sanitize = (v: string) => {
    if (!v) return '';
    if (/^[=+\-@\t\r]/.test(v)) return "'" + v;
    return v;
  };

  const exportCSV = () => {
    const header = 'Data,Cliente,Status,Faturamento,Custo,Lucro,Margem\n';
    const rows = orders.map(o =>
      `${o.order_date},"${sanitize(o.clients?.name ?? '').replace(/"/g, '""')}","${sanitize(o.status)}",${(o.totals_json?.total_revenue ?? 0).toFixed(2)},${(o.totals_json?.total_cost ?? 0).toFixed(2)},${(o.totals_json?.total_profit ?? 0).toFixed(2)},${(o.totals_json?.margin ?? 0).toFixed(1)}%`
    ).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${startDate}_${endDate}.csv`;
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />Exportar CSV</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1"><Label className="text-xs">De</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" /></div>
        <div className="space-y-1"><Label className="text-xs">Até</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" /></div>
        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {['Orçado', 'Aprovado', 'Produzindo', 'Pronto', 'Entregue', 'Cancelado'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Faturamento Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Custo Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalCost)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Lucro Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p></CardContent></Card>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Faturamento</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>Margem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(o => (
              <TableRow key={o.id}>
                <TableCell>{o.order_date}</TableCell>
                <TableCell className="font-medium">{o.clients?.name ?? '-'}</TableCell>
                <TableCell>{o.status}</TableCell>
                <TableCell>{formatCurrency(o.totals_json?.total_revenue ?? 0)}</TableCell>
                <TableCell>{formatCurrency(o.totals_json?.total_cost ?? 0)}</TableCell>
                <TableCell>{formatCurrency(o.totals_json?.total_profit ?? 0)}</TableCell>
                <TableCell>{(o.totals_json?.margin ?? 0).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum pedido no período</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
