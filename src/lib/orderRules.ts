export function isStatusChangeAllowed(currentStatus: string, newStatus: string): boolean {
  if (newStatus === currentStatus) return false;
  if (currentStatus === 'Entregue' && newStatus !== 'Entregue') return false;
  return true;
}

export function shouldApplyStockMovement(currentStatus: string, newStatus: string): boolean {
  return newStatus === 'Entregue' && currentStatus !== 'Entregue';
}

export interface DeliveredItemLike {
  material_id?: string | null;
  color?: string | null;
  weight_g?: number | null;
  qty?: number | null;
  productCategory?: string | null;
}

export interface StockMovementInput {
  material_id: string;
  color: string;
  qty_delta_g: number;
}

export function buildDeliveredStockMovements(items: DeliveredItemLike[]): StockMovementInput[] {
  return items
    .filter(item => {
      const category = String(item.productCategory ?? '');
      return (
        category.includes('3D') &&
        !!item.material_id &&
        !!item.color &&
        typeof item.weight_g === 'number' &&
        typeof item.qty === 'number'
      );
    })
    .map(item => ({
      material_id: item.material_id as string,
      color: item.color as string,
      qty_delta_g: -((item.weight_g as number) * (item.qty as number)),
    }));
}
