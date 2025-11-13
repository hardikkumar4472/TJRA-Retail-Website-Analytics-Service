import Redis from "ioredis";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

console.log("🌀 Processor service started...");

async function processEvent() {
  try {
    const result = await redis.lpop("events_queue");
    if (!result) {
      return; 
    }

    const event = JSON.parse(result);
    const { site_id, event_type, path, user_id, timestamp } = event;

    await pool.query(
      `INSERT INTO events (site_id, event_type, path, user_id, timestamp)
       VALUES ($1, $2, $3, $4, $5)`,
      [site_id, event_type, path, user_id, timestamp]
    );

    console.log("Event inserted:", event);
  } catch (err) {
    console.error(" Error processing event:", err);
  }
}

setInterval(processEvent, 1000);
