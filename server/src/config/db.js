const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "healthy_bites",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// test connection
pool.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
  } else {
    console.log("✅ MySQL connected successfully");
  }
});

module.exports = pool;
