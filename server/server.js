require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const orderRoutes = require("./src/routes/orderRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const adminOrderRoutes = require("./src/routes/adminOrderRoutes");
const adminProductRoutes = require("./src/routes/adminProductRoutes");
const productRoutes = require("./src/routes/productRoutes");
const app = express();

// middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});
const db = require("./src/config/db");

app.get("/api/db-ping", (req, res) => {
  db.getConnection((err, conn) => {
    if (err) return res.status(500).json({ ok: false, error: err.message, code: err.code });

    conn.ping((pingErr) => {
      conn.release();
      if (pingErr) return res.status(500).json({ ok: false, error: pingErr.message, code: pingErr.code });
      res.json({ ok: true });
    });
  });
});



// ✅ serve uploaded images from: server/uploads
const UPLOAD_DIR = path.join(__dirname, "uploads");
const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_DIR, "products");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(PRODUCT_UPLOAD_DIR)) fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

app.use("/uploads", express.static(UPLOAD_DIR));

// test routes
app.get("/", (req, res) => res.send("Healthy Bites API running ✅"));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// routes
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);

// admin routes
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminProductRoutes);

// socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 socket connected:", socket.id);
  socket.on("joinOrder", (orderCode) => socket.join(orderCode));
  socket.on("disconnect", () => console.log("🔴 socket disconnected:", socket.id));
});

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
