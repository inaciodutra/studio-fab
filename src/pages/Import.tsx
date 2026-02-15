import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, FileUp, CheckCircle2, AlertCircle, Loader2, X, Download } from 'lucide-react';

type ImportTarget = 'clients' | 'products';

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
}

const CLIENT_FIELDS = [
  { key: 'name', label: 'Nome', required: true },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'city', label: 'Cidade' },
  { key: 'neighborhood', label: 'Bairro' },
  { key: 'channel', label: 'Canal' },
  { key: 'notes', label: 'Observações' },
];

const PRODUCT_FIELDS = [
  { key: 'name', label: 'Nome', required: true },
  { key: 'category', label: 'Categoria', required: true },
  { key: 'avg_time_h', label: 'Tempo Médio (h)' },
  { key: 'avg_weight_g', label: 'Peso Médio (g)' },
  { key: 'fixed_price', label: 'Preço Fixo' },
  { key: 'default_color', label: 'Cor Padrão' },
  { key: 'notes', label: 'Observações' },
];

function getFields(target: ImportTarget) {
  return target === 'clients' ? CLIENT_FIELDS : PRODUCT_FIELDS;
}

function autoMapColumns(csvHeaders: string[], target: ImportTarget): Record<string, string> {
  const fields = getFields(target);
  const mapping: Record<string, string> = {};
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

  const aliases: Record<string, string[]> = {
    name: ['nome', 'name', 'cliente', 'produto'],
    whatsapp: ['whatsapp', 'telefone', 'phone', 'celular', 'tel'],
    city: ['cidade', 'city'],
    neighborhood: ['bairro', 'neighborhood'],
    channel: ['canal', 'channel', 'origem'],
    notes: ['observacoes', 'observacao', 'obs', 'notes', 'nota'],
    category: ['categoria', 'category', 'tipo', 'type'],
    avg_time_h: ['tempo', 'time', 'horas', 'tempomedio', 'avgtimeh'],
    avg_weight_g: ['peso', 'weight', 'gramas', 'pesomedio', 'avgweightg'],
    fixed_price: ['preco', 'price', 'precofixo', 'fixedprice', 'valor'],
    default_color: ['cor', 'color', 'corpadrao', 'defaultcolor'],
  };

  for (const csvHeader of csvHeaders) {
    const norm = normalize(csvHeader);
    for (const field of fields) {
      const fieldAliases = aliases[field.key] ?? [field.key];
      if (fieldAliases.some(a => norm === a || norm.includes(a))) {
        mapping[csvHeader] = field.key;
        break;
      }
    }
  }
  return mapping;
}

interface RowValidation {
  row: Record<string, string>;
  errors: string[];
  rowIndex: number;
}

function validateRows(rows: Record<string, string>[], mapping: Record<string, string>, target: ImportTarget): RowValidation[] {
  const fields = getFields(target);
  const requiredKeys = fields.filter(f => f.required).map(f => f.key);
  const reverseMap: Record<string, string> = {};
  for (const [csv, db] of Object.entries(mapping)) {
    reverseMap[db] = csv;
  }

  return rows.map((row, i) => {
    const errors: string[] = [];
    for (const req of requiredKeys) {
      const csvCol = reverseMap[req];
      if (!csvCol || !row[csvCol]?.trim()) {
        const label = fields.find(f => f.key === req)?.label ?? req;
        errors.push(`"${label}" é obrigatório`);
      }
    }
    return { row, errors, rowIndex: i + 2 };
  });
}

function buildInsertData(rows: RowValidation[], mapping: Record<string, string>, workspaceId: string, target: ImportTarget) {
  const numericFields = ['avg_time_h', 'avg_weight_g', 'fixed_price'];
  return rows.filter(r => r.errors.length === 0).map(r => {
    const obj: Record<string, any> = { workspace_id: workspaceId };
    for (const [csvCol, dbCol] of Object.entries(mapping)) {
      let val: any = r.row[csvCol]?.trim() ?? null;
      if (val === '') val = null;
      if (numericFields.includes(dbCol) && val !== null) {
        val = parseFloat(val.replace(',', '.'));
        if (isNaN(val)) val = null;
      }
      obj[dbCol] = val;
    }
    return obj;
  });
}

function downloadTemplate(target: ImportTarget) {
  const fields = getFields(target);
  const csv = fields.map(f => f.label).join(';') + '\n';
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `modelo_${target}.csv`;
  link.click();
}

export default function Import() {
  const { profile, canEdit } = useAuth();
  const [target, setTarget] = useState<ImportTarget>('clients');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<RowValidation[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setValidated(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setValidated(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const rows = results.data as Record<string, string>[];
        if (headers.length === 0 || rows.length === 0) {
          toast.error('Arquivo vazio ou formato inválido');
          return;
        }
        setCsvHeaders(headers);
        setCsvRows(rows);
        setMapping(autoMapColumns(headers, target));
      },
      error: () => toast.error('Erro ao ler arquivo CSV'),
    });
  };

  const handleValidate = () => {
    const result = validateRows(csvRows, mapping, target);
    setValidated(result);
    const errorCount = result.filter(r => r.errors.length > 0).length;
    if (errorCount === 0) {
      toast.success(`${result.length} linhas validadas com sucesso!`);
    } else {
      toast.warning(`${errorCount} linhas com erro de ${result.length} total`);
    }
  };

  const handleImport = async () => {
    if (!validated || !profile?.workspace_id) return;
    const data = buildInsertData(validated, mapping, profile.workspace_id, target);
    if (data.length === 0) {
      toast.error('Nenhuma linha válida para importar');
      return;
    }

    setImporting(true);
    const { error, data: inserted } = await supabase.from(target).insert(data as any).select('id');
    setImporting(false);

    if (error) {
      toast.error(`Erro na importação: ${error.message}`);
    } else {
      const successCount = inserted?.length ?? 0;
      const errorCount = validated.filter(r => r.errors.length > 0).length;
      setResult({ success: successCount, errors: errorCount });
      toast.success(`${successCount} registros importados!`);
    }
  };

  const updateMapping = (csvCol: string, dbCol: string) => {
    setMapping(prev => {
      const next = { ...prev };
      if (dbCol === '_ignore') {
        delete next[csvCol];
      } else {
        next[csvCol] = dbCol;
      }
      return next;
    });
    setValidated(null);
  };

  const fields = getFields(target);
  const errorRows = validated?.filter(r => r.errors.length > 0) ?? [];
  const validCount = validated ? validated.filter(r => r.errors.length === 0).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Importar CSV</h2>
      </div>

      {/* Step 1: Target + Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            1. Selecionar tipo e arquivo
          </CardTitle>
          <CardDescription>Escolha o que deseja importar e faça upload do arquivo CSV.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Importar para</label>
              <Select value={target} onValueChange={(v: ImportTarget) => { setTarget(v); reset(); }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clients">Clientes</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivo CSV</label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFile}
                className="block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadTemplate(target)}>
              <Download className="mr-2 h-4 w-4" />
              Baixar modelo
            </Button>
            {csvHeaders.length > 0 && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="mr-2 h-4 w-4" />Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Column Mapping */}
      {csvHeaders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Mapear colunas</CardTitle>
            <CardDescription>Associe as colunas do CSV aos campos do sistema. Colunas não mapeadas serão ignoradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {csvHeaders.map(h => (
                <div key={h} className="flex items-center gap-2">
                  <span className="min-w-[120px] truncate text-sm font-medium" title={h}>{h}</span>
                  <span className="text-muted-foreground">→</span>
                  <Select value={mapping[h] ?? '_ignore'} onValueChange={v => updateMapping(h, v)}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_ignore">— Ignorar —</SelectItem>
                      {fields.map(f => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}{f.required ? ' *' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleValidate}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Validar dados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview + Validation */}
      {validated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              3. Preview e validação
              <Badge variant={errorRows.length > 0 ? 'destructive' : 'default'}>
                {validCount} válidas / {errorRows.length} com erro
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorRows.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <p className="text-sm font-medium text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Linhas com erro (serão ignoradas na importação):
                </p>
                <ul className="text-sm text-destructive/80 space-y-1 max-h-40 overflow-auto list-none">
                  {errorRows.map(r => (
                    <li key={r.rowIndex}>Linha {r.rowIndex}: {r.errors.join(', ')}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg border overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Linha</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    {Object.entries(mapping).map(([csv, db]) => (
                      <TableHead key={csv}>{fields.find(f => f.key === db)?.label ?? db}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validated.slice(0, 50).map(r => (
                    <TableRow key={r.rowIndex} className={r.errors.length > 0 ? 'bg-destructive/5' : ''}>
                      <TableCell className="text-muted-foreground text-xs">{r.rowIndex}</TableCell>
                      <TableCell>
                        {r.errors.length > 0
                          ? <AlertCircle className="h-4 w-4 text-destructive" />
                          : <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </TableCell>
                      {Object.entries(mapping).map(([csv]) => (
                        <TableCell key={csv} className="text-sm max-w-[200px] truncate">{r.row[csv] ?? ''}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {validated.length > 50 && (
                <p className="p-3 text-center text-xs text-muted-foreground">
                  Mostrando 50 de {validated.length} linhas
                </p>
              )}
            </div>

            {validCount > 0 && !result && canEdit() && (
              <Button onClick={handleImport} disabled={importing} size="lg">
                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                Importar {validCount} registro{validCount > 1 ? 's' : ''}
              </Button>
            )}

            {result && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Importação concluída: {result.success} importados, {result.errors} ignorados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
