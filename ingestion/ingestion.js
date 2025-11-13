// ingestion/ingestion.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "100kb" }));

// Redis setup
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
});

const QUEUE_KEY = process.env.QUEUE_KEY || "events_queue";

// ✅ Validate incoming event data
function validateEvent(event) {
  if (!event.site_id) return "site_id is required";
  if (!event.event_type) return "event_type is required";
  if (!event.path) return "path is required";
  if (!event.timestamp || isNaN(Date.parse(event.timestamp)))
    return "timestamp must be a valid ISO string";
  return null;
}

// ✅ POST /event
app.post("/event", async (req, res) => {
  const event = req.body;
  const error = validateEvent(event);

  if (error) return res.status(400).json({ error });

  try {
    // Push event JSON to Redis list (fast, async)
    await redis.lpush(QUEUE_KEY, JSON.stringify(event));

    // Respond immediately (no DB)
    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Redis push failed:", err.message);
    return res.status(503).json({ error: "queue unavailable" });
  }
});

const PORT = process.env.INGEST_PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Ingestion API running on port ${PORT}`));
