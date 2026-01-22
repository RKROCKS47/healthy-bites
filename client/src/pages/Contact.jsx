// import Navbar from "../components/common/Navbar";

// export default function Contact() {
//   const phone = "+919284158390"; // change to your business number (with country code)
//   const msg = encodeURIComponent(
//     "Hi Healthy Bites! I want to order a salad 🥗. Please share today’s menu."
//   );

//   return (
//     <>
//       <Navbar />

//       <div style={{ padding: "28px 40px" }}>
//         <h2 style={{ margin: 0 }}>Contact & Location</h2>
//         <p style={{ marginTop: 6, color: "#444" }}>
//           Fresh Bites, Healthy Delights — Wagholi
//         </p>

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: 20,
//             marginTop: 16,
//           }}
//         >
//           {/* Left Card */}
//           <div style={card}>
//             <h3 style={{ marginTop: 0 }}>Get in Touch</h3>

//             <p style={{ margin: "8px 0" }}>
//               <strong>Phone:</strong> +919284158390
//             </p>
//             <p style={{ margin: "8px 0" }}>
//               <strong>Email:</strong> healthybites@gmail.com
//             </p>
//             <p style={{ margin: "8px 0" }}>
//               <strong>Address:</strong> Wagholi, Pune, Maharashtra
//             </p>

//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
//               <a
//                 href={`https://wa.me/${phone}?text=${msg}`}
//                 target="_blank"
//                 rel="noreferrer"
//                 style={{ ...btn, background: "#25D366" }}
//               >
//                 WhatsApp Order 🟢
//               </a>

//               <a
//                 href="tel:+919284158390"
//                 style={{ ...btn, background: "#2ECC71" }}
//               >
//                 Call Now 📞
//               </a>
//             </div>

//             <div style={{ marginTop: 18 }}>
//               <h4 style={{ margin: "0 0 8px" }}>Working Hours</h4>
//               <p style={{ margin: 0, color: "#444" }}>
//                 Mon–Sun: 10:00 AM – 10:00 PM
//               </p>
//             </div>
//           </div>

//           {/* Right Card - Map */}
//           <div style={card}>
//             <h3 style={{ marginTop: 0 }}>Find Us on Map</h3>

//             {/* Replace the map src with your exact Google Maps embed later */}
//             <iframe
//               title="Healthy Bites Location"
//               src="https://www.google.com/maps?q=Wagholi%20Pune&output=embed"
//               style={{
//                 width: "100%",
//                 height: 320,
//                 border: 0,
//                 borderRadius: 12,
//               }}
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// const card = {
//   border: "1px solid #eee",
//   borderRadius: 14,
//   padding: 16,
//   background: "#fff",
//   boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
// };

// const btn = {
//   display: "inline-block",
//   padding: "12px 14px",
//   borderRadius: 12,
//   color: "#fff",
//   fontWeight: 900,
//   textDecoration: "none",
// };
import Navbar from "../components/common/Navbar";

export default function Contact() {
  const phone = "919999999999"; // change
  const msg = encodeURIComponent(
    "Hi Healthy Bites! I want to order a salad 🥗. Please share today’s menu."
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 style={{ margin: 0 }}>Contact & Location</h2>
        <p style={{ marginTop: 6, color: "#444" }}>
          Fresh Bites, Healthy Delights — Wagholi
        </p>

        {/* Android-friendly grid */}
        <div className="grid section" style={{ alignItems: "start" }}>
          {/* Contact card */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Get in Touch</h3>

            <div style={{ display: "grid", gap: 8 }}>
              <div>
                <strong>Phone:</strong> +91 99999 99999
              </div>
              <div>
                <strong>Email:</strong> healthybites@gmail.com
              </div>
              <div>
                <strong>Address:</strong> Wagholi, Pune, Maharashtra
              </div>
            </div>

            {/* Buttons stack nicely on Android */}
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <a
                className="btn"
                href={`https://wa.me/${phone}?text=${msg}`}
                target="_blank"
                rel="noreferrer"
                style={{ background: "#25D366", textAlign: "center" }}
              >
                WhatsApp Order 🟢
              </a>

              <a
                className="btn"
                href="tel:+919999999999"
                style={{ textAlign: "center" }}
              >
                Call Now 📞
              </a>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ margin: "0 0 6px" }}>Working Hours</h4>
              <p style={{ margin: 0, color: "#444" }}>
                Mon–Sun: 10:00 AM – 10:00 PM
              </p>
            </div>
          </div>

          {/* Map card */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Find Us on Map</h3>
            <iframe
              title="Healthy Bites Location"
              src="https://www.google.com/maps?q=Wagholi%20Pune&output=embed"
              style={{
                width: "100%",
                height: 320,
                border: 0,
                borderRadius: 12,
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </>
  );
}
