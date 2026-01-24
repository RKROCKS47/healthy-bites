import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";

const CATEGORIES = ["All", "Veg", "Non-Veg", "Vegan", "Lactose-Free"];
import { API_BASE } from "../utils/apiBase";


export default function Menu() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");

  // ⭐ rating stats
  const [ratingStats, setRatingStats] = useState({
    avgRating: 0,
    totalReviews: 0,
  });

  // fetch products
  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  // fetch rating stats
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
            >
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid">
          {filtered.map((p) => {
            const soldOut = p.sold_out ?? (p.stock_qty <= 0);
            const imgSrc = p.image_url || p.image || "/assets/images/salad1.png";

            return (
              <div key={p.id} className="card">
                <img src={imgSrc} alt={p.name} className="card-img" />

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
                        image: imgSrc,
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
      </div>
    </>
  );
}
