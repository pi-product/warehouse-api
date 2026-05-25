export type WarehouseId = "stone3pl" | "shipbob" | "shipmonk" | "shiptop";

export interface InventoryItem {
  sku: string;
  name: string;
  warehouseId: WarehouseId;
  warehouseCountry: string;
  available: number;
  onHand: number;
  committed: number;
  updatedAt?: string;
}

export interface InventoryResult {
  warehouseId: WarehouseId;
  items: InventoryItem[];
  fetchedAt: string;
}

export interface InventoryError {
  warehouseId: WarehouseId;
  error: string;
}

export interface AggregatedInventory {
  results: InventoryResult[];
  errors: InventoryError[];
  fetchedAt: string;
}
