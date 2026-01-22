// import { useMemo, useState } from "react";
// import Navbar from "../components/common/Navbar";
// import { useCart } from "../context/CartContext";

// export default function Checkout() {
//   const { items, totals, clearCart } = useCart();

//   const [form, setForm] = useState({
//     fullName: "",
//     phone: "",
//     email: "",
//     addressLine: "",
//     area: "",
//     city: "Wagholi",
//     pincode: "",
//     instructions: "",
//   });

//   const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | ONLINE
//   const [onlineMode, setOnlineMode] = useState("UPI"); // UPI | CARD

//   const canPlaceOrder = useMemo(() => {
//     return (
//       items.length > 0 &&
//       form.fullName.trim().length >= 2 &&
//       form.phone.trim().length >= 10 &&
//       form.addressLine.trim().length >= 6 &&
//       form.area.trim().length >= 2 &&
//       form.pincode.trim().length >= 6
//     );
//   }, [items.length, form]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   const handlePlaceOrderCOD = async () => {
//   if (!canPlaceOrder) {
//     alert("Please fill all required details.");
//     return;
//   }

//   try {
//     const res = await fetch("http://localhost:5000/api/orders", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         customer: form,
//         items,
//         totals,
//         paymentMethod: "COD",
//         paymentStatus: "PENDING",
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.message || "Order failed");
//       return;
//     }

//     // success
//     clearCart();

//     // redirect to track page with real order id
//     window.location.href = `/track?order=${data.orderCode}`;
//   } catch (err) {
//     console.error(err);
//     alert("Server error. Please try again.");
//   }
// };


//   const handlePayNowOnline = () => {
//     if (!canPlaceOrder) return alert("Please fill all required details.");
//     // Later: Razorpay integration here
//     const orderPayload = {
//       customer: form,
//       items,
//       totals,
//       paymentMethod: "ONLINE",
//       onlineMode,
//       paymentStatus: "INITIATED",
//     };

//     console.log("ONLINE ORDER:", orderPayload);
//     alert("✅ Payment flow will be added (Razorpay). For now order is created as INITIATED.");

//     clearCart();
//   };

//   return (
//     <>
//       <Navbar />
//       <div style={{ padding: "28px 40px" }}>
//         <h2 style={{ margin: 0 }}>Checkout</h2>
//         <p style={{ marginTop: 6, color: "#444" }}>
//           Confirm delivery details and choose payment method.
//         </p>

//         {items.length === 0 ? (
//           <div style={card}>
//             <p style={{ margin: 0 }}>Your cart is empty. Add some salads 🥗</p>
//           </div>
//         ) : (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1.4fr 1fr",
//               gap: 20,
//               marginTop: 16,
//             }}
//           >
//             {/* LEFT: Delivery details + Payment */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//               {/* Delivery Details */}
//               <div style={card}>
//                 <h3 style={{ marginTop: 0 }}>Delivery Details</h3>

//                 <div style={grid2}>
//                   <Input
//                     label="Full Name *"
//                     name="fullName"
//                     value={form.fullName}
//                     onChange={handleChange}
//                     placeholder="first last"
//                   />
//                   <Input
//                     label="Phone *"
//                     name="phone"
//                     value={form.phone}
//                     onChange={handleChange}
//                     placeholder="10-digit mobile"
//                   />
//                   <Input
//                     label="Email (optional)"
//                     name="email"
//                     value={form.email}
//                     onChange={handleChange}
//                     placeholder="you@example.com"
//                   />
//                   <Input
//                     label="Pincode *"
//                     name="pincode"
//                     value={form.pincode}
//                     onChange={handleChange}
//                     placeholder="6-digit pincode"
//                   />
//                 </div>

//                 <div style={{ marginTop: 12 }}>
//                   <Input
//                     label="Address Line *"
//                     name="addressLine"
//                     value={form.addressLine}
//                     onChange={handleChange}
//                     placeholder="Flat, building, road..."
//                   />
//                 </div>

//                 <div style={{ ...grid2, marginTop: 12 }}>
//                   <Input
//                     label="Area / Landmark *"
//                     name="area"
//                     value={form.area}
//                     onChange={handleChange}
//                     placeholder="Near XYZ"
//                   />
//                   <Input
//                     label="City"
//                     name="city"
//                     value={form.city}
//                     onChange={handleChange}
//                     placeholder="city"
//                   />
//                 </div>

//                 <div style={{ marginTop: 12 }}>
//                   <Label>Delivery Instructions (optional)</Label>
//                   <textarea
//                     name="instructions"
//                     value={form.instructions}
//                     onChange={handleChange}
//                     placeholder="e.g. Call before delivery, leave at security..."
//                     style={textarea}
//                   />
//                 </div>
//               </div>

//               {/* Payment Method */}
//               <div style={card}>
//                 <h3 style={{ marginTop: 0 }}>Payment Method</h3>

//                 <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//                   <Chip
//                     active={paymentMethod === "COD"}
//                     onClick={() => setPaymentMethod("COD")}
//                     text="💵 Cash on Delivery (COD)"
//                   />
//                   <Chip
//                     active={paymentMethod === "ONLINE"}
//                     onClick={() => setPaymentMethod("ONLINE")}
//                     text="💳 Pay Online"
//                   />
//                 </div>

//                 {paymentMethod === "COD" ? (
//                   <div style={{ marginTop: 12, color: "#333" }}>
//                     <p style={{ margin: 0 }}>
//                       ✅ Pay cash when your order arrives.
//                     </p>
//                     <p style={{ margin: "8px 0 0", fontSize: 13, color: "#555" }}>
//                       Tip: Keep exact cash ready. COD orders may require phone verification later.
//                     </p>
//                   </div>
//                 ) : (
//                   <div style={{ marginTop: 12 }}>
//                     <Label>Choose Online Mode</Label>
//                     <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
//                       <Chip active={onlineMode === "UPI"} onClick={() => setOnlineMode("UPI")} text="UPI" />
//                       <Chip active={onlineMode === "CARD"} onClick={() => setOnlineMode("CARD")} text="Card" />
//                     </div>

//                     <p style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
//                       Razorpay/UPI integration will be added in backend step.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* RIGHT: Order Summary */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//               <div style={card}>
//                 <h3 style={{ marginTop: 0 }}>Order Summary</h3>

//                 <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                   {items.map((x) => (
//                     <div
//                       key={x.id}
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         gap: 10,
//                         alignItems: "center",
//                       }}
//                     >
//                       <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//                         <img
//                           src={x.image}
//                           alt={x.name}
//                           style={{ width: 56, height: 44, borderRadius: 10, objectFit: "cover" }}
//                         />
//                         <div>
//                           <div style={{ fontWeight: 800 }}>{x.name}</div>
//                           <div style={{ fontSize: 13, color: "#555" }}>
//                             Qty: {x.qty} × ₹{x.price}
//                           </div>
//                         </div>
//                       </div>
//                       <strong>₹{x.qty * x.price}</strong>
//                     </div>
//                   ))}
//                 </div>

//                 <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "14px 0" }} />

//                 <Row label="Subtotal" value={`₹${totals.subtotal}`} />
//                 <Row label="Delivery Fee" value={`₹${totals.deliveryFee}`} />
//                 <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />
//                 <Row label="Total" value={`₹${totals.total}`} bold />
//               </div>

//               <div style={card}>
//                 <button
//                   disabled={!canPlaceOrder}
//                   onClick={paymentMethod === "COD" ? handlePlaceOrderCOD : handlePayNowOnline}
//                   style={{
//                     width: "100%",
//                     padding: "14px 14px",
//                     borderRadius: 12,
//                     border: "none",
//                     background: !canPlaceOrder ? "#cfcfcf" : "#2ECC71",
//                     color: "#fff",
//                     fontWeight: 900,
//                     cursor: !canPlaceOrder ? "not-allowed" : "pointer",
//                     fontSize: 15,
//                   }}
//                 >
//                   {paymentMethod === "COD" ? "Place Order (COD)" : `Pay Now (${onlineMode})`}
//                 </button>

//                 {!canPlaceOrder && (
//                   <p style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
//                     Fill required fields (*) to continue.
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// function Input({ label, ...props }) {
//   return (
//     <div>
//       <Label>{label}</Label>
//       <input {...props} style={input} />
//     </div>
//   );
// }

// function Label({ children }) {
//   return <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{children}</div>;
// }

// function Chip({ text, active, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       style={{
//         padding: "10px 14px",
//         borderRadius: "999px",
//         border: active ? "1px solid #2ECC71" : "1px solid #ddd",
//         background: active ? "#eafff2" : "#fff",
//         cursor: "pointer",
//         fontWeight: 800,
//       }}
//       type="button"
//     >
//       {text}
//     </button>
//   );
// }

// function Row({ label, value, bold }) {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 900 : 700 }}>
//       <span>{label}</span>
//       <span>{value}</span>
//     </div>
//   );
// }

// const card = {
//   border: "1px solid #eee",
//   borderRadius: 12,
//   overflow: "hidden",
//   padding: 16,
//   background: "#fff",
//   boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
// };

// const grid2 = {
//   display: "grid",
//   gridTemplateColumns: "1fr 1fr",
//   gap: 12,
// };

// const input = {
//   width: "100%",
//   padding: "12px 12px",
//   borderRadius: 10,
//   border: "1px solid #ddd",
//   outline: "none",
// };

// const textarea = {
//   width: "100%",
//   minHeight: 90,
//   padding: "12px 12px",
//   borderRadius: 10,
//   border: "1px solid #ddd",
//   outline: "none",
//   resize: "vertical",
// };
import Navbar from "../components/common/Navbar";
import { useCart } from "../context/CartContext";
import { useEffect, useMemo, useState } from "react";

export default function Checkout() {
  const { items, totals, clearCart } = useCart();

  // form
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine: "",
    area: "",
    city: "Pune",
    pincode: "",
    instructions: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | ONLINE
  const [placing, setPlacing] = useState(false);

  const canPlaceOrder = useMemo(() => {
    if (items.length === 0) return false;
    return (
      form.fullName.trim() &&
      form.phone.trim() &&
      form.addressLine.trim() &&
      form.area.trim() &&
      form.city.trim() &&
      form.pincode.trim()
    );
  }, [form, items.length]);

  // simple phone/pincode cleanup (optional)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: prev.phone.replace(/[^\d]/g, "").slice(0, 10),
      pincode: prev.pincode.replace(/[^\d]/g, "").slice(0, 6),
    }));
  }, [form.phone, form.pincode]);

  const placeOrder = async () => {
    if (!canPlaceOrder) {
      alert("Please fill all required details.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          totals,
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Order failed");
        setPlacing(false);
        return;
      }

      clearCart();
      window.location.href = `/track?order=${data.orderCode}`;
    } catch (err) {
      console.error(err);
      alert("Server not reachable. Make sure backend is running.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h2 style={{ margin: 0 }}>Checkout</h2>
        <p style={{ marginTop: 6, color: "#444" }}>
          Confirm address & payment method.
        </p>

        {items.length === 0 ? (
          <div className="card section" style={{ padding: 16 }}>
            <p style={{ margin: 0 }}>
              Your cart is empty. Add items from Menu 🥗
            </p>
          </div>
        ) : (
          <div className="grid section">
            {/* LEFT: Address + Payment */}
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Delivery Details</h3>

              <div style={formGrid}>
                <Input
                  label="Full Name *"
                  value={form.fullName}
                  onChange={(v) => setForm({ ...form, fullName: v })}
                  placeholder="Your name"
                />

                <Input
                  label="Phone *"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                />

                <Input
                  label="Email (optional)"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="example@gmail.com"
                />

                <Input
                  label="Full Address *"
                  value={form.addressLine}
                  onChange={(v) => setForm({ ...form, addressLine: v })}
                  placeholder="House/Flat, Street, Building..."
                />

                <Input
                  label="Area *"
                  value={form.area}
                  onChange={(v) => setForm({ ...form, area: v })}
                  placeholder="Wagholi / Kharadi..."
                />

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <Input
                    label="City *"
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    placeholder="Pune"
                  />
                  <Input
                    label="Pincode *"
                    value={form.pincode}
                    onChange={(v) => setForm({ ...form, pincode: v })}
                    placeholder="6-digit"
                    inputMode="numeric"
                  />
                </div>

                <Textarea
                  label="Delivery Instructions (optional)"
                  value={form.instructions}
                  onChange={(v) => setForm({ ...form, instructions: v })}
                  placeholder="Call on arrival, leave at gate, etc."
                />
              </div>

              <h3 style={{ marginTop: 18 }}>Payment Method</h3>

              <div style={{ display: "grid", gap: 12 }}>
                <PaymentCard
                  active={paymentMethod === "COD"}
                  title="Cash on Delivery (COD)"
                  desc="Pay when your salad arrives."
                  onClick={() => setPaymentMethod("COD")}
                />

                <PaymentCard
                  active={paymentMethod === "ONLINE"}
                  title="Online Payment"
                  desc="UPI / Card / Netbanking (UI now, Razorpay next)."
                  onClick={() => setPaymentMethod("ONLINE")}
                />

                {paymentMethod === "ONLINE" && (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: "1px dashed #cbd5e1",
                      background: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Online payments will be connected via Razorpay next.
                    For now, place order to test flow.
                  </div>
                )}
              </div>

              <button
                className="btn"
                onClick={placeOrder}
                disabled={!canPlaceOrder || placing}
                style={{ marginTop: 16 }}
              >
                {placing
                  ? "Placing Order..."
                  : paymentMethod === "COD"
                  ? "Place Order (COD) 🥗"
                  : "Place Order (Online) 💳"}
              </button>

              {!canPlaceOrder && (
                <div style={{ marginTop: 10, color: "#777", fontSize: 13 }}>
                  Fill required fields (*) to place order.
                </div>
              )}
            </div>

            {/* RIGHT: Summary */}
            <div className="card" style={{ padding: 16, height: "fit-content" }}>
              <h3 style={{ marginTop: 0 }}>Order Summary</h3>

              <div style={{ display: "grid", gap: 10 }}>
                {items.map((x) => (
                  <div
                    key={x.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr auto",
                      gap: 10,
                      alignItems: "center",
                      border: "1px solid #eee",
                      borderRadius: 14,
                      padding: 10,
                    }}
                  >
                    <img
                      src={x.image}
                      alt={x.name}
                      style={{
                        width: 56,
                        height: 48,
                        borderRadius: 12,
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{x.name}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        ₹{x.price} × {x.qty}
                      </div>
                    </div>
                    <div style={{ fontWeight: 900 }}>₹{x.price * x.qty}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "#eee", margin: "14px 0" }} />

              <Row label="Subtotal" value={`₹${totals.subtotal}`} />
              <Row label="Delivery Fee" value={`₹${totals.deliveryFee}`} />
              <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />
              <Row label="Total" value={`₹${totals.total}`} bold />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Small Components ---------- */

function Input({ label, value, onChange, placeholder, inputMode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: "#374151" }}>
        {label}
      </span>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: "#374151" }}>
        {label}
      </span>
      <textarea
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function PaymentCard({ active, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        borderRadius: 14,
        padding: 14,
        border: active ? "2px solid #2ECC71" : "1px solid #e5e7eb",
        background: active ? "#eafff2" : "#fff",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 4, color: "#666", fontSize: 13, fontWeight: 700 }}>
        {desc}
      </div>
    </button>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 900 : 800 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const formGrid = {
  display: "grid",
  gap: 12,
};
