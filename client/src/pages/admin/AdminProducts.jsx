import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";

const CATEGORIES = ["Veg", "Non-Veg", "Vegan", "Lactose-Free"];

export default function AdminProducts() {
  const adminKey = localStorage.getItem("HB_ADMIN_KEY");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Veg",
    tags: "",
    image: "",
    stock_qty: 0,
    is_active: 1,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/products", {
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      category: "Veg",
      tags: "",
      image: "",
      stock_qty: 0,
      is_active: 1,
    });
  };

  const submit = async () => {
    if (!form.name || !form.price) return alert("Name + Price required");

    const url = editing
      ? `http://localhost:5000/api/admin/products/${editing}`
      : `http://localhost:5000/api/admin/products`;

    const method = editing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify(form),
    });

    resetForm();
    fetchProducts();
  };

  const toggle = async (id) => {
    await fetch(`http://localhost:5000/api/admin/products/${id}/toggle`, {
      method: "PATCH",
      headers: { "x-admin-key": adminKey },
    });
    fetchProducts();
  };

  const updateStock = async (id, stock_qty) => {
    await fetch(`http://localhost:5000/api/admin/products/${id}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ stock_qty }),
    });
    fetchProducts();
  };

  const del = async (id) => {
    if (!confirm("Delete product?")) return;
    await fetch(`http://localhost:5000/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    fetchProducts();
  };

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name || "",
      price: p.price || "",
      category: p.category || "Veg",
      tags: p.tags || "",
      image: p.image || "",
      stock_qty: p.stock_qty || 0,
      is_active: p.is_active ?? 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: 900 }}>
        <h2 style={{ margin: 0 }}>Admin Products</h2>
        <p style={{ marginTop: 6, color: "#555" }}>
          Add / Edit salads + Stock + Sold Out
        </p>

        {/* Form */}
        <div className="card" style={{ padding: 14, marginTop: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            {editing ? "Edit Product" : "Add Product"}
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              className="input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Tags (comma or single)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />

            <input
              className="input"
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <input
              className="input"
              placeholder="Stock Qty"
              value={form.stock_qty}
              onChange={(e) =>
                setForm({ ...form, stock_qty: Number(e.target.value || 0) })
              }
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn" onClick={submit}>
              {editing ? "Save Changes ✅" : "Add Product ✅"}
            </button>
            {editing && (
              <button className="btn" style={{ background: "#777" }} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Products {loading ? "(loading...)" : `(${products.length})`}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {products.map((p) => {
              const soldOut = (p.stock_qty ?? 0) <= 0 || (p.is_active ?? 1) === 0;

              return (
                <div key={p.id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      src={p.image || "/assets/images/salad1.png"}
                      alt={p.name}
                      style={{ width: 70, height: 55, borderRadius: 12, objectFit: "cover" }}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>
                          {p.name} {soldOut ? "❌" : "✅"}
                        </div>
                        <div style={{ fontWeight: 900 }}>₹{p.price}</div>
                      </div>

                      <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="chip">{p.category}</span>
                        <span className="chip">Stock: {p.stock_qty}</span>
                        {p.tags ? <span className="chip">{p.tags}</span> : null}
                        {soldOut ? <span className="chip danger">Sold Out</span> : null}
                      </div>

                      {/* Quick stock */}
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        <button className="miniBtn" onClick={() => updateStock(p.id, (p.stock_qty || 0) + 5)}>
                          +5 Stock
                        </button>
                        <button className="miniBtn" onClick={() => updateStock(p.id, Math.max(0, (p.stock_qty || 0) - 1))}>
                          -1 Stock
                        </button>
                        <button className="miniBtn" onClick={() => toggle(p.id)}>
                          Toggle Active
                        </button>
                        <button className="miniBtn" onClick={() => startEdit(p)}>
                          Edit
                        </button>
                        <button className="miniBtn dangerBtn" onClick={() => del(p.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {products.length === 0 && !loading && (
              <div style={{ color: "#777" }}>No products yet. Add your first salad ✅</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
