import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import type { WarehouseProvider } from "../base.js";
import type { InventoryItem } from "../../types/inventory.js";
import type {
  Stone3PLResponse,
  Stone3PLInventoryData,
  Stone3PLInventoryItem,
} from "./types.js";

export class Stone3PLProvider implements WarehouseProvider {
  readonly id = "stone3pl" as const;
  readonly country = "CN";
  readonly enabled: boolean;

  private client: AxiosInstance;
  private appKey: string;
  private appSecret: string;
  private warehouseId: string;

  constructor() {
    this.enabled = process.env.STONE3PL_ENABLED === "true";
    this.appKey = process.env.STONE3PL_APP_KEY ?? "";
    this.appSecret = process.env.STONE3PL_APP_SECRET ?? "";
    this.warehouseId = process.env.STONE3PL_WAREHOUSE_ID ?? "";

    this.client = axios.create({
      baseURL: process.env.STONE3PL_API_URL ?? "https://api.stone3pl.com",
      timeout: 10_000,
    });
  }

  async getInventory(sku?: string): Promise<InventoryItem[]> {
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
      >("/open/inventory/list", body, {
        headers: this.buildHeaders(body),
      });

      if (data.code !== "0" && data.code !== "200") {
        throw new Error(`Stone3PL API error: ${data.message}`);
      }

      const list = data.data?.list ?? [];
      items.push(...list);

      if (list.length < pageSize) break;
      page++;
    }

    return items.map((item) => this.normalize(item));
  }

  // Stone3PL uses HMAC-SHA256 request signing
  private buildHeaders(body: Record<string, unknown>): Record<string, string> {
    const timestamp = String(Date.now());
    const nonce = crypto.randomBytes(8).toString("hex");
    const bodyStr = JSON.stringify(body);
    const signStr = `${this.appKey}${timestamp}${nonce}${bodyStr}${this.appSecret}`;
    const sign = crypto
      .createHmac("sha256", this.appSecret)
      .update(signStr)
      .digest("hex")
      .toUpperCase();

    return {
      "Content-Type": "application/json",
      "X-App-Key": this.appKey,
      "X-Timestamp": timestamp,
      "X-Nonce": nonce,
      "X-Sign": sign,
    };
  }

  private normalize(item: Stone3PLInventoryItem): InventoryItem {
    return {
      sku: item.sku,
      name: item.goods_name,
      warehouseId: this.id,
      warehouseCountry: this.country,
      available: item.available_qty,
      onHand: item.on_hand_qty,
      committed: item.lock_qty,
      updatedAt: item.update_time,
    };
  }
}
