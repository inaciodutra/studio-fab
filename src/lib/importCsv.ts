export type ImportTarget = 'clients' | 'products';

export interface ImportField {
  key: string;
  label: string;
  required?: boolean;
}

export interface RowValidation {
  row: Record<string, string>;
  errors: string[];
  rowIndex: number;
}

const CLIENT_FIELDS: ImportField[] = [
  { key: 'name', label: 'Nome', required: true },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'city', label: 'Cidade' },
  { key: 'neighborhood', label: 'Bairro' },
  { key: 'channel', label: 'Canal' },
  { key: 'notes', label: 'Observacoes' },
];

const PRODUCT_FIELDS: ImportField[] = [
  { key: 'name', label: 'Nome', required: true },
  { key: 'category', label: 'Categoria', required: true },
  { key: 'avg_time_h', label: 'Tempo medio (h)' },
  { key: 'avg_weight_g', label: 'Peso medio (g)' },
  { key: 'fixed_price', label: 'Preco fixo' },
  { key: 'default_color', label: 'Cor padrao' },
  { key: 'notes', label: 'Observacoes' },
];

export function getImportFields(target: ImportTarget): ImportField[] {
  return target === 'clients' ? CLIENT_FIELDS : PRODUCT_FIELDS;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function autoMapColumns(csvHeaders: string[], target: ImportTarget): Record<string, string> {
  const fields = getImportFields(target);
  const mapping: Record<string, string> = {};

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
    const normalizedHeader = normalizeText(csvHeader);
    for (const field of fields) {
      const fieldAliases = aliases[field.key] ?? [field.key];
      if (fieldAliases.some(alias => normalizedHeader === alias || normalizedHeader.includes(alias))) {
        mapping[csvHeader] = field.key;
        break;
      }
    }
  }

  return mapping;
}

export function validateRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  target: ImportTarget,
): RowValidation[] {
  const fields = getImportFields(target);
  const requiredKeys = fields.filter(field => field.required).map(field => field.key);
  const reverseMap: Record<string, string> = {};

  for (const [csvColumn, dbColumn] of Object.entries(mapping)) {
    reverseMap[dbColumn] = csvColumn;
  }

  return rows.map((row, index) => {
    const errors: string[] = [];
    for (const requiredKey of requiredKeys) {
      const csvColumn = reverseMap[requiredKey];
      if (!csvColumn || !row[csvColumn]?.trim()) {
        const label = fields.find(field => field.key === requiredKey)?.label ?? requiredKey;
        errors.push(`"${label}" e obrigatorio`);
      }
    }
    return { row, errors, rowIndex: index + 2 };
  });
}

export function buildInsertData(
  rows: RowValidation[],
  mapping: Record<string, string>,
  workspaceId: string,
): Record<string, unknown>[] {
  const numericFields = ['avg_time_h', 'avg_weight_g', 'fixed_price'];

  return rows
    .filter(row => row.errors.length === 0)
    .map(row => {
      const result: Record<string, unknown> = { workspace_id: workspaceId };
      for (const [csvColumn, dbColumn] of Object.entries(mapping)) {
        let value: unknown = row.row[csvColumn]?.trim() ?? null;
        if (value === '') value = null;
        if (numericFields.includes(dbColumn) && typeof value === 'string' && value !== null) {
          const parsed = parseFloat(value.replace(',', '.'));
          value = Number.isNaN(parsed) ? null : parsed;
        }
        result[dbColumn] = value;
      }
      return result;
    });
}
