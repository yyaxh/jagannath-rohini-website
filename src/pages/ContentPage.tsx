import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CONTENT_PAGES } from '../content/contentPages';
import { useSiteContent, type ContentPages } from '../lib/siteContent';
import NotFoundPage from './NotFound';

interface ContentPageProps {
  slug?: string;
}

export default function ContentPage({ slug: propSlug }: ContentPageProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  // Admin-saved page overrides win; everything else keeps the built-in content.
  const savedPages = useSiteContent<ContentPages>('content_pages');
  const pages = { ...CONTENT_PAGES, ...(savedPages || {}) };
  const page = pages[slug as string];

  if (!page) return <NotFoundPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 anim-fade-up">
      {/* Hero / Title Section */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {page.title}
        </h1>
        <div className="w-24 h-1 bg-primary rounded-full" />
      </div>

      {/* Content with Markdown */}
      <div className="prose prose-lg prose-primary max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Custom image component with responsive styles
            img: ({ node, ...props }) => (
              <img
                {...props}
                className="rounded-xl shadow-lg my-6 w-full max-h-[500px] object-cover"
                loading="lazy"
                alt={props.alt || 'Image'}
              />
            ),
            // Custom table styling
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
            // Headings with proper styles
            h2: ({ node, ...props }) => (
              <h2 {...props} className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-l-4 border-primary pl-4" />
            ),
            h3: ({ node, ...props }) => (
              <h3 {...props} className="text-xl font-semibold text-gray-700 mt-6 mb-3" />
            ),
            // Lists
            ul: ({ node, ...props }) => (
              <ul {...props} className="list-disc pl-6 space-y-2" />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} className="list-decimal pl-6 space-y-2" />
            ),
            li: ({ node, ...props }) => (
              <li {...props} className="text-gray-700" />
            ),
            // Paragraphs
            p: ({ node, ...props }) => (
              <p {...props} className="text-gray-700 leading-relaxed mb-4" />
            ),
            // Strong / Bold
            strong: ({ node, ...props }) => (
              <strong {...props} className="font-semibold text-gray-800" />
            ),
          }}
        >
          {page.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}