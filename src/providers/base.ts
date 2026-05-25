import type { InventoryItem, WarehouseId } from "../types/inventory.js";

export interface WarehouseProvider {
  readonly id: WarehouseId;
  readonly country: string;
  readonly enabled: boolean;
  getInventory(sku?: string): Promise<InventoryItem[]>;
}
