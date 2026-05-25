import axios, { AxiosInstance } from "axios";
import type { WarehouseProvider } from "../base.js";
import type { InventoryItem } from "../../types/inventory.js";
import type {
  Stone3PLTokenResponse,
  Stone3PLResponse,
  Stone3PLInventoryData,
  Stone3PLInventoryItem,
} from "./types.js";

export class Stone3PLProvider implements WarehouseProvider {
  readonly id = "stone3pl" as const;
  readonly country = "CN";
  readonly enabled: boolean;

  private client: AxiosInstance;
  private appId: string;
  private appSecret: string;
  private warehouseId: string;

  private accessToken: string | null = null;
  // Refresh 60 seconds before actual expiry to avoid using a stale token
  private tokenExpiresAt: number = 0;
  private static readonly TOKEN_REFRESH_BUFFER_MS = 60_000;

  constructor() {
    this.enabled = process.env.STONE3PL_ENABLED === "true";
    this.appId = process.env.STONE3PL_APP_ID ?? "";
    this.appSecret = process.env.STONE3PL_APP_SECRET ?? "";
    this.warehouseId = process.env.STONE3PL_WAREHOUSE_ID ?? "";

    this.client = axios.create({
      baseURL: process.env.STONE3PL_API_URL ?? "https://api.stone3pl.com",
      timeout: 10_000,
    });
  }

  async getInventory(sku?: string): Promise<InventoryItem[]> {
    const token = await this.getToken();
    const items: Stone3PLInventoryItem[] = [];
    const pageSize = 100;
    let page = 1;

    while (true) {
      const body: Record<string, unknown> = {
        warehouse_id: this.warehouseId,
        page,
        page_size: pageSize,
      };
      if (sku) body.sku = sku;

      const { data } = await this.client.post<
        Stone3PLResponse<Stone3PLInventoryData>
      >("/api/inventory/list", body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.error_code !== 0) {
        throw new Error(`Stone3PL API error: ${data.msg}`);
      }

      const list = data.data?.list ?? [];
      items.push(...list);

      if (list.length < pageSize) break;
      page++;
    }

    return items.map((item) => this.normalize(item));
  }

  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }
    return this.fetchToken();
  }

  private async fetchToken(): Promise<string> {
    const { data } = await this.client.post<Stone3PLTokenResponse>(
      "/api/oauth/token",
      { app_id: this.appId, app_secret: this.appSecret },
      { headers: { "Content-Type": "application/json" } }
    );

    if (data.error_code !== 0) {
      throw new Error(`Stone3PL auth error: ${data.msg}`);
    }

    const token = data.data.accessToken;
    this.accessToken = token;
    this.tokenExpiresAt =
      Date.now() +
      data.data.expiresIn * 1000 -
      Stone3PLProvider.TOKEN_REFRESH_BUFFER_MS;

    return token;
  }

  private normalize(item: Stone3PLInventoryItem): InventoryItem {
    return {
      sku: item.sku,
      name: item.product_name,
      warehouseId: this.id,
      warehouseCountry: this.country,
      available: item.available_qty,
      onHand: item.on_hand_qty,
      committed: item.locked_qty,
      updatedAt: item.updated_at,
    };
  }
}
