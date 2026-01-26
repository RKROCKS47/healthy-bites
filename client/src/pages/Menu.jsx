import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];

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
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  // ⭐ rating stats
  const [ratingStats, setRatingStats] = useState({
    avgRating: 0,
    totalReviews: 0,
  });

  // ✅ fetch products with loader
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ rating stats (optional loader not needed)
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
              disabled={loading} // ✅ prevents switching while loading
              style={loading ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
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

              const raw = p.image_url || p.image || "";
              const imgSrc = resolveImg(raw);

              return (
                <div key={p.id} className="card">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="card-img"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/images/salad1.png";
                    }}
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

                    <button
                      disabled={soldOut}
                      onClick={() =>
                        addToCart({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          image: imgSrc, // ✅ absolute URL stored in cart
                        })
                      }
                      className={soldOut ? "btn disabled" : "btn"}
                    >
                      {soldOut ? "Not Available" : "Add to Cart"}
                    </button>
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
