import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteContent, type BlogCard } from '@/lib/siteContent';
import { getBlogPosts, type BlogPost } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';

// Shown when a blog post has no cover image.
const FALLBACK_IMAGE = '/airo-assets/images/hero/slide-1-rath-yatra.jpg';

const toPlain = (md: string): string => md.replace(/[#*`>_\-\[\]()!]+/g, ' ').replace(/\s+/g, ' ').trim();

export default function BlogSection() {
  const hardcoded = useSiteContent<BlogCard[]>('blog_cards');
  const [latest, setLatest] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    let active = true;
    getBlogPosts()
      .then((posts) => {
        if (active) setLatest(posts.slice(0, 3));
      })
      .catch(() => {
        if (active) setLatest([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Published blog posts (if any) drive the homepage cards — the latest 3
  // appear automatically. When there are none, the built-in cards are shown
  // (admin can still override those via Site Content → Homepage Blog Cards).
  const cards: { title: string; excerpt: string; image: string; href: string; key: string }[] =
    latest && latest.length > 0
      ? latest.map((p) => ({
          key: p.id,
          title: p.title,
          excerpt: (p.excerpt || toPlain(p.content)).slice(0, 180),
          image: p.cover_image || FALLBACK_IMAGE,
          href: `/blog/${p.slug}`,
        }))
      : hardcoded.map((c) => ({ key: c.title, ...c }));

  return (
    <section className="py-12 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
        <div className="text-center mb-4">
          <h2
            className="font-bold text-foreground mb-2"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}
          >
            Discovering the 32 Beshas of Lord Jagannath in Our Weekly Blog Post
          </h2>
          <div className="mx-auto h-1 w-16 rounded bg-primary mb-4" />
          <p className="text-muted-foreground max-w-3xl mx-auto text-sm leading-relaxed">
            Lord Jagannath's abode in Puri is an epitome of an inseparable relationship between the God and humans. Or
            perhaps the oneness of both. One such example is the 32 different Beshas adorned by Lord Jagannath and his
            sibling deities Lord Balabhadra and Devi Subhadra. Besha is a Sanskrit word, which means costume or
            attire…
          </p>
        </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {cards.map((post, i) => (
            <ScrollReveal key={post.key} className={`stagger-${i + 1}`}>
            <div
              className="rounded-xl overflow-hidden shadow-md bg-card border border-border flex flex-col smooth-card"
            >
              <div className="overflow-hidden h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover smooth-img-zoom"
                  loading="lazy"
                  width={400}
                  height={250}
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3
                  className="font-bold text-foreground mb-2 text-base"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{post.excerpt}</p>
                <Link
                  to={post.href}
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
