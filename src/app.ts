import express from "express";
import inventoryRouter from "./routes/inventory.js";
import { providers } from "./providers/index.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    warehouses: providers.map((p) => ({
      id: p.id,
      country: p.country,
      enabled: p.enabled,
    })),
  });
});

app.use("/inventory", inventoryRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
