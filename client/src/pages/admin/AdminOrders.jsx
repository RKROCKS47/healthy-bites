import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUSES = ["RECEIVED", "PREPARING", "PICKED", "DISPATCHED", "ARRIVED"];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [openOrder, setOpenOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);


    const adminKey = localStorage.getItem("HB_ADMIN_KEY") || "";

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/admin/orders", {
                headers: { "x-admin-key": adminKey },
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Unauthorized");
                if (res.status === 401) navigate("/admin");
                setLoading(false);
                return;
            }
            setOrders(data);
        } catch (e) {
            alert("Server not reachable");
        } finally {
            setLoading(false);
        }
    };
    const fetchItems = async (orderCode) => {
        setItemsLoading(true);
        try {
            const res = await fetch(
                `http://localhost:5000/api/admin/orders/${orderCode}/items`,
                { headers: { "x-admin-key": adminKey } }
            );
            const data = await res.json();
            if (!res.ok) return alert(data.message || "Failed to load items");

            setOrderItems(data.items || []);
            setOpenOrder(orderCode);
        } catch (e) {
            alert("Server not reachable");
        } finally {
            setItemsLoading(false);
        }
    };

    const updateStatus = async (orderCode, status) => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/admin/orders/${orderCode}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-key": adminKey,
                    },
                    body: JSON.stringify({ status }),
                }
            );
            const data = await res.json();
            if (!res.ok) return alert(data.message || "Update failed");

            // update UI instantly
            setOrders((prev) =>
                prev.map((o) => (o.order_code === orderCode ? { ...o, order_status: status } : o))
            );
        } catch (e) {
            alert("Update failed (server issue)");
        }
    };

    useEffect(() => {
        if (!adminKey) navigate("/admin");
        else fetchOrders();
        // eslint-disable-next-line
    }, []);

    return (
        <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0 }}>Admin Orders</h2>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={fetchOrders} style={btn}>
                        Refresh 🔄
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("HB_ADMIN_KEY");
                            navigate("/admin");
                        }}
                        style={{ ...btn, background: "#111" }}
                    >
                        Logout
                    </button>
                    <div
  style={{
    display: "flex",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  }}
>
  <button
    onClick={() => navigate("/admin/orders")}
    style={dashBtn}
  >
    📦 Orders
  </button>

  <button
    onClick={() => navigate("/admin/products")}
    style={dashBtn}
  >
    🥗 Products
  </button>
</div>

                </div>
            </div>

            {loading ? (
                <p style={{ marginTop: 14 }}>Loading orders...</p>
            ) : orders.length === 0 ? (
                <p style={{ marginTop: 14 }}>No orders yet.</p>
            ) : (
                <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                    {orders.map((o) => (
                        <div key={o.order_code} style={card}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                <div>
                                    <div style={{ fontWeight: 900 }}>
                                        Order: {o.order_code} • ₹{o.total}
                                    </div>
                                    <div style={{ color: "#555", marginTop: 4, fontSize: 13 }}>
                                        {o.customer_name} • {o.phone}
                                    </div>
                                    <div style={{ color: "#555", marginTop: 4, fontSize: 13 }}>
                                        {o.address_line}, {o.area}, {o.city} - {o.pincode}
                                    </div>
                                    <div style={{ marginTop: 6, fontSize: 13 }}>
                                        <b>Payment:</b> {o.payment_method} ({o.payment_status})
                                    </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 900, color: "#2ECC71" }}>
                                        {o.order_status}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                                        {new Date(o.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (openOrder === o.order_code) {
                                        setOpenOrder(null);
                                        setOrderItems([]);
                                    } else {
                                        fetchItems(o.order_code);
                                    }
                                }}
                                style={{
                                    marginTop: 10,
                                    padding: "10px 12px",
                                    borderRadius: 12,
                                    border: "1px solid #ddd",
                                    background: "#fff",
                                    fontWeight: 900,
                                    cursor: "pointer",
                                }}
                            >
                                {openOrder === o.order_code ? "Hide Items" : "View Items 🍽️"}
                            </button>
                            {openOrder === o.order_code && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        borderTop: "1px solid #eee",
                                        paddingTop: 12,
                                    }}
                                >
                                    <div style={{ fontWeight: 900, marginBottom: 8 }}>
                                        Items ({itemsLoading ? "loading..." : orderItems.length})
                                    </div>

                                    {itemsLoading ? (
                                        <p style={{ margin: 0, color: "#777" }}>Loading items...</p>
                                    ) : orderItems.length === 0 ? (
                                        <p style={{ margin: 0, color: "#777" }}>
                                            No items found for this order.
                                        </p>
                                    ) : (
                                        <div style={{ display: "grid", gap: 10 }}>
                                            {orderItems.map((it) => (
                                                <div
                                                    key={it.id}
                                                    style={{
                                                        display: "flex",
                                                        gap: 10,
                                                        alignItems: "center",
                                                        border: "1px solid #f0f0f0",
                                                        borderRadius: 12,
                                                        padding: 10,
                                                        background: "#fafafa",
                                                    }}
                                                >
                                                    {it.image ? (
                                                        <img
                                                            src={it.image}
                                                            alt={it.product_name}
                                                            style={{
                                                                width: 54,
                                                                height: 44,
                                                                borderRadius: 10,
                                                                objectFit: "cover",
                                                                background: "#fff",
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: 54,
                                                                height: 44,
                                                                borderRadius: 10,
                                                                background: "#eee",
                                                            }}
                                                        />
                                                    )}

                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 900, fontSize: 13 }}>
                                                            {it.product_name}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                                                            ₹{it.price} × {it.qty}
                                                        </div>
                                                    </div>

                                                    <div style={{ fontWeight: 900 }}>₹{it.price * it.qty}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => updateStatus(o.order_code, s)}
                                        style={{
                                            ...statusBtn,
                                            borderColor: o.order_status === s ? "#2ECC71" : "#ddd",
                                            background: o.order_status === s ? "#eafff2" : "#fff",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const card = {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const btn = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background: "#2ECC71",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
};

const statusBtn = {
    padding: "10px 10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12,
};
