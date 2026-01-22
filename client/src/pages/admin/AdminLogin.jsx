import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [key, setKey] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (!key.trim()) return alert("Enter admin key");
    localStorage.setItem("HB_ADMIN_KEY", key.trim());
    navigate("/admin/orders");
  };

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "40px auto" }}>
      <h2 style={{ margin: 0 }}>Admin Login</h2>
      <p style={{ marginTop: 6, color: "#555" }}>
        Enter your admin key to manage orders.
      </p>

      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Admin key"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #ddd",
          marginTop: 10,
        }}
      />

      <button
        onClick={login}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "none",
          background: "#2ECC71",
          color: "#fff",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Login
      </button>

      <div style={{ marginTop: 12, fontSize: 13, color: "#777" }}>
        Tip: Your key is set in <b>server/.env</b> as <b>ADMIN_KEY</b>.
      </div>
    </div>
  );
}
