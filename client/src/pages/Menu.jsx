import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];

function resolveImg(p) {
  if (p?.image_url && typeof p.image_url === "string") return p.image_url;

  if (p?.image && typeof p.image === "string") {
    if (p.image.startsWith("http")) return p.image;
    if (p.image.startsWith("/uploads")) return `${API_BASE}${p.image}`;
  }

  return "/assets/images/salad1.png";
}

export default function Menu() {
  // ✅ must exist in your CartContext
  const { items, addToCart, updateQty, removeFromCart } = useCart();

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  // ⭐ rating stats
  const [ratingStats, setRatingStats] = useState({
    avgRating: 0,
    totalReviews: 0,
  });

  // ✅ Quick lookup: productId -> cartItem
  const cartMap = useMemo(() => {
    const m = new Map();
    (items || []).forEach((x) => m.set(Number(x.id), x));
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

  // fetch rating stats
  useEffect(() => {
    fetch(`${API_BASE}/api/reviews/stats/average`)
      .then((r) => r.json())
      .then((d) => setRatingStats(d || { avgRating: 0, totalReviews: 0 }))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  const dec = (productId) => {
    const x = cartMap.get(Number(productId));
    if (!x) return;

    const nextQty = Number(x.qty || 0) - 1;

    if (nextQty <= 0) {
      removeFromCart(Number(productId));
    } else {
      updateQty(Number(productId), nextQty);
    }
  };

  const inc = (product) => {
    const productId = Number(product.id);
    const x = cartMap.get(productId);

    if (!x) {
      // not in cart => add fresh
      addToCart({
        id: productId,
        name: product.name,
        price: product.price,
        image: resolveImg(product),
      });
      return;
    }

    // already in cart => increase qty
    updateQty(productId, Number(x.qty || 0) + 1);
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
              disabled={loading}
              style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="hb-skel-img" />
                  <div className="card-body">
                    <div className="hb-skel-line" />
                    <div className="hb-skel-line short" />
                    <div className="hb-skel-chiprow">
                      <div className="hb-skel-chip" />
                      <div className="hb-skel-chip" />
                    </div>
                    <div className="hb-skel-btn" />
                  </div>
                </div>
              ))
            : filtered.map((p) => {
                const soldOut = p.sold_out ?? Number(p.stock_qty || 0) <= 0;
                const imgSrc = resolveImg(p);

                const cartItem = cartMap.get(Number(p.id));
                const qty = Number(cartItem?.qty || 0);

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

                      {/* ✅ BUTTON AREA */}
                      {soldOut ? (
                        <button className="btn disabled" disabled>
                          Not Available
                        </button>
                      ) : qty > 0 ? (
                        // ✅ show - qty + controls
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 10,
                          }}
                        >
                          <button className="hb-qty-btn" onClick={() => dec(p.id)}>
                            −
                          </button>

                          <div style={{ fontWeight: 900, minWidth: 30, textAlign: "center" }}>
                            {qty}
                          </div>

                          <button className="hb-qty-btn" onClick={() => inc(p)}>
                            +
                          </button>
                        </div>
                      ) : (
                        // ✅ show Add to Cart
                        <button
                          className="btn"
                          onClick={() =>
                            addToCart({
                              id: Number(p.id),
                              name: p.name,
                              price: p.price,
                              image: imgSrc,
                            })
                          }
                        >
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