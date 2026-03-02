import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Search, Download, ImagePlus, X, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { exportToCsv } from '@/lib/exportCsv';

const BUCKET = 'product-images';

function getPublicUrl(path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export default function Products() {
  const { profile, canEdit } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editProd, setEditProd] = useState<any>(null);
  const [form, setForm] = useState({ name: '', category: 'Impressão 3D' as string, default_material_id: '' as string, default_color: '', avg_time_h: '', avg_weight_g: '', fixed_price: undefined as number | undefined, notes: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspaceId = profile?.workspace_id;

  const fetchData = async () => {
    if (!workspaceId) return;
    setLoading(true);
    const [prodRes, matRes] = await Promise.all([
      supabase.from('products').select('*, materials(name)').eq('workspace_id', workspaceId).order('name'),
      supabase.from('materials').select('*').eq('workspace_id', workspaceId).eq('active', true).order('name'),
    ]);
    setProducts(prodRes.data ?? []);
    setMaterials(matRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [workspaceId]);

  const openEdit = (p: any) => {
    setEditProd(p);
    setForm({ name: p.name, category: p.category, default_material_id: p.default_material_id ?? '', default_color: p.default_color ?? '', avg_time_h: p.avg_time_h?.toString() ?? '', avg_weight_g: p.avg_weight_g?.toString() ?? '', fixed_price: p.fixed_price ?? undefined, notes: p.notes ?? '' });
    setImageFile(null);
    setImagePreview(p.image_url || null);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditProd(null);
    setForm({ name: '', category: 'Impressão 3D', default_material_id: '', default_color: '', avg_time_h: '', avg_weight_g: '', fixed_price: undefined, notes: '' });
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (productId: string): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop() ?? 'jpg';
    const path = `${workspaceId}/${productId}.${ext}`;

    setUploading(true);
    const { error } = await supabase.storage.from(BUCKET).upload(path, imageFile, { upsert: true });
    setUploading(false);

    if (error) {
      toast.error(`Erro no upload: ${error.message}`);
      return null;
    }
    return getPublicUrl(path);
  };

  const removeImage = async (productId: string, currentUrl: string) => {
    // Extract path from URL
    const urlParts = currentUrl.split(`${BUCKET}/`);
    if (urlParts.length > 1) {
      await supabase.storage.from(BUCKET).remove([urlParts[1]]);
    }
    await supabase.from('products').update({ image_url: null }).eq('id', productId);
    toast.success('Imagem removida!');
    fetchData();
  };

  const generateAiImage = async () => {
    if (!editProd?.id || !workspaceId) {
      toast.error('Salve o produto primeiro para gerar uma imagem com IA');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Preencha o nome do produto');
      return;
    }
    setGeneratingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-image', {
        body: {
          productName: form.name,
          category: form.category,
          productId: editProd.id,
          workspaceId,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setImagePreview(data.imageUrl + '?t=' + Date.now());
        setImageFile(null);
        toast.success('Imagem gerada com IA!');
        fetchData();
      } else {
        toast.error(data?.error || 'Erro ao gerar imagem');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar imagem');
    } finally {
      setGeneratingAi(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      default_material_id: form.default_material_id || null,
      default_color: form.default_color || null,
      avg_time_h: form.avg_time_h ? parseFloat(form.avg_time_h) : null,
      avg_weight_g: form.avg_weight_g ? parseFloat(form.avg_weight_g) : null,
      fixed_price: form.fixed_price ?? null,
      notes: form.notes || null,
      workspace_id: workspaceId!,
    };

    let productId = editProd?.id;

    if (editProd) {
      const { error } = await supabase.from('products').update(payload).eq('id', editProd.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      productId = data.id;
    }

    // Upload image if selected
    if (imageFile && productId) {
      const imageUrl = await uploadImage(productId);
      if (imageUrl) {
        await supabase.from('products').update({ image_url: imageUrl }).eq('id', productId);
      }
    }

    toast.success(editProd ? 'Produto atualizado!' : 'Produto criado!');
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const del = async (id: string) => {
    // Also remove image from storage
    const product = products.find(p => p.id === id);
    if (product?.image_url) {
      const urlParts = product.image_url.split(`${BUCKET}/`);
      if (urlParts.length > 1) {
        await supabase.storage.from(BUCKET).remove([urlParts[1]]);
      }
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Produto excluído!'); fetchData(); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCsv(
            'produtos.csv',
            ['Nome', 'Categoria', 'Material', 'Cor Padrão', 'Tempo Médio (h)', 'Peso Médio (g)', 'Preço Fixo', 'Observações'],
            filtered.map(p => [p.name, p.category, p.materials?.name ?? '', p.default_color ?? '', p.avg_time_h?.toString() ?? '', p.avg_weight_g?.toString() ?? '', p.fixed_price?.toString() ?? '', p.notes ?? ''])
          )} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />Exportar CSV
          </Button>
          {canEdit() && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Produto</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editProd ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Image upload */}
                  <div className="space-y-2">
                    <Label>Imagem do Produto</Label>
                    <div className="flex items-start gap-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 w-24 rounded-lg border object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <ImagePlus className="h-6 w-6 mb-1" />
                          <span className="text-xs">Upload</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="flex flex-col gap-2">
                        {imagePreview && (
                          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            Trocar imagem
                          </Button>
                        )}
                        {editProd && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateAiImage}
                            disabled={generatingAi || !form.name.trim()}
                          >
                            {generatingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            {generatingAi ? 'Gerando...' : 'Gerar com IA'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Impressão 3D">Impressão 3D</SelectItem><SelectItem value="Laser">Laser</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Material Padrão</Label>
                    <Select value={form.default_material_id} onValueChange={v => setForm(p => ({ ...p, default_material_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{materials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Cor Padrão</Label><Input value={form.default_color} onChange={e => setForm(p => ({ ...p, default_color: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Tempo Médio (h)</Label><Input type="number" step="0.1" value={form.avg_time_h} onChange={e => setForm(p => ({ ...p, avg_time_h: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Peso Médio (g)</Label><Input type="number" step="0.1" value={form.avg_weight_g} onChange={e => setForm(p => ({ ...p, avg_weight_g: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Preço Fixo</Label><CurrencyInput value={form.fixed_price} onCustomValueChange={v => setForm(p => ({ ...p, fixed_price: v }))} /></div>
                  </div>
                  <div className="space-y-2"><Label>Observações</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                  <Button onClick={save} className="w-full" disabled={saving || uploading}>
                    {(saving || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Preço Fixo</TableHead>
              {canEdit() && <TableHead className="w-20"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.materials?.name ?? '-'}</TableCell>
                <TableCell>{p.fixed_price ? formatCurrency(p.fixed_price) : '-'}</TableCell>
                {canEdit() && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Excluir produto?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => del(p.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum produto encontrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
