import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

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

  const workspaceId = profile?.workspace_id;

  useEffect(() => {
    if (!workspaceId) return;
    const fetch = async () => {
      const [configRes, matRes] = await Promise.all([
        supabase.from('config').select('*').eq('workspace_id', workspaceId).maybeSingle(),
        supabase.from('materials').select('*').eq('workspace_id', workspaceId).order('name'),
      ]);
      setConfig(configRes.data);
      setMaterials(matRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, [workspaceId]);

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
      </Tabs>
    </div>
  );
}
