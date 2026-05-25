export interface Stone3PLTokenResponse {
  error_code: number;
  msg: string;
  data: {
    accessToken: string;
    expiresIn: number; // seconds
  };
}

export interface Stone3PLInventoryItem {
  sku: string;
  product_name: string;
  available_qty: number;
  on_hand_qty: number;
  locked_qty: number;
  updated_at?: string;
}

export interface Stone3PLInventoryData {
  list: Stone3PLInventoryItem[];
  total: number;
}

export interface Stone3PLResponse<T> {
  error_code: number;
  msg: string;
  data: T;
}
