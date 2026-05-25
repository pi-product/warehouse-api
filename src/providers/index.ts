import { ShipBobProvider } from "./shipbob/client.js";
import { Stone3PLProvider } from "./stone3pl/client.js";
import { ShipMonkProvider } from "./shipmonk/client.js";
import { ShipTopProvider } from "./shiptop/client.js";
import { ChinaDivisionProvider } from "./chinadivision/client.js";
import type { WarehouseProvider } from "./base.js";
import type { WarehouseId } from "../types/inventory.js";

const all: WarehouseProvider[] = [
  new Stone3PLProvider(),
  new ShipBobProvider(),
  new ShipMonkProvider(),
  new ShipTopProvider(),
  new ChinaDivisionProvider(),
];

export function getProviders(ids?: WarehouseId[]): WarehouseProvider[] {
  return all.filter(
    (p) => p.enabled && (!ids || ids.includes(p.id))
  );
}

export function getProvider(id: WarehouseId): WarehouseProvider | undefined {
  return all.find((p) => p.id === id);
}

export { all as providers };
