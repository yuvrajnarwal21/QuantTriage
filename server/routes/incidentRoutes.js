import express from "express";
import { store, addEvent } from "../data/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ incidents: store.incidents });
});

router.patch("/:id/resolve", (req, res) => {
  const incident = store.incidents.find((item) => item.id === req.params.id);

  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  incident.status = "RESOLVED";
  incident.resolvedAt = new Date().toISOString();
  addEvent("SYSTEM_RESOLVED", "LOW", `${incident.title} was manually marked as resolved.`);

  return res.json({ incident });
});

export default router;
