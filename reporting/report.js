import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || process.env.PG_USER || "postgres",
  password: process.env.DB_PASSWORD || process.env.PG_PASSWORD || "",
  database: process.env.DB_NAME || process.env.PG_DATABASE || "filesure",
});

const app = express();
const PORT = process.env.REPORT_PORT || 4000;

function validateDateString(d) {
  if (!d) return true;

  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

app.get("/stats", async (req, res) => {
  const site_id = req.query.site_id;
  const date = req.query.date; 

  if (!site_id) return res.status(400).json({ error: "site_id query parameter required" });
  if (!validateDateString(date)) return res.status(400).json({ error: "date must be YYYY-MM-DD" });

  try {

    const whereClauses = ["site_id = $1"];
    const params = [site_id];
