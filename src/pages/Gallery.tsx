import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { getGalleryItems, type GalleryItem } from '@/lib/api';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGalleryItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Gallery — Jagannath Mandir Rohini</title>
        <meta name="description" content="Photos and videos from Jagannath Mandir, Rohini — festivals, aarti, and events." />
      </Helmet>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading font-bold text-temple-dark mb-2">Media Gallery</h1>
        <p className="text-muted-foreground mb-8">Moments from festivals, aarti, and temple events.</p>

        {loading && <p className="text-muted-foreground text-sm">Loading gallery…</p>}

        {!loading && items.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Gallery photos will appear here once added by the temple committee.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg overflow-hidden border border-border group">
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="w-full aspect-square object-cover smooth-img-zoom"
              />
              <p className="text-xs text-muted-foreground px-2 py-1.5 truncate">{item.title}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
