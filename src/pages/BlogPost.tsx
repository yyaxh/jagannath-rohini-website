import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getBlogPost, type BlogPost } from '@/lib/api';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getBlogPost(slug)
      .then(setPost)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-heading font-bold text-temple-dark mb-2">Post not found</h1>
        <Link to="/blog" className="text-primary hover:underline text-sm">
          ← Back to Blog
        </Link>
      </main>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title} — Jagannath Mandir Rohini</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 py-12 anim-fade-up">
        <Link to="/blog" className="text-primary hover:underline text-sm mb-6 inline-block">
          ← Back to Blog
        </Link>
        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="w-full rounded-lg mb-6 aspect-video object-cover" />
        )}
        <h1 className="text-3xl font-heading font-bold text-temple-dark mb-4">{post.title}</h1>
        <div className="prose prose-lg prose-primary max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  className="rounded-xl shadow-lg my-6 w-full max-h-[500px] object-cover"
                  loading="lazy"
                  alt={props.alt || 'Image'}
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table {...props} className="min-w-full divide-y divide-gray-200 border border-gray-200" />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th {...props} className="px-4 py-3 bg-primary text-white text-left text-sm font-semibold" />
              ),
              td: ({ node, ...props }) => (
                <td {...props} className="px-4 py-2 border-t border-gray-200 text-sm" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-l-4 border-primary pl-4" />
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-xl font-semibold text-gray-700 mt-6 mb-3" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc pl-6 space-y-2" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal pl-6 space-y-2" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="text-gray-700" />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="text-gray-700 leading-relaxed mb-4" />
              ),
              strong: ({ node, ...props }) => (
                <strong {...props} className="font-semibold text-gray-800" />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </main>
    </>
  );
}
