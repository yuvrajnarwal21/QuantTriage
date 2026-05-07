import express from "express";
import { store } from "../data/store.js";
import { checkInvariants } from "../engine/invariantEngine.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    state: store.state,
    brokenInvariants: checkInvariants(store.state),
    activeIncidentCount: store.incidents.filter((incident) => incident.status === "ACTIVE").length
  });
});

export default router;
