const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ Order routes loaded");

// ================= TRACK ORDER =================
router.get("/track/:orderCode", (req, res) => {
  const { orderCode } = req.params;

  db.query(
    `SELECT order_code, customer_name, order_status, payment_method,
            payment_status, updated_at
     FROM orders
     WHERE order_code = ?
     LIMIT 1`,
    [orderCode],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "DB error" });
      }
      if (!rows.length) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(rows[0]);
    }
  );
});

// ================= CREATE ORDER =================
function generateOrderCode() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `HB${ymd}-${Math.floor(100 + Math.random() * 900)}`;
}

router.post("/", (req, res) => {
  const { customer, items, totals, paymentMethod, paymentStatus } = req.body;

  if (!customer || !items?.length) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const orderCode = generateOrderCode();

  db.query(
    `INSERT INTO orders
     (order_code, customer_name, phone, email, address_line, area, city, pincode,
      instructions, payment_method, payment_status, order_status,
      subtotal, delivery_fee, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', ?, ?, ?)`,
    [
      orderCode,
      customer.fullName,
      customer.phone,
      customer.email || null,
      customer.addressLine,
      customer.area,
      customer.city,
      customer.pincode,
      customer.instructions || null,
      paymentMethod,
      paymentStatus,
      totals.subtotal,
      totals.deliveryFee,
      totals.total,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Order save failed" });
      }

      const orderId = result.insertId;

      const values = items.map((i) => [
        orderId,
        i.name,
        i.price,
        i.qty,
        i.image,
      ]);

      db.query(
        `INSERT INTO order_items (order_id, name, price, qty, image)
         VALUES ?`,
        [values],
        (err2) => {
          if (err2) {
            return res.status(500).json({ message: "Order items failed" });
          }

          // 🔻 reduce stock
          items.forEach((i) => {
            db.query(
              "UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?",
              [i.qty, i.id]
            );
          });

          res.json({
            message: "Order placed successfully",
            orderCode,
          });
        }
      );
    }
  );
});

module.exports = router;
