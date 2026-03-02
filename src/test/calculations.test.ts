import { describe, it, expect } from 'vitest';
import { calculateOrderItem, calculateOrderTotals } from '@/lib/calculations';

describe('calculateOrderItem', () => {
  const config = {
    energy_per_h: 1.5,
    labor_per_h: 10,
    markup_material: 3,
    print_price_per_h: 25,
    base_fee: 5,
    min_order_price: 20,
    fortaleza_discount: 5,
  };
  const material = { price_per_kg: 120 };

  it('calculates correctly for Vaso Decorativo (qty=2, 2.5h, 150g)', () => {
    const result = calculateOrderItem({
      qty: 2, time_h: 2.5, weight_g: 150,
      material, config,
    });

    expect(result.cost_filament).toBeCloseTo(36, 2);
    expect(result.cost_energy).toBeCloseTo(3.75, 2);
    expect(result.cost_labor).toBeCloseTo(25, 2);
    expect(result.cost_total).toBeCloseTo(64.75, 2);
    expect(result.price_variable).toBeCloseTo(113, 2);
    expect(result.price_final).toBeCloseTo(113, 2);
    expect(result.profit).toBeCloseTo(48.25, 2);
    expect(result.margin_percent).toBeCloseTo(42.7, 0);
  });

  it('applies Fortaleza discount', () => {
    const result = calculateOrderItem({
      qty: 2, time_h: 2.5, weight_g: 150,
      material, config, is_fortaleza: true,
    });
    expect(result.price_final).toBeCloseTo(108, 2);
    expect(result.profit).toBeCloseTo(43.25, 2);
  });

  it('uses fixed_price when provided', () => {
    const result = calculateOrderItem({
      qty: 1, time_h: 1, weight_g: 50,
      material, config, fixed_price: 80,
    });
    expect(result.price_final).toBe(80);
  });

  it('enforces min_order_price', () => {
    const result = calculateOrderItem({
      qty: 1, time_h: 0.01, weight_g: 1,
      material, config,
    });
    expect(result.price_final).toBe(20);
  });
});

describe('calculateOrderTotals', () => {
  it('computes totals with discount and freight', () => {
    const items = [
      { cost_filament: 36, cost_energy: 3.75, cost_labor: 25, cost_total: 64.75, price_variable: 113, price_final: 113, profit: 48.25, margin_percent: 42.7 },
    ];
    const totals = calculateOrderTotals(items, 10, 15);
    expect(totals.subtotal).toBe(113);
    expect(totals.total_revenue).toBe(118); // 113 - 10 + 15
    expect(totals.total_cost).toBe(64.75);
    expect(totals.total_profit).toBeCloseTo(53.25, 2);
  });
});
