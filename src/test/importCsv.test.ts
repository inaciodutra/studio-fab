import { describe, expect, it } from 'vitest';
import { autoMapColumns, buildInsertData, validateRows } from '@/lib/importCsv';

describe('importCsv helpers', () => {
  it('auto maps known headers for clients', () => {
    const headers = ['Nome Cliente', 'Telefone', 'Cidade', 'Obs'];
    const mapping = autoMapColumns(headers, 'clients');

    expect(mapping['Nome Cliente']).toBe('name');
    expect(mapping.Telefone).toBe('whatsapp');
    expect(mapping.Cidade).toBe('city');
    expect(mapping.Obs).toBe('notes');
  });

  it('validates required fields and row indexes', () => {
    const rows = [
      { Nome: 'Ana', Categoria: 'Decor' },
      { Nome: 'Bob', Categoria: '' },
    ];
    const mapping = { Nome: 'name', Categoria: 'category' };

    const result = validateRows(rows, mapping, 'products');

    expect(result[0].errors).toHaveLength(0);
    expect(result[0].rowIndex).toBe(2);
    expect(result[1].errors).toHaveLength(1);
    expect(result[1].rowIndex).toBe(3);
  });

  it('builds insert payload converting numeric values', () => {
    const validated = [
      { row: { Nome: 'Produto A', Tempo: '2,5', Preco: '10.90' }, errors: [], rowIndex: 2 },
      { row: { Nome: 'Produto B', Tempo: 'abc', Preco: '' }, errors: [], rowIndex: 3 },
      { row: { Nome: '', Tempo: '1', Preco: '9' }, errors: ['name required'], rowIndex: 4 },
    ];
    const mapping = { Nome: 'name', Tempo: 'avg_time_h', Preco: 'fixed_price' };

    const payload = buildInsertData(validated, mapping, 'ws-1');

    expect(payload).toHaveLength(2);
    expect(payload[0]).toEqual({
      workspace_id: 'ws-1',
      name: 'Produto A',
      avg_time_h: 2.5,
      fixed_price: 10.9,
    });
    expect(payload[1]).toEqual({
      workspace_id: 'ws-1',
      name: 'Produto B',
      avg_time_h: null,
      fixed_price: null,
    });
  });
});
