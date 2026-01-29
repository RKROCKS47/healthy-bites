import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];

// Always convert image into a safe usable URL
function resolveImg(raw) {
  if (!raw) return "/assets/images/salad1.png";
  if (raw.startsWith("/uploads")) return `${API_BASE}${raw}`;
  return raw; // full URL (Cloudinary / absolute)
}

/* ✅ Skeleton card */
function MenuSkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton skeleton-img" />
      <div className="card-body">
        <div className="skeleton skeleton-text long" />
        <div className="skeleton skeleton-text short" />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <div className="skeleton skeleton-chip" />
          <div className="skeleton skeleton-chip" />
        </div>
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

export default function Menu() {
  // ✅ Use ONLY ONCE
  const { items, addToCart, updateQty, removeFromCart } = useCart();

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  // ⭐ rating stats
  const [ratingStats, setRatingStats] = useState({
    avgRating: 0,
    totalReviews: 0,
  });

  // ✅ toast
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__hb_toast_timer);
    window.__hb_toast_timer = window.setTimeout(() => setToast(""), 1500);
  };

  // ✅ fetch products
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ rating stats
  useEffect(() => {
    fetch(`${API_BASE}/api/reviews/stats/average`)
      .then((r) => r.json())
      .then((d) =>
        setRatingStats({
          avgRating: Number(d?.avgRating || 0),
          totalReviews: Number(d?.totalReviews || 0),
        })
      )
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  // ✅ qty in cart by productId
  const getQty = (productId) => {
    const found = (items || []).find((x) => Number(x.id) === Number(productId));
    return found ? Number(found.qty || 0) : 0;
  };

  const inc = (p) => {
    const soldOut = p.sold_out ?? Number(p.stock_qty || 0) <= 0;
    if (soldOut) return;

    const imgSrc = resolveImg(p.image_url || p.image || "");
    const qty = getQty(p.id);

    if (qty === 0) {
      addToCart({ id: p.id, name: p.name, price: p.price, image: imgSrc });
      showToast("Item added ✅");
      return;
    }

    updateQty(p.id, qty + 1);
    showToast("+1 ✅");
  };

  const dec = (p) => {
    const qty = getQty(p.id);
    if (qty <= 0) return;

    const next = qty - 1;

    // ✅ if 0 then remove from cart
    if (next <= 0) {
      removeFromCart(p.id);
      showToast("Item removed ✅");
      return;
    }

    updateQty(p.id, next);
    showToast("-1 ✅");
  };

  return (
    <>
      <Navbar />

      {/* ✅ Toast popup */}
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
              disabled={loading}
              style={loading ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>

        {/* ✅ Products OR Skeleton */}
        <div className="grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <MenuSkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: 16 }}>
              No items found.
            </div>
          ) : (
            filtered.map((p) => {
              const soldOut = p.sold_out ?? Number(p.stock_qty || 0) <= 0;
              const imgSrc = resolveImg(p.image_url || p.image || "");
              const qty = getQty(p.id);

              return (
                <div key={p.id} className="card">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="card-img"
                    loading="lazy"
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

                    {/* ✅ Add to cart OR qty controls (same style area) */}
                    {soldOut ? (
                      <button className="btn disabled" disabled type="button">
                        Not Available
                      </button>
                    ) : qty > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          marginTop: 10,
                        }}
                      >
                        <button
                          className="btn"
                          style={{ width: 46, background: "#111" }}
                          onClick={() => dec(p)}
                          type="button"
                        >
                          −
                        </button>

                        <div style={{ fontWeight: 900, fontSize: 16 }}>{qty}</div>

                        <button
                          className="btn"
                          style={{ width: 46 }}
                          onClick={() => inc(p)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="btn" onClick={() => inc(p)} type="button">
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
