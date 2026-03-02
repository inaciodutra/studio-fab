import { describe, expect, it } from 'vitest';
import { buildDeliveredStockMovements, isStatusChangeAllowed, shouldApplyStockMovement } from '@/lib/orderRules';

describe('order rules', () => {
  it('blocks same status transition', () => {
    expect(isStatusChangeAllowed('Aprovado', 'Aprovado')).toBe(false);
  });

  it('blocks reverting from delivered', () => {
    expect(isStatusChangeAllowed('Entregue', 'Pronto')).toBe(false);
  });

  it('allows forward transitions', () => {
    expect(isStatusChangeAllowed('Pronto', 'Entregue')).toBe(true);
    expect(isStatusChangeAllowed('Orcado', 'Aprovado')).toBe(true);
  });

  it('applies stock movement only on first transition to delivered', () => {
    expect(shouldApplyStockMovement('Pronto', 'Entregue')).toBe(true);
    expect(shouldApplyStockMovement('Entregue', 'Entregue')).toBe(false);
    expect(shouldApplyStockMovement('Aprovado', 'Produzindo')).toBe(false);
  });

  it('builds stock deltas only for 3D items with complete data', () => {
    const result = buildDeliveredStockMovements([
      { productCategory: 'Impressao 3D', material_id: 'm1', color: 'Azul', weight_g: 12.5, qty: 2 },
      { productCategory: 'Servico', material_id: 'm2', color: 'Vermelho', weight_g: 10, qty: 1 },
      { productCategory: 'Peca 3D', material_id: null, color: 'Preto', weight_g: 10, qty: 1 },
    ]);

    expect(result).toEqual([{ material_id: 'm1', color: 'Azul', qty_delta_g: -25 }]);
  });
});
