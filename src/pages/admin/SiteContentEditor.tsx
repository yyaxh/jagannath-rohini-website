import { useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import {
  DEFAULT_SITE_CONTENT,
  type HeroSlide,
  type BlogCard,
  type BeshaCard,
  type FooterContent,
  type HeaderContact,
  type ContentPages,
} from '../../lib/siteContent';
import { CONTENT_PAGES } from '../../content/contentPages';

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm';
const textareaCls = inputCls + ' resize-none';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/40 rounded-lg hover:bg-primary/10 transition"
    >
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition self-end"
      title="Remove"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

interface EditorProps {
  value: unknown;
  busy: boolean;
  onSave: (blockKey: string, value: unknown) => void;
  onReset: (blockKey: string) => void;
}

/* ------------------------------- Content Pages --------------------------- */

function PagesEditor({ value, busy, onSave, onReset }: EditorProps) {
  const saved = (value && typeof value === 'object' ? value : {}) as ContentPages;
  const merged = { ...CONTENT_PAGES, ...saved };
  const keys = Object.keys(merged);
  const [pages, setPages] = useState<ContentPages>({ ...merged });
  const [pageKey, setPageKey] = useState<string>(keys[0] || '');

  const page = pages[pageKey] || { title: '', content: '' };
  const setField = (patch: Partial<{ title: string; content: string }>) =>
    setPages((p) => ({ ...p, [pageKey]: { ...(p[pageKey] || { title: '', content: '' }), ...patch } }));

  const handleSave = () => {
    const changed: ContentPages = {};
    for (const k of Object.keys(pages)) {
      const cur = pages[k];
      const def = CONTENT_PAGES[k];
      if (!def || def.title !== cur.title || def.content !== cur.content) {
        changed[k] = { title: cur.title, content: cur.content };
      }
    }
    onSave('content_pages', changed);
  };

  return (
    <div className="space-y-3">
      <div>
        <FieldLabel>Page</FieldLabel>
        <select className={inputCls} value={pageKey} onChange={(e) => setPageKey(e.target.value)}>
          {keys.map((k) => (
            <option key={k} value={k}>
              {merged[k]?.title || k}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Select a page, edit its text, then click “Save changes”. Only pages you actually change are
          saved — the rest keep their built-in content.
        </p>
      </div>
      <div>
        <FieldLabel>Page Title</FieldLabel>
        <input className={inputCls} value={page.title} onChange={(e) => setField({ title: e.target.value })} />
      </div>
      <div>
        <FieldLabel>Page Content (plain text — headings with #, **bold**, - lists, links work)</FieldLabel>
        <textarea
          className={textareaCls}
          rows={16}
          value={page.content}
          onChange={(e) => setField({ content: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleSave} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition">
          Save changes
        </button>
        <button type="button" onClick={() => onReset('content_pages')} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition">
          <RotateCcw className="w-3.5 h-3.5" /> Reset all pages to default
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- Footer -------------------------------- */

function FooterEditor({ value, busy, onSave, onReset }: EditorProps) {
  const def = DEFAULT_SITE_CONTENT.footer as FooterContent;
  const [form, setForm] = useState<FooterContent>({ ...def, ...((value as FooterContent) || {}) });
  const set = (k: keyof FooterContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-3">
      <div>
        <FieldLabel>Mailing Address</FieldLabel>
        <input className={inputCls} value={form.address} onChange={set('address')} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Email (main)</FieldLabel>
          <input className={inputCls} value={form.email} onChange={set('email')} />
        </div>
        <div>
          <FieldLabel>Email (secondary)</FieldLabel>
          <input className={inputCls} value={form.email2} onChange={set('email2')} />
        </div>
        <div>
          <FieldLabel>Prasad Booking Phone</FieldLabel>
          <input className={inputCls} value={form.prasadPhone} onChange={set('prasadPhone')} />
        </div>
        <div>
          <FieldLabel>Phone 1</FieldLabel>
          <input className={inputCls} value={form.phone1} onChange={set('phone1')} />
        </div>
        <div>
          <FieldLabel>Phone 2</FieldLabel>
          <input className={inputCls} value={form.phone2} onChange={set('phone2')} />
        </div>
      </div>
      <div>
        <FieldLabel>Notice Bar (bottom of every page)</FieldLabel>
        <textarea className={textareaCls} rows={4} value={form.notice} onChange={set('notice')} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => onSave('footer', form)} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition">
          Save changes
        </button>
        <button type="button" onClick={() => onReset('footer')} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition">
          <RotateCcw className="w-3.5 h-3.5" /> Reset to default
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Header Contact --------------------------- */

function HeaderContactEditor({ value, busy, onSave, onReset }: EditorProps) {
  const def = DEFAULT_SITE_CONTENT.header_contact as HeaderContact;
  const [form, setForm] = useState<HeaderContact>({ ...def, ...((value as HeaderContact) || {}) });

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>Phone (shown in header, all pages)</FieldLabel>
          <input className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <FieldLabel>Email (shown in header, homepage only)</FieldLabel>
          <input className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => onSave('header_contact', form)} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition">
          Save changes
        </button>
        <button type="button" onClick={() => onReset('header_contact')} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition">
          <RotateCcw className="w-3.5 h-3.5" /> Reset to default
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Hero Slides ----------------------------- */

function HeroSlidesEditor({ value, busy, onSave, onReset }: EditorProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(Array.isArray(value) ? (value as HeroSlide[]) : []);
  const update = (i: number, patch: Partial<HeroSlide>) =>
    setSlides((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const updateCta = (i: number, patch: Partial<{ label: string; href: string }>) =>
    setSlides((s) => s.map((it, idx) => (idx === i ? { ...it, cta: { label: '', href: '', ...it.cta, ...patch } } : it)));

  return (
    <div className="space-y-4">
      {slides.map((slide, i) => (
        <div key={slide.id ?? i} className="border border-border rounded-lg p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Slide {i + 1}</p>
            <RemoveButton onClick={() => setSlides((s) => s.filter((_, idx) => idx !== i))} />
          </div>
          <div>
            <FieldLabel>Image URL</FieldLabel>
            <input className={inputCls} value={slide.image || ''} onChange={(e) => update(i, { image: e.target.value })} placeholder="/airo-assets/images/hero/…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Headline</FieldLabel>
              <input className={inputCls} value={slide.headline || ''} onChange={(e) => update(i, { headline: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Location Line</FieldLabel>
              <input className={inputCls} value={slide.location || ''} onChange={(e) => update(i, { location: e.target.value })} />
            </div>
          </div>
          <div>
            <FieldLabel>Subtext</FieldLabel>
            <input className={inputCls} value={slide.subtext || ''} onChange={(e) => update(i, { subtext: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Button Text (optional)</FieldLabel>
              <input className={inputCls} value={slide.cta?.label || ''} onChange={(e) => updateCta(i, { label: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Button Link (optional)</FieldLabel>
              <input className={inputCls} value={slide.cta?.href || ''} onChange={(e) => updateCta(i, { href: e.target.value })} placeholder="/prasad-booking" />
            </div>
          </div>
        </div>
      ))}
      <AddButton onClick={() => setSlides((s) => [...s, { id: Date.now(), image: '' }])} label="Add slide" />
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" onClick={() => onSave('hero_slides', slides)} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition">
          Save changes
        </button>
        <button type="button" onClick={() => onReset('hero_slides')} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition">
          <RotateCcw className="w-3.5 h-3.5" /> Reset to default
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- Featured Videos ---------------------------- */

function VideosEditor({ value, busy, onSave, onReset }: EditorProps) {
  const [videos, setVideos] = useState<string[]>(Array.isArray(value) ? (value as string[]) : []);

  return (
    <div className="space-y-3">
      {videos.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={inputCls}
            value={v}
            onChange={(e) => setVideos((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
            placeholder="https://www.youtube.com/embed/…"
          />
          <RemoveButton onClick={() => setVideos((arr) => arr.filter((_, idx) => idx !== i))} />
        </div>
      ))}
      <AddButton onClick={() => setVideos((arr) => [...arr, ''])} label="Add video" />
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" onClick={() => onSave('featured_videos', videos)} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition">
          Save changes
        </button>
        <button type="button" onClick={() => onReset('featured_videos')} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition">
          <RotateCcw className="w-3.5 h-3.5" /> Reset to default
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Blog Cards / Beshas ------------------------- */

function CardListEditor({ blockKey, value, busy, onSave, onReset }: EditorProps & { blockKey: string }) {
  const [cards, setCards] = useState<(BlogCard | BeshaCard)[]>(Array.isArray(value) ? (value as (BlogCard | BeshaCard)[]) : []);
  const update = (i: number, patch: Partial<BlogCard>) =>
    setCards((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <div className="space-y-4">
      {cards.map((card, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Card {i + 1}</p>
            <RemoveButton onClick={() => setCards((s) => s.filter((_, idx) => idx !== i))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Title</FieldLabel>
              <input className={inputCls} value={card.title} onChange={(e) => update(i, { title: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Image URL</FieldLabel>
              <input className={inputCls} value={card.image} onChange={(e) => update(i, { image: e.target.value })} />
            </div>
          </div>
          <div>
            <FieldLabel>Link (page this card opens)</FieldLabel>
            <input className={inputCls} value={card.href} onChange={(e) => update(i, { href: e.target.value })} placeholder="/blog/…" />
          </div>
          <div>
            <FieldLabel>Text</FieldLabel>
            <textarea className={textareaCls} rows={3} value={card.excerpt} onChange={(e) => update(i, { excerpt: e.target.value })} />
          </div>
        </div>
      ))}
      <AddButton onClick={() => setCards((s) => [...s, { title: '', excerpt: '', image: '', href: '' }])} label="Add card" />
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" onClick={() => onSave(blockKey, cards)} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition">
          Save changes
        </button>
        <button type="button" onClick={() => onReset(blockKey)} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition">
          <RotateCcw className="w-3.5 h-3.5" /> Reset to default
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- Entry --------------------------------- */

export default function SiteContentEditor(props: EditorProps & { blockKey: string; value: unknown }) {
  const { blockKey } = props;
  switch (blockKey) {
    case 'content_pages':
      return <PagesEditor {...props} />;
    case 'footer':
      return <FooterEditor {...props} />;
    case 'header_contact':
      return <HeaderContactEditor {...props} />;
    case 'hero_slides':
      return <HeroSlidesEditor {...props} />;
    case 'featured_videos':
      return <VideosEditor {...props} />;
    case 'blog_cards':
    case 'beshas':
      return <CardListEditor {...props} />;
    default:
      return <p className="text-sm text-muted-foreground">No editor available for this block.</p>;
  }
}
