import axios, { AxiosInstance } from "axios";
import type { WarehouseProvider } from "../base.js";
import type { InventoryItem } from "../../types/inventory.js";
import type { ShipBobInventoryItem } from "./types.js";

export class ShipBobProvider implements WarehouseProvider {
  readonly id = "shipbob" as const;
  readonly country = "US";
  readonly enabled: boolean;

  private client: AxiosInstance;

  constructor() {
    this.enabled = process.env.SHIPBOB_ENABLED === "true";

    this.client = axios.create({
      baseURL: process.env.SHIPBOB_API_URL ?? "https://api.shipbob.com/1.0",
      headers: {
        Authorization: `Bearer ${process.env.SHIPBOB_PAT ?? ""}`,
        "Content-Type": "application/json",
      },
      timeout: 10_000,
    });
  }

  async getInventory(sku?: string): Promise<InventoryItem[]> {
    const params: Record<string, string | number> = { Page: 1, Limit: 250 };
    if (sku) params.SKU = sku;

    const items: ShipBobInventoryItem[] = [];
    let page = 1;

    while (true) {
      params.Page = page;
      const { data } = await this.client.get<ShipBobInventoryItem[]>(
        "/inventory",
        { params }
      );

      if (!Array.isArray(data) || data.length === 0) break;
      items.push(...data);
      if (data.length < 250) break;
      page++;
    }

    return items.map((item) => this.normalize(item));
  }

  private normalize(item: ShipBobInventoryItem): InventoryItem {
    return {
      sku: item.sku ?? String(item.id),
      name: item.name,
      warehouseId: this.id,
      warehouseCountry: this.country,
      available: item.total_fulfillable_quantity,
      onHand: item.total_onhand_quantity,
      committed: item.total_committed_quantity,
      updatedAt: item.last_updated,
    };
  }
}
