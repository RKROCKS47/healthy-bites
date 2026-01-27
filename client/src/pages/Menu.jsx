import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];

// Always convert image into a safe usable URL
function resolveImg(raw) {
  if (!raw) return "/assets/images/salad1.png";
  if (raw.startsWith("/uploads")) return `${API_BASE}${raw}`;
  return raw; // full URL (cloudinary or absolute)
}

export default function Menu() {
  const { items, addToCart, updateQty, removeFromCart } = useCart();

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  // toast popup
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  // quick lookup of cart qty by product id
  const cartMap = useMemo(() => {
    const m = new Map();
    (items || []).forEach((x) => m.set(x.id, x));
    return m;
  }, [items]);

  // fetch products
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  const inc = (p) => {
    const cartItem = cartMap.get(p.id);
    const imgSrc = resolveImg(p.image_url || p.image || "");

    if (!cartItem) {
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        image: imgSrc,
      });
      showToast(`${p.name} added 🥗`);
    } else {
      updateQty(p.id, Number(cartItem.qty || 0) + 1);
      showToast(`Updated ${p.name}`);
    }
  };

  const dec = (p) => {
    const cartItem = cartMap.get(p.id);
    if (!cartItem) return;

    const next = Number(cartItem.qty || 0) - 1;
    if (next <= 0) {
      removeFromCart(p.id);
      showToast(`${p.name} removed`);
      return;
    }
    updateQty(p.id, next);
    showToast(`Updated ${p.name}`);
  };

  return (
    <>
      <Navbar />

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

        {/* SKELETON LOADING */}
        {loading ? (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton-img" />
                <div className="card-body">
                  <div className="skeleton-line w70" />
                  <div className="skeleton-line w40" />
                  <div className="skeleton-line w90" />
                  <div className="skeleton-btn" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => {
              const soldOut = p.sold_out ?? (Number(p.stock_qty || 0) <= 0);
              const imgSrc = resolveImg(p.image_url || p.image || "");

              const cartItem = cartMap.get(p.id);
              const qty = Number(cartItem?.qty || 0);

              return (
                <div key={p.id} className="card">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="card-img"
                    loading="lazy"
                    onError={(e) =>
                      (e.currentTarget.src = "/assets/images/salad1.png")
                    }
                  />

                  <div className="card-body">
                    {/* ✅ FIXED ORDER: Name + Price (no duplicate) */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <h3 style={{ margin: 0 }}>{p.name}</h3>
                      <strong>₹{p.price}</strong>
                    </div>

                    {/* Category + Tags */}
                    <div className="chips" style={{ marginTop: 8 }}>
                      <span className="chip">{p.category}</span>
                      {p.tags && <span className="chip">{p.tags}</span>}
                      {soldOut && <span className="chip danger">Sold Out</span>}
                    </div>

                    {/* ✅ Round Qty controls like cart style */}
                    {soldOut ? (
                      <button className="btn disabled" disabled style={{ marginTop: 12 }}>
                        Not Available
                      </button>
                    ) : qty > 0 ? (
                      <div className="qtyWrap">
                        <button className="qtyBtn" onClick={() => dec(p)}>
                          −
                        </button>

                        <div className="qtyCount">{qty}</div>

                        <button className="qtyBtn" onClick={() => inc(p)}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="btn" onClick={() => inc(p)} style={{ marginTop: 12 }}>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Toast Popup */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
