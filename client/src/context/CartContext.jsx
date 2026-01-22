// import { createContext, useContext, useMemo, useState } from "react";

// const CartContext = createContext(null);

// export function CartProvider({ children }) {
//   const [items, setItems] = useState([]); // [{id, name, price, qty, image}]

//   const addToCart = (product) => {
//     setItems((prev) => {
//       const found = prev.find((x) => x.id === product.id);
//       if (found) {
//         return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
//       }
//       return [...prev, { ...product, qty: 1 }];
//     });
//   };

//   const incQty = (id) => {
//     setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)));
//   };

//   const decQty = (id) => {
//     setItems((prev) =>
//       prev
//         .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
//         .filter((x) => x.qty > 0)
//     );
//   };

//   const removeItem = (id) => {
//     setItems((prev) => prev.filter((x) => x.id !== id));
//   };

//   const clearCart = () => setItems([]);

//   const totals = useMemo(() => {
//     const subtotal = items.reduce((sum, x) => sum + x.price * x.qty, 0);
//     const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 30;
//     const total = subtotal + deliveryFee;
//     return { subtotal, deliveryFee, total };
//   }, [items]);

//   const value = { items, addToCart, incQty, decQty, removeItem, clearCart, totals };
//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// }

// export function useCart() {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error("useCart must be used inside CartProvider");
//   return ctx;
// }

import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{id, name, price, qty, image}]

  // ➕ Add to cart
  const addToCart = (product) => {
    setItems((prev) => {
      const found = prev.find((x) => x.id === product.id);
      if (found) {
        return prev.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ➕ Increase qty
  const incQty = (id) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x))
    );
  };


  // // ➖ Decrease qty (remove item if qty = 1)
  // const decQty = (id) => {
  //   setItems((prev) =>
  //     prev
  //       .map((x) =>
  //         x.id === id ? { ...x, qty: x.qty - 1 } : x
  //       )
  //       .filter((x) => x.qty > 0) // 🔥 removes when qty becomes 0
  //   );
  // };
  const decQty = (id) => {
  setItems((prev) =>
    prev.map((x) =>
      x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x
    )
  );
};



  // ❌ Remove item completely
  const removeItem = (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  // 🧹 Clear cart
  const clearCart = () => setItems([]);

  // 💰 Totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, x) => sum + x.price * x.qty, 0);
    const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 30;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  }, [items]);

  // ✅ EXPORT BOTH NAMES (IMPORTANT)
  const value = {
    items,
    addToCart,
    incQty,
    decQty,
    removeItem,
    removeFromCart: removeItem, // 🔥 alias (prevents future bugs)
    clearCart,
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
