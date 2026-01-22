const express = require("express");
const router = express.Router();
const db = require("../config/db"); // ✅ make sure this exports mysql connection with .query

// Basic admin auth using a key (for now)
function requireAdmin(req, res, next) {
    const key = req.headers["x-admin-key"];
    if (!process.env.ADMIN_KEY) {
        return res.status(500).json({ message: "ADMIN_KEY not set in server env" });
    }
    if (key !== process.env.ADMIN_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}

// ✅ GET all orders (latest first)
router.get("/orders", requireAdmin, (req, res) => {
    db.query(
        `SELECT 
        id,
        order_code,
        customer_name,
        phone,
        email,
        address_line,
        area,
        city,
        pincode,
        payment_method,
        payment_status,
        order_status,
        subtotal,
        delivery_fee,
        total,
        created_at
     FROM orders
     ORDER BY id DESC
     LIMIT 200`,
        (err, rows) => {
            if (err) {
                console.log("ADMIN DB ERROR:", err);
                return res.status(500).json({
                    message: "DB error",
                    error: err.message,
                });
            }
            res.json(rows);
        }
    );
});


// ✅ GET one order + items (optional, if you have order_items table)
router.get("/orders/:orderCode", requireAdmin, (req, res) => {
    const { orderCode } = req.params;

    db.query(
        `SELECT 
   id, order_code, customer_name, phone, email,
   address_line, area, city, pincode, instructions,
   payment_method, payment_status, order_status,
   subtotal, delivery_fee, total, created_at, updated_at
 FROM orders
 WHERE order_code = ?
 LIMIT 1`
        ,
        [orderCode],
        (err, rows) => {
            if (err) return res.status(500).json({
                message: "DB error",
                error: err.message,
            });

            if (!rows || rows.length === 0)
                return res.status(404).json({ message: "Order not found" });
            res.json(rows[0]);
        }
    );
});
// ✅ GET items for an order (from order_items)
router.get("/orders/:orderCode/items", requireAdmin, (req, res) => {
    const { orderCode } = req.params;

    // find order id first using order_code
    db.query(
        "SELECT id, order_code FROM orders WHERE order_code = ? LIMIT 1",
        [orderCode],
        (err, orderRows) => {
            if (err) {
                console.log("ADMIN ITEMS DB ERROR (order):", err);
                return res.status(500).json({ message: "DB error", error: err.message });
            }

            if (!orderRows || orderRows.length === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            const orderId = orderRows[0].id;

            db.query(
                `SELECT id, name, price, qty, image
                    FROM order_items
                    WHERE order_id = ?
                    ORDER BY id ASC`
                ,
                [orderId],
                (err2, itemRows) => {
                    if (err2) {
                        console.log("ADMIN ITEMS DB ERROR (items):", err2);
                        return res.status(500).json({ message: "DB error", error: err2.message });
                    }

                    return res.json({
                        orderCode,
                        orderId,
                        items: itemRows,
                    });
                }
            );
        }
    );
});


// ✅ PATCH update status
router.patch("/orders/:orderCode/status", requireAdmin, (req, res) => {
    const { orderCode } = req.params;
    const { status } = req.body;

    const allowed = ["RECEIVED", "PREPARING", "PICKED", "DISPATCHED", "ARRIVED"];
    if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    db.query(
        "UPDATE orders SET order_status = ? WHERE order_code = ?",
        [status, orderCode],
        (err, result) => {
            if (err) {
                console.log("ADMIN PATCH DB ERROR:", err);
                return res.status(500).json({ message: "DB error", error: err.message });
            }

            if (!result || result.affectedRows === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            // ✅ realtime emit (safe)
            const io = req.app.get("io");
            if (io) {
                io.to(orderCode).emit("order:status_updated", {
                    orderCode,
                    currentStatus: status,
                    lastUpdated: new Date().toISOString(),
                });
            }

            // ✅ IMPORTANT: return to stop further execution
            return res.json({ message: "Status updated ✅", orderCode, status });
        }
    );
});


module.exports = router;
