const mysql = require("mysql2");

const isProd = process.env.NODE_ENV === "production";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "healthy_bites",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Aiven requires TLS; in production enable SSL.
  ssl: isProd ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
