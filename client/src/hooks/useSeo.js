import { useEffect } from "react";

/**
 * Lightweight per-page SEO for the SPA.
 * Updates <title> and the meta description on route change
 * (no extra dependency needed).
 */
export default function useSeo({ title, description } = {}) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Healthy Bites`;
    }
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
    // Reset scroll position on navigation for a11y/UX
    window.scrollTo(0, 0);
  }, [title, description]);
}
