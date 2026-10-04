"use client";
import { ReactNode, useEffect, useRef } from "react";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !("IntersectionObserver" in window)) {
      node.classList.add("is-visible");
      return;
    }
    // Keep content visible before hydration and without JavaScript. Animate
    // only blocks that begin below the viewport, avoiding a flash of hiding.
    if (node.getBoundingClientRect().top < window.innerHeight) {
      node.classList.add("is-visible");
      return;
    }
    node.classList.add("will-reveal");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -24px" },
    );
    observer.observe(node);
    const showWithoutMotion = () => { if (motion.matches) { node.classList.add("is-visible"); observer.disconnect(); } };
    motion.addEventListener("change", showWithoutMotion);
    return () => { observer.disconnect(); motion.removeEventListener("change", showWithoutMotion); };
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
