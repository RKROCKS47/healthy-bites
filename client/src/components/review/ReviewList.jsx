import { useEffect, useState } from "react";
import { API_BASE } from "../../utils/apiBase";
export default function ReviewList() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
  fetch(`${API_BASE}/api/reviews`)
      .then((r) => r.json())
      .then(setReviews);
  }, []);

  return (
    <div style={{ marginTop: 40 }}>
      <h2>What Our Customers Say ⭐</h2>

      <div style={{ display: "grid", gap: 16 }}>
        {reviews.map((r, i) => (
          <div key={i} style={card}>
            <strong>{r.customer_name}</strong>
            <div style={{ color: "#f5b301" }}>
              {"★".repeat(r.rating)}
            </div>
            <p style={{ margin: "6px 0" }}>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 14,
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
};
