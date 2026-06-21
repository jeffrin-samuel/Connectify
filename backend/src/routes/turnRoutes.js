import express from "express";
import { TurnixIO } from "turnix-js";

const router = express.Router();

const turnix = new TurnixIO({ bearerToken: process.env.TURNIX_API_TOKEN });

router.get("/credentials", async (req, res) => {
  try {
    const iceServers = await turnix.requestCredentials({ ttl: 86400 }); // valid 24 hours
    res.json(iceServers);
  } catch (err) {
    console.error("Failed to generate TURN credentials:", err);
    res.status(500).json({ error: "Could not generate TURN credentials" });
  }
});

export default router;