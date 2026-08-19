import { useEffect, useState } from 'react';
import { getGalleryItems, type GalleryItem } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';

const GallerySection = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-3xl font-heading font-bold text-temple-dark mb-4">Photo Gallery</h2>
          <p className="text-muted-foreground mb-6">Moments from festivals, aarti, and temple events.</p>
        </ScrollReveal>

        {loading && <p className="text-sm text-muted-foreground">Loading gallery…</p>}

        {!loading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Gallery photos will appear here once added by the temple committee.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <ScrollReveal key={item.id}>
              <div className="rounded-lg overflow-hidden border border-border gallery-item smooth-card">
                <div className="overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-2 text-center text-xs text-muted-foreground">
                  {item.title}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;