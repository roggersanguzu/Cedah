"use client";
import { useEffect } from "react";
export default function ScrollProgress() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        String(height > 0 ? scrollY / height : 0),
      );
    };
    update();
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { update(); frame = 0; }); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => { removeEventListener("scroll", schedule); removeEventListener("resize", schedule); observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return null;
}
