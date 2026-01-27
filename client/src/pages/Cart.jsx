import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, totals, addToCart, updateQty, removeFromCart } = useCart();

  const freeDelivery = totals.subtotal >= 199; // change threshold if you want

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 style={{ margin: 0 }}>Your Cart</h2>

        {items.length > 0 && (
          <p style={{ marginTop: 6, color: "#444", fontWeight: 800 }}>
            {freeDelivery ? "✅ Free delivery unlocked!" : "Add more for free delivery 🎁"}
          </p>
        )}

        {items.length === 0 ? (
          <div className="card section" style={{ padding: 16 }}>
            <p style={{ margin: 0 }}>Your cart is empty. Go to Menu 🥗</p>
            <Link to="/menu" className="btn" style={{ marginTop: 12, display: "inline-block" }}>
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              {items.map((x) => (
                <div
                  key={x.id}
                  className="card"
                  style={{
                    padding: 12,
                    display: "grid",
                    gridTemplateColumns: "68px 1fr auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={x.image || "/assets/images/salad1.png"}
                    alt={x.name}
                    style={{ width: 68, height: 56, borderRadius: 12, objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.src = "/assets/images/salad1.png")}
                  />

                  <div>
                    <div style={{ fontWeight: 900 }}>{x.name}</div>
                    <div style={{ marginTop: 4, color: "#444", fontWeight: 900 }}>
                      ₹{Number(x.price || 0) * Number(x.qty || 0)}
                    </div>

                    {/* ✅ Qty controls */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                      <button
                        className="btn"
                        style={{ padding: "6px 10px", background: "#111" }}
                        onClick={() => updateQty(x.id, Number(x.qty || 0) - 1)}
                      >
                        −
                      </button>

                      <div style={{ minWidth: 24, textAlign: "center", fontWeight: 900 }}>
                        {x.qty}
                      </div>

                      <button
                        className="btn"
                        style={{ padding: "6px 10px" }}
                        onClick={() => addToCart(x)} // ✅ increases qty
                      >
                        +
                      </button>

                      <button
                        className="btn"
                        style={{ padding: "6px 10px", background: "#E74C3C" }}
                        onClick={() => removeFromCart(x.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div style={{ fontWeight: 900 }}>₹{x.price}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="card section" style={{ padding: 16, marginTop: 16 }}>
              <Row label="Subtotal" value={`₹${totals.subtotal}`} />
              <Row label="Delivery Fee" value={`₹${totals.deliveryFee}`} />
              <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />
              <Row label="Total" value={`₹${totals.total}`} bold />

              <Link to="/checkout" className="btn" style={{ marginTop: 14, display: "inline-block" }}>
                Continue to Checkout ✅
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 900 : 800 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
