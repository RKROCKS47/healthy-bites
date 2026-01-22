const express = require("express");
const router = express.Router();
const db = require("../config/db");

function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY) return res.status(500).json({ message: "ADMIN_KEY not set" });
  if (key !== process.env.ADMIN_KEY) return res.status(401).json({ message: "Unauthorized" });
  next();
}

// GET all products
router.get("/products", requireAdmin, (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    res.json(rows);
  });
});

// ADD product
router.post("/products", requireAdmin, (req, res) => {
  const { name, price, category, tags, image, stock_qty } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    `INSERT INTO products (name, price, category, tags, image, stock_qty)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, Number(price), category, tags || null, image || null, Number(stock_qty || 0)],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json({ message: "Product added ✅" });
    }
  );
});

// UPDATE product
router.put("/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, price, category, tags, image, stock_qty, is_active } = req.body;

  db.query(
    `UPDATE products
     SET name=?, price=?, category=?, tags=?, image=?, stock_qty=?, is_active=?
     WHERE id=?`,
    [
      name,
      Number(price),
      category,
      tags || null,
      image || null,
      Number(stock_qty || 0),
      Number(is_active ?? 1),
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json({ message: "Product updated ✅" });
    }
  );
});

// SET STOCK quickly
router.patch("/products/:id/stock", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { stock_qty } = req.body;

  db.query(
    "UPDATE products SET stock_qty=? WHERE id=?",
    [Number(stock_qty || 0), id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json({ message: "Stock updated ✅" });
    }
  );
});

// TOGGLE active
router.patch("/products/:id/toggle", requireAdmin, (req, res) => {
  const { id } = req.params;
  db.query("UPDATE products SET is_active = IF(is_active=1,0,1) WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    res.json({ message: "Toggled ✅" });
  });
});

// DELETE product
router.delete("/products/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM products WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    res.json({ message: "Deleted ✅" });
  });
});

module.exports = router;
