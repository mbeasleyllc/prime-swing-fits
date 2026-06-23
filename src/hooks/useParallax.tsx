import { useEffect, useState, RefObject } from "react";

interface ParallaxOptions {
  speed?: number;
  direction?: "up" | "down";
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, direction = "up" } = options;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const multiplier = direction === "up" ? -1 : 1;
      setOffset(scrolled * speed * multiplier);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return offset;
}

export function useParallaxRef(ref: RefObject<HTMLElement>, speed: number = 0.5) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const scrolled = window.scrollY - elementTop;
      setOffset(scrolled * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [ref, speed]);

  return offset;
}