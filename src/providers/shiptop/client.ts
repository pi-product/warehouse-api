import axios, { AxiosInstance } from "axios";
import type { WarehouseProvider } from "../base.js";
import type { InventoryItem } from "../../types/inventory.js";

interface ShipTopInventoryItem {
  sku: string;
  product_name: string;
  available_quantity: number;
  physical_quantity: number;
  reserved_quantity: number;
  last_updated?: string;
}

export class ShipTopProvider implements WarehouseProvider {
  readonly id = "shiptop" as const;
  readonly country = "CA";
  readonly enabled: boolean;

  private client: AxiosInstance;

  constructor() {
    this.enabled = process.env.SHIPTOP_ENABLED === "true";

    this.client = axios.create({
      baseURL: process.env.SHIPTOP_API_URL ?? "https://api.shiptop.com",
      headers: {
        Authorization: `Bearer ${process.env.SHIPTOP_API_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    });
  }

  async getInventory(sku?: string): Promise<InventoryItem[]> {
    const params: Record<string, string | number> = { page: 1, per_page: 250 };
    if (sku) params.sku = sku;

    const { data } = await this.client.get<ShipTopInventoryItem[]>(
      "/v1/inventory",
      { params }
    );

    return (data ?? []).map((item) => ({
      sku: item.sku,
      name: item.product_name,
      warehouseId: this.id,
      warehouseCountry: this.country,
      available: item.available_quantity,
      onHand: item.physical_quantity,
      committed: item.reserved_quantity,
      updatedAt: item.last_updated,
    }));
  }
}
