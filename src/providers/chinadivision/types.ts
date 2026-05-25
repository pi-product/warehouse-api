export interface ChinaDivisionTokenResponse {
  error_code: number;
  msg: string;
  data: {
    accessToken: string;
    expiresIn: number; // seconds
  };
}

export interface ChinaDivisionInventoryItem {
  sku: string;
  product_name: string;
  available_qty: number;
  on_hand_qty: number;
  locked_qty: number;
  updated_at?: string;
}

export interface ChinaDivisionInventoryData {
  list: ChinaDivisionInventoryItem[];
  total: number;
}

export interface ChinaDivisionResponse<T> {
  error_code: number;
  msg: string;
  data: T;
}
