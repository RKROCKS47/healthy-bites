const express = require("express");
const router = express.Router();
const db = require("../config/db");

// PUBLIC: menu products
router.get("/", (req, res) => {
  db.query(
    `SELECT * FROM products 
     WHERE is_active=1 AND stock_qty > 0 
     ORDER BY id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
