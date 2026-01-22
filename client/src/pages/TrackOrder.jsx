import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/common/Navbar";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Track order (fetch once)
  const trackOrder = async () => {
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/track/${orderId.trim()}`
      );

      const text = await res.text();        // ✅ read raw first
      const data = text ? JSON.parse(text) : {}; // ✅ parse safely

      if (!res.ok) {
        setError(data.message || "Order not found");
        setOrder(null);
      } else {
        setOrder({
          orderCode: data.order_code,
          currentStatus: data.order_status,
          customerName: data.customer_name,
          lastUpdated: data.updated_at,
        });
      }
    } catch (e) {
      setError("Server not reachable");
    }
    finally {
      setLoading(false);
    }
  };

  // 🔴 REALTIME SOCKET LISTENER (FIXED)
  useEffect(() => {
    if (!order?.orderCode) return;

    const socket = io("http://localhost:5000");
    socket.emit("joinOrder", order.orderCode);

    socket.on("order:status_updated", (payload) => {
      if (payload.orderCode === order.orderCode) {
        setOrder((prev) => ({
          ...prev,
          currentStatus: payload.currentStatus,
          lastUpdated: payload.lastUpdated,
        }));
      }
    });

    return () => socket.disconnect();
  }, [order?.orderCode]);

  return (
    <>
      <Navbar />
      <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
        <h2>Track Your Order</h2>
        <p style={{ color: "#555" }}>
          Enter your Order ID to see live status.
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. HB123)"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={trackOrder}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: "#2ECC71",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Track
          </button>
        </div>

        {loading && <p style={{ marginTop: 12 }}>Loading...</p>}
        {error && <p style={{ marginTop: 12, color: "#d11" }}>{error}</p>}

        {order && (
          <div
            style={{
              marginTop: 20,
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 16,
              background: "#fff",
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontWeight: 900 }}>
              Order: {order.orderCode}
            </div>
            <div style={{ marginTop: 6 }}>
              <b>Status:</b>{" "}
              <span style={{ color: "#2ECC71", fontWeight: 900 }}>
                {order.currentStatus}
              </span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#777" }}>
              Last updated:{" "}
              {order.lastUpdated
                ? new Date(order.lastUpdated).toLocaleString()
                : "Just now"}
            </div>

            {/* Status flow */}
            <div style={{ marginTop: 14 }}>
              {["RECEIVED", "PREPARING", "PICKED", "DISPATCHED", "ARRIVED"].map(
                (s) => (
                  <div
                    key={s}
                    style={{
                      padding: "8px 0",
                      fontWeight: 700,
                      color:
                        order.currentStatus === s ||
                          ["RECEIVED", "PREPARING", "PICKED", "DISPATCHED", "ARRIVED"].indexOf(s) <=
                          ["RECEIVED", "PREPARING", "PICKED", "DISPATCHED", "ARRIVED"].indexOf(
                            order.currentStatus
                          )
                          ? "#2ECC71"
                          : "#aaa",
                    }}
                  >
                    {s}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
