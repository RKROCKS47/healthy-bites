import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../utils/apiBase";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];

// ✅ Always resolve correct image
function resolveImg(p) {
  // Cloudinary full url stored in image_url (best)
  if (p?.image_url && typeof p.image_url === "string") return p.image_url;

  // sometimes you store in image field as full url
  if (p?.image && typeof p.image === "string") {
    if (p.image.startsWith("http")) return p.image;
    if (p.image.startsWith("/uploads")) return `${API_BASE}${p.image}`;
  }

  return "/assets/images/salad1.png";
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

  // ✅ fetch products
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ fetch rating stats
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

        {/* ✅ Skeleton while loading */}
        {loading ? (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, i) => (
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
            ))}
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => {
              const soldOut = p.sold_out ?? (Number(p.stock_qty || 0) <= 0);
              const imgSrc = resolveImg(p);

              return (
                <div key={p.id} className="card">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="card-img"
                    loading="lazy" // ✅ Step 1: Lazy load
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

                    <button
                      disabled={soldOut}
                      onClick={() =>
                        addToCart({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          image: imgSrc, // ✅ cart stores correct absolute url
                        })
                      }
                      className={soldOut ? "btn disabled" : "btn"}
                    >
                      {soldOut ? "Not Available" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}