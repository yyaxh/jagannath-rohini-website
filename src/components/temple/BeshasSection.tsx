import { Link } from 'react-router-dom';
import { useSiteContent, type BeshaCard } from '@/lib/siteContent';
import ScrollReveal from '@/components/ScrollReveal';

export default function BeshasSection() {
  const beshas = useSiteContent<BeshaCard[]>('beshas');
  return (
    <section className="py-12 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2
              className="font-bold text-foreground mb-2"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '28px' }}
            >
              Beshas of Lord Jagannath
            </h2>
            <div className="mx-auto h-1 w-16 rounded bg-primary" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beshas.map((besha, i) => (
            <ScrollReveal key={besha.title} className={`stagger-${i + 1}`}>
              <div className="flex flex-col sm:flex-row gap-0 bg-card rounded-xl shadow-md overflow-hidden border border-border smooth-card">
                <div className="sm:w-40 shrink-0 h-48 sm:h-auto overflow-hidden">
                  <img
                    src={besha.image}
                    alt={besha.title}
                    className="w-full h-full object-cover smooth-img-zoom"
                    loading="lazy"
                    width={300}
                    height={300}
                  />
                </div>
                <div className="p-5 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-bold text-foreground mb-2 text-base"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {besha.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{besha.excerpt}</p>
                  </div>
                  <Link
                    to={besha.href}
                    className="mt-4 inline-block bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded smooth-btn self-start"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
