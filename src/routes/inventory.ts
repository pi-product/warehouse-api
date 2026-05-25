import { Router, Request, Response } from "express";
import { getProviders, providers } from "../providers/index.js";
import type { WarehouseId, AggregatedInventory, InventoryError, InventoryResult } from "../types/inventory.js";

const router = Router();

// GET /inventory?warehouse=shipbob,stone3pl&sku=ABC123
router.get("/", async (req: Request, res: Response) => {
  const warehouseParam = req.query.warehouse as string | undefined;
  const sku = req.query.sku as string | undefined;

  const warehouseIds = warehouseParam
    ? (warehouseParam.split(",").map((w) => w.trim()) as WarehouseId[])
    : undefined;

  const activeProviders = getProviders(warehouseIds);

  if (activeProviders.length === 0) {
    res.status(400).json({ error: "No enabled warehouses match the request." });
    return;
  }

  const settled = await Promise.allSettled(
    activeProviders.map((p) => p.getInventory(sku))
  );

  const results: InventoryResult[] = [];
  const errors: InventoryError[] = [];
  const fetchedAt = new Date().toISOString();

  settled.forEach((outcome, i) => {
    const provider = activeProviders[i];
    if (outcome.status === "fulfilled") {
      results.push({ warehouseId: provider.id, items: outcome.value, fetchedAt });
    } else {
      errors.push({
        warehouseId: provider.id,
        error: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
      });
    }
  });

  const response: AggregatedInventory = { results, errors, fetchedAt };
  res.json(response);
});

// GET /inventory/:sku
router.get("/:sku", async (req: Request, res: Response) => {
  const { sku } = req.params;
  const warehouseParam = req.query.warehouse as string | undefined;
  const warehouseIds = warehouseParam
    ? (warehouseParam.split(",").map((w) => w.trim()) as WarehouseId[])
    : undefined;

  const activeProviders = getProviders(warehouseIds);

  if (activeProviders.length === 0) {
    res.status(400).json({ error: "No enabled warehouses match the request." });
    return;
  }

  const settled = await Promise.allSettled(
    activeProviders.map((p) => p.getInventory(sku))
  );

  const results: InventoryResult[] = [];
  const errors: InventoryError[] = [];
  const fetchedAt = new Date().toISOString();

  settled.forEach((outcome, i) => {
    const provider = activeProviders[i];
    if (outcome.status === "fulfilled") {
      results.push({ warehouseId: provider.id, items: outcome.value, fetchedAt });
    } else {
      errors.push({
        warehouseId: provider.id,
        error: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
      });
    }
  });

  res.json({ sku, results, errors, fetchedAt });
});

export default router;
