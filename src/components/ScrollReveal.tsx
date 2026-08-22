import { useEffect, useRef, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  stagger?: boolean;
}

/**
 * Wraps children in a div that fades + slides up when scrolled into view.
 * Uses IntersectionObserver — zero scroll-listener overhead.
 * Updated: slower, more graceful reveal (0.8s with luxury easing).
 */
export default function ScrollReveal({ children, className = '', threshold = 0.12, stagger = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`reveal-on-scroll ${stagger ? 'reveal-stagger' : ''} ${className}`}>
      {children}
    </div>
  );
}
