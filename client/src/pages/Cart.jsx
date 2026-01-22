import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Cart() {
  const { items, incQty, decQty, removeItem, totals } = useCart();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [removingIds, setRemovingIds] = useState([]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const removeWithAnim = (id) => {
    setRemovingIds((prev) => [...prev, id]);
    setTimeout(() => {
      removeItem(id);
      setRemovingIds((prev) => prev.filter((x) => x !== id));
    }, 200);
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: isMobile ? "16px" : "28px 40px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <h2 style={{ margin: 0 }}>Your Cart</h2>

        {/* Free delivery banner */}
        {items.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: "#f3fffa",
              fontWeight: 800,
            }}
          >
            {totals.subtotal >= 299
              ? "✅ Free delivery unlocked!"
              : `🚚 Add ₹${299 - totals.subtotal} more to get FREE delivery`}
          </div>
        )}

        {items.length === 0 ? (
          <p style={{ marginTop: 16 }}>
            Cart is empty. Add some salads 🥗
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr",
              gap: 16,
              marginTop: 16,
              alignItems: "start",
            }}
          >
            {/* LEFT: Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((x) => (
                <div
                  key={x.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 14,
                    border: "1px solid #eee",
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    alignItems: "center",
                    transition: "opacity 0.2s, transform 0.2s",
                    opacity: removingIds.includes(x.id) ? 0 : 1,
                    transform: removingIds.includes(x.id)
                      ? "translateX(10px)"
                      : "translateX(0)",
                  }}
                >
                  <img
                    src={x.image}
                    alt={x.name}
                    style={{
                      width: isMobile ? 64 : 80,
                      height: isMobile ? 56 : 70,
                      borderRadius: 10,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: 14 }}>{x.name}</strong>
                      <strong style={{ fontSize: 14 }}>
                        ₹{x.price * x.qty}
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() =>
                          x.qty === 1
                            ? removeWithAnim(x.id)
                            : decQty(x.id)
                        }
                        style={qtyBtn}
                      >
                        −
                      </button>

                      <span
                        style={{
                          minWidth: 20,
                          textAlign: "center",
                          fontWeight: 700,
                        }}
                      >
                        {x.qty}
                      </span>

                      <button
                        onClick={() => incQty(x.id)}
                        style={qtyBtn}
                      >
                        +
                      </button>

                      <button
                        onClick={() => removeWithAnim(x.id)}
                        style={{
                          marginLeft: "auto",
                          border: "none",
                          background: "transparent",
                          color: "#d11",
                          fontWeight: 700,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Summary */}
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Bill Summary</h3>

              <Row label="Subtotal" value={`₹${totals.subtotal}`} />
              <Row label="Delivery Fee" value={`₹${totals.deliveryFee}`} />
              <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
              <Row label="Total" value={`₹${totals.total}`} bold />

              <button
                onClick={() => navigate("/checkout")}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: "#2ECC71",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "10px 0",
        fontWeight: bold ? 800 : 600,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const card = {
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const qtyBtn = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
};

