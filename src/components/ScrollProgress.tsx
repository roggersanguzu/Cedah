"use client";
import { useEffect } from "react";
export default function ScrollProgress() {
  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        String(height > 0 ? scrollY / height : 0),
      );
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);
  return null;
}
