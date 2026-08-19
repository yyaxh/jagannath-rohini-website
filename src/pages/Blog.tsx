import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { getBlogPosts, type BlogPost } from '@/lib/api';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog — Jagannath Mandir Rohini</title>
        <meta name="description" content="Stories, festival explainers, and updates from Jagannath Mandir, Rohini." />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-heading font-bold text-temple-dark mb-2">Blog</h1>
        <p className="text-muted-foreground mb-8">Stories, festival explainers, and temple updates.</p>

        {loading && <p className="text-muted-foreground text-sm">Loading posts…</p>}

        {!loading && posts.length === 0 && (
          <p className="text-muted-foreground text-sm">No blog posts published yet — check back soon.</p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="rounded-lg overflow-hidden border border-border hover:shadow-lg group bg-card smooth-card"
            >
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full aspect-video object-cover smooth-img-zoom"
                />
              )}
              <div className="p-4">
                <h2 className="font-heading font-semibold text-temple-dark mb-1">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
