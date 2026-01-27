import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];

function resolveImg(raw) {
  if (!raw) return "/assets/images/salad1.png";
  if (raw.startsWith("/uploads")) return `${API_BASE}${raw}`;
  return raw; // full URL (cloudinary etc)
}

export default function Menu() {
  // ✅ MUST have items in context
  const { items, addToCart, updateQty } = useCart(); 
  // If your context doesn't have updateQty, see note below.

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");

  // ⭐ rating stats
  const [ratingStats, setRatingStats] = useState({ avgRating: 0, totalReviews: 0 });

  // ✅ toast state
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__hb_toast_timer);
    window.__hb_toast_timer = window.setTimeout(() => setToast(""), 1500);
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/reviews/stats/average`)
      .then((r) => r.json())
      .then(setRatingStats)
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  // ✅ helper: qty in cart
  const getQty = (productId) => {
    const found = items?.find((x) => Number(x.id) === Number(productId));
    return found ? Number(found.qty || 0) : 0;
  };

  const inc = (p) => {
    const soldOut = p.sold_out ?? Number(p.stock_qty || 0) <= 0;
    if (soldOut) return;

    const raw = p.image_url || p.image || "";
    const imgSrc = resolveImg(raw);

    const qty = getQty(p.id);

    if (qty === 0) {
      addToCart({ id: p.id, name: p.name, price: p.price, image: imgSrc });
      showToast(`${p.name} added ✅`);
    } else {
      updateQty(p.id, qty + 1);
      showToast(`+1 ${p.name}`);
    }
  };

  const dec = (p) => {
    const qty = getQty(p.id);
    if (qty <= 0) return;
    updateQty(p.id, qty - 1);
  };

  return (
    <>
      <Navbar />

      {/* ✅ TOAST POPUP */}
      {toast ? (
        <div
          style={{
            position: "fixed",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            zIndex: 9999,
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          }}
        >
          {toast}
        </div>
      ) : null}

      <div className="container">
        <h2 style={{ margin: 0 }}>Menu</h2>
        <p style={{ marginTop: 6, color: "#444" }}>
          Choose your bowl — fresh, clean, and delicious.
        </p>

        {/* Categories */}
        <div className="tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={active === c ? "tab active" : "tab"}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid">
          {filtered.map((p) => {
            const soldOut = p.sold_out ?? Number(p.stock_qty || 0) <= 0;
            const raw = p.image_url || p.image || "";
            const imgSrc = resolveImg(raw);

            const qty = getQty(p.id);

            return (
              <div key={p.id} className="card">
                <img
                  src={imgSrc}
                  alt={p.name}
                  className="card-img"
                  onError={(e) => (e.currentTarget.src = "/assets/images/salad1.png")}
                />

                <div className="card-body">
                  <div className="row">
                    <h3>{p.name}</h3>
                    <strong>₹{p.price}</strong>
                  </div>

                  {/* ⭐ Rating */}
                  {ratingStats.totalReviews > 0 ? (
                    <div className="rating">
                      ★ {ratingStats.avgRating}
                      <span>({ratingStats.totalReviews})</span>
                    </div>
                  ) : (
                    <div className="rating muted">⭐ New</div>
                  )}

                  <div className="chips">
                    <span className="chip">{p.category}</span>
                    {p.tags && <span className="chip">{p.tags}</span>}
                    {soldOut && <span className="chip danger">Sold Out</span>}
                  </div>

                  {/* ✅ Add to cart OR qty controls */}
                  {soldOut ? (
                    <button className="btn disabled" disabled>
                      Not Available
                    </button>
                  ) : qty > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      <button
                        className="btn"
                        style={{ width: 44, background: "#111" }}
                        onClick={() => dec(p)}
                      >
                        −
                      </button>

                      <div style={{ fontWeight: 900, fontSize: 16 }}>{qty}</div>

                      <button
                        className="btn"
                        style={{ width: 44 }}
                        onClick={() => inc(p)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button className="btn" onClick={() => inc(p)}>
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
