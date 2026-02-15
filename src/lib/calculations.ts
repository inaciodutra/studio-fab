export interface MaterialForCalc {
  price_per_kg: number;
}

export interface ConfigForCalc {
  energy_per_h: number;
  labor_per_h: number;
  markup_material: number;
  print_price_per_h: number;
  base_fee: number;
  min_order_price: number;
  fortaleza_discount: number;
}

export interface CalculationInputs {
  qty: number;
  time_h: number;
  weight_g: number;
  material: MaterialForCalc;
  config: ConfigForCalc;
  fixed_price?: number | null;
  other_cost?: number;
  is_fortaleza?: boolean;
}

export interface CalculationResult {
  cost_filament: number;
  cost_energy: number;
  cost_labor: number;
  cost_total: number;
  price_variable: number;
  price_final: number;
  profit: number;
  margin_percent: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  freight: number;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  margin: number;
}

export function calculateOrderItem(inputs: CalculationInputs): CalculationResult {
  const {
    qty,
    time_h,
    weight_g,
    material,
    config,
    fixed_price,
    other_cost = 0,
    is_fortaleza = false,
  } = inputs;

  const cost_per_g = material.price_per_kg / 1000;
  const cost_filament = weight_g * qty * cost_per_g;
  const cost_energy = time_h * config.energy_per_h;
  const cost_labor = time_h * config.labor_per_h;
  const cost_total = cost_filament + cost_energy + cost_labor + other_cost;

  const option_a = cost_filament * config.markup_material;
  const option_b = time_h * config.print_price_per_h;
  const price_variable = Math.max(option_a, option_b) + config.base_fee;

  let price_final = fixed_price ?? price_variable;

  if (price_final < config.min_order_price) {
    price_final = config.min_order_price;
  }

  if (is_fortaleza) {
    price_final -= config.fortaleza_discount;
  }

  const profit = price_final - cost_total;
  const margin_percent = price_final > 0 ? (profit / price_final) * 100 : 0;

  return {
    cost_filament,
    cost_energy,
    cost_labor,
    cost_total,
    price_variable,
    price_final,
    profit,
    margin_percent,
  };
}

export function calculateOrderTotals(
  items: CalculationResult[],
  discount: number,
  freight: number
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price_final, 0);
  const total_cost = items.reduce((sum, item) => sum + item.cost_total, 0);
  const total_revenue = subtotal - discount + freight;
  const total_profit = total_revenue - total_cost;
  const margin = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;

  return { subtotal, discount, freight, total_revenue, total_cost, total_profit, margin };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
