export interface Stone3PLResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface Stone3PLInventoryItem {
  sku: string;
  goods_name: string;
  warehouse_id: string;
  available_qty: number;
  on_hand_qty: number;
  lock_qty: number;
  update_time?: string;
}

export interface Stone3PLInventoryData {
  list: Stone3PLInventoryItem[];
  total: number;
  page: number;
  page_size: number;
}
