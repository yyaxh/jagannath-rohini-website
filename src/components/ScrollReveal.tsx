import { useEffect, useRef, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  /** Extra CSS class applied when visible */
  className?: string;
  /** IntersectionObserver threshold (0-1) — default 0.15 */
  threshold?: number;
  /** Delays stagger children inside a container */
  stagger?: boolean;
}

/**
 * Wraps children in a div that fades + slides up when scrolled into view.
 * Uses IntersectionObserver so there's zero scroll-listener overhead.
 *
 * Usage:
 *   <ScrollReveal><MyCard /></ScrollReveal>
 *   <ScrollReveal stagger>
 *     <Card1 />
 *     <Card2 />
 *     <Card3 />
 *   </ScrollReveal>
 */
export default function ScrollReveal({ children, className = '', threshold = 0.15, stagger = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el); // reveal once, then disconnect
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
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
