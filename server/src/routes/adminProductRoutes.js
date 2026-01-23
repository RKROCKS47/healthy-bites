const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../config/db");
const { requireAdmin } = require("../middlewares/adminMiddleware");

// ✅ Save uploads inside: server/uploads/products
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "products");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ Multer config (bigger + safe)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".png";
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `product-${unique}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // ✅ 20MB (so no "File too large")
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only png/jpg/jpeg/webp images allowed"), ok);
  },
});

// ✅ wrap multer to send clean JSON errors
const uploadSingle = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Upload failed" });
    next();
  });
};

// ✅ attach full image URL
function withImageUrl(req, row) {
  const r = { ...row };
  if (r.image && typeof r.image === "string" && r.image.startsWith("/uploads/")) {
    r.image_url = `${req.protocol}://${req.get("host")}${r.image}`;
  } else {
    r.image_url = r.image || null;
  }
  r.sold_out = Number(r.stock_qty || 0) <= 0;
  return r;
}

/**
 * ✅ ADMIN PRODUCTS CRUD
 * Mounted at: /api/admin  (from server.js)
 * So routes become:
 * GET    /api/admin/products
 * POST   /api/admin/products
 * PUT    /api/admin/products/:id
 * PATCH  /api/admin/products/:id/stock
 * PATCH  /api/admin/products/:id/toggle
 * DELETE /api/admin/products/:id
 */

// GET all products (admin)
router.get("/products", requireAdmin, (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    res.json((rows || []).map((r) => withImageUrl(req, r)));
  });
});

// ADD product (multipart)
router.post("/products", requireAdmin, uploadSingle, (req, res) => {
  const { name, price, category, tags, stock_qty, is_active } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Missing fields: name, price, category" });
  }

  // ✅ stored relative path
  const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;

  db.query(
    `INSERT INTO products (name, price, category, tags, image, stock_qty, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      Number(price),
      category,
      tags || null,
      imagePath,
      Number(stock_qty || 0),
      Number(is_active ?? 1),
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json({ message: "Product added ✅", id: result.insertId, image: imagePath });
    }
  );
});

// UPDATE product (multipart)
router.put("/products/:id", requireAdmin, uploadSingle, (req, res) => {
  const { id } = req.params;
  const { name, price, category, tags, stock_qty, is_active } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Missing fields: name, price, category" });
  }

  const newImagePath = req.file ? `/uploads/products/${req.file.filename}` : null;

  // delete old image if replaced (best-effort)
  if (newImagePath) {
    db.query("SELECT image FROM products WHERE id=?", [id], (err, rows) => {
      const oldImage = rows?.[0]?.image;
      if (oldImage && typeof oldImage === "string" && oldImage.startsWith("/uploads/products/")) {
        const full = path.join(UPLOAD_DIR, path.basename(oldImage));
        fs.unlink(full, () => {});
      }
    });
  }

  db.query(
    `UPDATE products
     SET name=?, price=?, category=?, tags=?,
         image=COALESCE(?, image),
         stock_qty=?, is_active=?
     WHERE id=?`,
    [
      name,
      Number(price),
      category,
      tags || null,
      newImagePath,
      Number(stock_qty || 0),
      Number(is_active ?? 1),
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      res.json({ message: "Product updated ✅", image: newImagePath });
    }
  );
});

// PATCH stock
router.patch("/products/:id/stock", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { stock_qty } = req.body;

  db.query("UPDATE products SET stock_qty=? WHERE id=?", [Number(stock_qty || 0), id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.message });
    res.json({ message: "Stock updated ✅" });
  });
});

// PATCH toggle active
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

  db.query("SELECT image FROM products WHERE id=?", [id], (err, rows) => {
    const image = rows?.[0]?.image;

    db.query("DELETE FROM products WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json({ message: "DB error", error: err2.message });

      if (image && typeof image === "string" && image.startsWith("/uploads/products/")) {
        const full = path.join(UPLOAD_DIR, path.basename(image));
        fs.unlink(full, () => {});
      }

      res.json({ message: "Deleted ✅" });
    });
  });
});

module.exports = router;
