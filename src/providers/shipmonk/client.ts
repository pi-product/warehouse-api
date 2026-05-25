import axios, { AxiosInstance } from "axios";
import type { WarehouseProvider } from "../base.js";
import type { InventoryItem } from "../../types/inventory.js";

interface ShipMonkProduct {
  sku: string;
  name: string;
  quantity_available: number;
  quantity_on_hand: number;
  quantity_allocated: number;
  updated_at?: string;
}

export class ShipMonkProvider implements WarehouseProvider {
  readonly id = "shipmonk" as const;
  readonly country = "US";
  readonly enabled: boolean;

  private client: AxiosInstance;

  constructor() {
    this.enabled = process.env.SHIPMONK_ENABLED === "true";

    this.client = axios.create({
      baseURL: process.env.SHIPMONK_API_URL ?? "https://api.shipmonk.com",
      auth: {
        username: process.env.SHIPMONK_LOGIN ?? "",
        password: process.env.SHIPMONK_TOKEN ?? "",
      },
      timeout: 10_000,
    });
  }

  async getInventory(sku?: string): Promise<InventoryItem[]> {
    const params: Record<string, string | number> = { limit: 250, page: 1 };
    if (sku) params.sku = sku;

    const { data } = await this.client.get<{ data: ShipMonkProduct[] }>(
      "/products",
      { params }
    );

    return (data.data ?? []).map((item) => ({
      sku: item.sku,
      name: item.name,
      warehouseId: this.id,
      warehouseCountry: this.country,
      available: item.quantity_available,
      onHand: item.quantity_on_hand,
      committed: item.quantity_allocated,
      updatedAt: item.updated_at,
    }));
  }
}
