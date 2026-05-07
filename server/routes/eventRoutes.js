import express from "express";
import { store } from "../data/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ events: store.events });
});

export default router;
