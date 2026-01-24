import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [adminKeyInput, setAdminKeyInput] = useState("");

  const login = (e) => {
    e.preventDefault();

    if (!adminKeyInput.trim()) {
      alert("Enter Admin Key");
      return;
    }

    // save key
    localStorage.setItem("ADMIN_KEY", adminKeyInput.trim());

    navigate("/admin/orders");
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: 520 }}>
        <h2 style={{ margin: 0 }}>Admin Login</h2>
        <p style={{ marginTop: 6, color: "#555" }}>
          Enter your Admin Key to continue
        </p>

        <div className="card" style={{ padding: 14, marginTop: 14 }}>
          <form onSubmit={login} style={{ display: "grid", gap: 10 }}>
            <input
              className="input"
              placeholder="Admin Key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
            />

            <button className="btn" type="submit">
              Login ✅
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
            Tip: If you get unauthorized, your Render <b>ADMIN_KEY</b> must match.
          </div>
        </div>
      </div>
    </>
  );
}
