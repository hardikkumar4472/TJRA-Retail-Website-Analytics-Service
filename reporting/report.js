// reporting/report.js
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
  // simple YYYY-MM-DD validation
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

app.get("/stats", async (req, res) => {
  const site_id = req.query.site_id;
  const date = req.query.date; // optional: YYYY-MM-DD

  if (!site_id) return res.status(400).json({ error: "site_id query parameter required" });
  if (!validateDateString(date)) return res.status(400).json({ error: "date must be YYYY-MM-DD" });

  try {
    // Build WHERE clause params
    const whereClauses = ["site_id = $1"];
    const params = [site_id];
    let paramIndex = 2;

    if (date) {
      // match timestamp date
      whereClauses.push(`DATE(timestamp) = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // total_views (count of page_view events; if you want to count all events, remove event_type filter)
    const totalViewsSql = `
      SELECT COUNT(*)::int AS total_views
      FROM events
      ${whereSql} AND event_type = 'page_view'
    `;
    // unique users
    const uniqueUsersSql = `
      SELECT COUNT(DISTINCT user_id)::int AS unique_users
      FROM events
      ${whereSql} AND user_id IS NOT NULL
    `;
    // top paths (top 10)
    const topPathsSql = `
      SELECT path, COUNT(*)::int AS views
      FROM events
      ${whereSql}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;

    // Query with same params for each, but we must pass params in same order
    const totalViewsRes = await pool.query(totalViewsSql, params);
    const uniqueUsersRes = await pool.query(uniqueUsersSql, params);
    const topPathsRes = await pool.query(topPathsSql, params);

    const response = {
      site_id,
      date: date || null,
      total_views: totalViewsRes.rows[0] ? totalViewsRes.rows[0].total_views : 0,
      unique_users: uniqueUsersRes.rows[0] ? uniqueUsersRes.rows[0].unique_users : 0,
      top_paths: (topPathsRes.rows || []).map(r => ({ path: r.path || "/", views: r.views }))
    };

    return res.json(response);
  } catch (err) {
    console.error("Reporting error:", err);
    return res.status(500).json({ error: "internal_server_error" });
  }
});

app.listen(PORT, () => {
  console.log(`📊 Reporting API listening on port ${PORT}`);
});
