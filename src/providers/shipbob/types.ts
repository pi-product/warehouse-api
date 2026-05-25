export interface ShipBobInventoryItem {
  id: number;
  name: string;
  sku?: string;
  total_fulfillable_quantity: number;
  total_onhand_quantity: number;
  total_committed_quantity: number;
  last_updated?: string;
}

export interface ShipBobInventoryResponse {
  items: ShipBobInventoryItem[];
}
