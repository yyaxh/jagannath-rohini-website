import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Image, Megaphone, FileText, Video, LogOut,
  Plus, Trash2, RefreshCw, ChevronDown, ChevronUp, CheckCircle, Upload, Eye,
  Palette, ChevronRight, Phone, Mail, MapPin, User, BadgeCheck, FileDown, Edit2,
  FileCode2,
} from 'lucide-react';
import {
  adminLogout, deleteAnnouncement, deleteBlogPost, deleteDocument, deleteGalleryItem,
  getAnnouncements, getBlogPosts, getDainikSubmissions, getDocuments, getGalleryItems,
  getSiteSettings, getSiteContent, getSocietySubmissions, createAnnouncement, createBlogPost,
  updateBlogPost, updateSiteContent, uploadDocument, uploadGalleryItem, updateSiteSettings, uploadLogo,
  type Announcement, type BlogPost, type DocumentItem, type GalleryItem,
  type SiteSettings, type SocietyMembershipRow, type DainikSewaRow,
} from '../../lib/api';
import { DEFAULT_SITE_CONTENT, CONTENT_BLOCK_LABELS, refreshSiteContent } from '../../lib/siteContent';
import SiteContentEditor from './SiteContentEditor';

type Tab = 'membership' | 'seva' | 'gallery' | 'announcements' | 'documents' | 'live' | 'branding' | 'blog' | 'content';

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'membership', label: 'Membership', icon: BadgeCheck },
  { id: 'seva', label: 'Seva', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'live', label: 'Live & Timings', icon: Video },
  { id: 'branding', label: 'Logo & Branding', icon: Palette },
  { id: 'blog', label: 'Blog', icon: Megaphone },
  { id: 'content', label: 'Site Content', icon: FileCode2 },
];

function SectionCard({ title, badge, children, delay = 0 }: { title: string; badge?: string; children: React.ReactNode; delay?: number }) {
  return (
    <div className="admin-card anim-fade-up bg-white rounded-xl border border-border shadow-sm overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
        <h3 className="font-semibold text-temple-dark">{title}</h3>
        {badge && <span className="ml-auto text-xs font-medium bg-primary/15 text-primary-foreground text-temple-dark px-2.5 py-1 rounded-full">{badge}</span>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function Field({ label, value }: { label: string; value?: unknown }) {
  if (value === null || value === undefined || value === '' || value === false) return null;
  return (
    <div className="anim-fade-in">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</p>
    </div>
  );
}

function PhotoThumb({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <a
      href={`/api/uploads/${name}`}
      target="_blank"
      rel="noreferrer"
      className="group block w-24 h-24 rounded-lg border border-border overflow-hidden bg-gray-100 anim-pop"
      title={`Open ${name}`}
    >
      <img src={`/api/uploads/${name}`} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
    </a>
  );
}

function PhotosBlock({ photo, spousePhoto, panDoc, aadhaarDoc, signature }: { photo?: string; spousePhoto?: string; panDoc?: string; aadhaarDoc?: string; signature?: string }) {
  const items = [
    { n: photo, l: 'Photo' },
    { n: spousePhoto, l: 'Spouse Photo' },
    { n: panDoc, l: 'PAN Document' },
    { n: aadhaarDoc, l: 'Aadhaar Document' },
    { n: signature, l: 'Signature' },
  ].filter((x) => x.n);
  if (!items.length) return null;
  return (
    <div className="anim-fade-up">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Uploaded Documents</p>
      <div className="flex flex-wrap gap-3">
        {items.map((it) => (
          <div key={it.l}>
            <PhotoThumb name={it.n} />
            <p className="text-[10px] text-muted-foreground mt-1 text-center">{it.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="anim-slide-in">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-primary font-semibold mb-2">
        {icon}{title}
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

function SocietyDetail({ row }: { row: SocietyMembershipRow }) {
  return (
    <div className="space-y-5">
      <DetailPanel title="Personal Details" icon={<User className="w-3.5 h-3.5" />}>
        <Field label="Full Name" value={row.name} />
        <Field label="Father / Husband" value={row.father_husband_name} />
        <Field label="Gotra" value={row.gotra} />
        <Field label="Date of Birth" value={row.dob} />
        <Field label="Blood Group" value={row.blood_group} />
        <Field label="Occupation" value={row.occupation_designation} />
      </DetailPanel>
      <DetailPanel title="Contact" icon={<Phone className="w-3.5 h-3.5" />}>
        <Field label="Mobile" value={row.mobile} />
        <Field label="Email" value={row.email} />
        <Field label="Residence Phone" value={row.residence_telephone} />
        <Field label="Office Phone" value={row.office_telephone} />
        <Field label="Fax" value={row.fax} />
        <Field label="Residence Address" value={row.residence_address} />
        <Field label="Office Address" value={row.office_address} />
      </DetailPanel>
      <DetailPanel title="Membership" icon={<BadgeCheck className="w-3.5 h-3.5" />}>
        <Field label="Membership Type" value={row.membership_type} />
        <Field label="Membership Amount" value={row.membership_amount ? `₹${Number(row.membership_amount).toLocaleString('en-IN')}` : undefined} />
        <Field label="Payment Method" value={row.payment_method} />
        <Field label="Payment Status" value={row.payment_status} />
        <Field label="Cheque / DD No" value={row.cheque_dd_number} />
        <Field label="Bank Drawn On" value={row.bank_drawn_on} />
        <Field label="Payment Date" value={row.payment_date} />
        <Field label="Transaction Ref" value={row.transaction_ref} />
        <Field label="Amount in Words" value={row.amount_in_words} />
      </DetailPanel>
      <DetailPanel title="Introducer & Others">
        <Field label="Introducing Member" value={row.introducing_member_name} />
        <Field label="Introducer Mobile" value={row.introducing_member_mobile} />
        <Field label="PAN" value={row.pan} />
        <Field label="Place" value={row.place} />
        <Field label="Terms Accepted" value={row.terms_accepted} />
        <Field label="Submitted" value={row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : undefined} />
      </DetailPanel>
      <PhotosBlock
        photo={row.member_photo as string}
        spousePhoto={row.spouse_photo as string}
        panDoc={row.pan_document as string}
        aadhaarDoc={row.aadhaar_document as string}
        signature={row.member_signature as string}
      />
    </div>
  );
}

function DainikDetail({ row }: { row: DainikSewaRow }) {
  return (
    <div className="space-y-5">
      <DetailPanel title="Personal Details" icon={<User className="w-3.5 h-3.5" />}>
        <Field label="Full Name" value={row.name} />
        <Field label="Gotra" value={row.gotra} />
        <Field label="Father Name" value={row.father_name} />
        <Field label="Spouse Name" value={row.spouse_name} />
        <Field label="Self Profession" value={row.self_profession} />
        <Field label="Spouse Profession" value={row.spouse_profession} />
        <Field label="Self DOB" value={row.self_dob} />
        <Field label="Spouse DOB" value={row.spouse_dob} />
        <Field label="Marriage Anniversary" value={row.marriage_anniversary} />
        <Field label="Self Blood Group" value={row.self_blood_group} />
        <Field label="Spouse Blood Group" value={row.spouse_blood_group} />
      </DetailPanel>
      <DetailPanel title="Contact & Addresses" icon={<Phone className="w-3.5 h-3.5" />}>
        <Field label="Mobile" value={row.mobile} />
        <Field label="Email" value={row.email} />
        <Field label="Office Phone" value={row.office_telephone} />
        <Field label="Residence Phone" value={row.residence_telephone} />
        <Field label="Residence Address" value={row.residence_address} />
        <Field label="Office Address" value={row.office_address} />
      </DetailPanel>
      <DetailPanel title="Children">
        <Field label="Child 1" value={row.child1_name ? `${row.child1_name}${row.child1_birthday ? ` (${row.child1_birthday})` : ''}` : undefined} />
        <Field label="Child 2" value={row.child2_name ? `${row.child2_name}${row.child2_birthday ? ` (${row.child2_birthday})` : ''}` : undefined} />
        <Field label="Child 3" value={row.child3_name ? `${row.child3_name}${row.child3_birthday ? ` (${row.child3_birthday})` : ''}` : undefined} />
      </DetailPanel>
      <DetailPanel title="Dainik Sewa Details">
        <Field label="Temple Contribution" value={row.temple_contribution} />
        <Field label="One Time Amount" value={row.one_time_amount ? `₹${Number(row.one_time_amount).toLocaleString('en-IN')}` : undefined} />
        <Field label="Payment Method" value={row.payment_method} />
        <Field label="Payment Status" value={row.payment_status} />
        <Field label="Cheque / DD No" value={row.cheque_dd_number} />
        <Field label="Bank Drawn On" value={row.bank_drawn_on} />
        <Field label="Payment Date" value={row.payment_date} />
        <Field label="Transaction Ref" value={row.transaction_ref} />
        <Field label="Amount in Words" value={row.amount_in_words} />
      </DetailPanel>
      <DetailPanel title="Recurring / Consent">
        <Field label="Recurring Consent" value={row.recurring_consent} />
        <Field label="Auto Payment Consent" value={row.auto_payment_consent} />
        <Field label="Recurring Method" value={row.recurring_payment_method} />
        <Field label="Recurring Start Date" value={row.recurring_start_date} />
        <Field label="Recurring Ref ID" value={row.recurring_ref_id} />
        <Field label="Consent Given" value={row.consent} />
        <Field label="Place" value={row.place} />
        <Field label="Submitted" value={row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : undefined} />
      </DetailPanel>
      <PhotosBlock
        photo={row.photo as string}
        signature={row.applicant_signature as string}
      />
    </div>
  );
}

function SubTable({ rows, columns, detail }: { rows: (SocietyMembershipRow | DainikSewaRow)[]; columns: { key: string; label: string }[]; detail: (r: any) => React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!rows.length) {
    return (
      <div className="py-10 text-center anim-fade-in">
        <p className="text-sm text-muted-foreground">No submissions yet. Once someone fills the form, it appears here.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b">
            {columns.map((c) => (
              <th key={c.key} className="py-2.5 pr-4 font-semibold">{c.label}</th>
            ))}
            <th className="py-2.5 font-semibold">Status</th>
            <th className="py-2.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const open = openId === String(r.id);
            return (
              <FragmentRow
                key={String(r.id)}
                row={r}
                columns={columns}
                open={open}
                index={i}
                detail={detail}
                onToggle={() => setOpenId(open ? null : String(r.id))}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({ row, columns, open, index, detail, onToggle }: { row: any; columns: { key: string; label: string }[]; open: boolean; index: number; detail: (r: any) => React.ReactNode; onToggle: () => void }) {
  const status = row.payment_status || row.status || '—';
  const statusOk = String(status).toLowerCase() === 'paid' || String(status).toLowerCase() === 'completed';
  return (
    <>
      <tr
        className="admin-row border-b cursor-pointer anim-fade-up"
        style={{ animationDelay: `${index * 40}ms` }}
        onClick={onToggle}
      >
        {columns.map((c) => (
          <td key={c.key} className="py-3 pr-4 text-gray-800">{String(row[c.key] ?? '—')}</td>
        ))}
        <td className="py-3 pr-4">
          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusOk ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {status}
          </span>
        </td>
        <td className="py-3">
          <span className={`inline-flex items-center gap-1 text-primary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </span>
        </td>
      </tr>
      {open && (
        <tr className="border-b bg-gradient-to-b from-gray-50/80 to-white">
          <td colSpan={columns.length + 2} className="py-5 px-5">
            {detail(row)}
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('membership');
  const [loading, setLoading] = useState(true);

  // submissions
  const [society, setSociety] = useState<SocietyMembershipRow[]>([]);
  const [dainik, setDainik] = useState<DainikSewaRow[]>([]);

  // gallery
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [gTitle, setGTitle] = useState('');
  const [gCategory, setGCategory] = useState('general');
  const [gFile, setGFile] = useState<File | null>(null);

  // announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [aTitle, setATitle] = useState('');
  const [aBody, setABody] = useState('');
  const [aActive, setAActive] = useState(true);

  // documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [dTitle, setDTitle] = useState('');
  const [dCategory, setDCategory] = useState('government');
  const [dFile, setDFile] = useState<File | null>(null);

  // blog
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCover, setBlogCover] = useState('');
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);

  // live & timings
  const [settings, setSettings] = useState<SiteSettings>({
    live_stream: '', timings: [], festivals: [], under_construction: false, donate_banner: '', logo_url: '',
  });
  const [liveInput, setLiveInput] = useState('');
  const [timingsInput, setTimingsInput] = useState('');
  const [festivalsInput, setFestivalsInput] = useState('');

  // branding / logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');

  // site content (the site ships with hardcoded defaults; admin can override
  // any block here and the public pages pick it up)
  const [contentBlockKey, setContentBlockKey] = useState<string>('content_pages');
  const [savedContent, setSavedContent] = useState<Record<string, unknown>>({});

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const refreshSubmissions = useCallback(async () => {
    let unauthenticated = false;
    const safe = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        return await fn();
      } catch (err: any) {
        if (err?.status === 401) unauthenticated = true;
        return null;
      }
    };
    const [s, d] = await Promise.all([safe(getSocietySubmissions), safe(getDainikSubmissions)]);
    if (unauthenticated) {
      navigate('/admin/login', { replace: true });
      return;
    }
    setSociety((s as SocietyMembershipRow[]) || []);
    setDainik((d as DainikSewaRow[]) || []);
  }, [navigate]);

  const refreshGallery = useCallback(async () => {
    try { setGallery(await getGalleryItems()); } catch { /* ignore */ }
  }, []);

  const refreshAnnouncements = useCallback(async () => {
    try { setAnnouncements(await getAnnouncements()); } catch { /* ignore */ }
  }, []);

  const refreshDocuments = useCallback(async () => {
    try { setDocuments(await getDocuments()); } catch { /* ignore */ }
  }, []);

  const fetchBlogPosts = useCallback(async () => {
    try { setBlogPosts(await getBlogPosts()); } catch { /* ignore */ }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const s = await getSiteSettings();
      setSettings(s);
      setLogoUrl(s.logo_url || '');
      setLiveInput(s.live_stream || '');
      setTimingsInput((s.timings || []).map((t) => `${t.name}\t${t.time}`).join('\n'));
      setFestivalsInput((s.festivals || []).map((f) => `${f.name}\t${f.date}`).join('\n'));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([
        refreshSubmissions(), refreshGallery(), refreshAnnouncements(), refreshDocuments(), refreshSettings(), fetchBlogPosts(),
      ]);
      setLoading(false);
    })();
  }, [refreshSubmissions, refreshGallery, refreshAnnouncements, refreshDocuments, refreshSettings, fetchBlogPosts]);

  // Load current site content overrides (blocks the admin has saved). Any
  // block missing here falls back to the built-in default on the public site.
  useEffect(() => {
    (async () => {
      let saved: Record<string, unknown> = {};
      try {
        saved = await getSiteContent();
      } catch {
        // backend down — fall back to pure defaults below
      }
      setSavedContent(saved || {});
    })();
  }, []);

  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gFile) return alert('Please choose an image');
    setBusy(true);
    try {
      await uploadGalleryItem(gTitle || 'Gallery Photo', gCategory, gFile);
      setGTitle(''); setGFile(null);
      await refreshGallery();
      flash('Photo uploaded');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim()) return alert('Title is required');
    setBusy(true);
    try {
      await createAnnouncement({ title: aTitle, body: aBody || undefined, active: aActive });
      setATitle(''); setABody(''); setAActive(true);
      await refreshAnnouncements();
      flash('Announcement added');
    } catch (err: any) {
      alert(err.message || 'Failed to add announcement');
    } finally {
      setBusy(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dFile) return alert('Please choose a PDF');
    if (!dTitle.trim()) return alert('Title is required');
    setBusy(true);
    try {
      await uploadDocument(dTitle, dCategory, dFile);
      setDTitle(''); setDFile(null);
      await refreshDocuments();
      flash('Document uploaded');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleUploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return alert('Please choose a logo image');
    setBusy(true);
    try {
      const res = await uploadLogo(logoFile);
      setLogoUrl(res.logo_url);
      setLogoFile(null);
      flash('Logo updated — it will appear on the site immediately');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const s = await updateSiteSettings({ live_stream: liveInput.trim() });
      setSettings(s);
      flash('Live stream saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const parsePairs = (raw: string, valueKey: 'time' | 'date') =>
    raw.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const [name, ...rest] = l.split('\t');
      return { name: name || '', [valueKey]: rest.join('\t') || '' } as { name: string } & Record<'time' | 'date', string>;
    }).filter((x) => x.name);

  const slugify = (s: string): string =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

  const handleSaveTimings = async () => {
    setBusy(true);
    try {
      const s = await updateSiteSettings({ timings: parsePairs(timingsInput, 'time') });
      setSettings(s);
      flash('Timings saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveFestivals = async () => {
    setBusy(true);
    try {
      const s = await updateSiteSettings({ festivals: parsePairs(festivalsInput, 'date') });
      setSettings(s);
      flash('Festival calendar saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleUnderConstruction = async () => {
    setBusy(true);
    try {
      const s = await updateSiteSettings({ under_construction: !settings.under_construction });
      setSettings(s);
      flash('Saved');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveContentBlock = async (key: string, value: unknown) => {
    setBusy(true);
    try {
      await updateSiteContent({ [key]: value });
      await refreshSiteContent();
      setSavedContent((s) => ({ ...s, [key]: value }));
      flash(`Saved: ${CONTENT_BLOCK_LABELS[key]}`);
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleResetContentBlock = async (key: string) => {
    if (!confirm(`Reset "${CONTENT_BLOCK_LABELS[key]}" to its default content?`)) return;
    setBusy(true);
    try {
      await updateSiteContent({ [key]: null });
      await refreshSiteContent();
      setSavedContent((s) => {
        const next = { ...s };
        delete next[key];
        return next;
      });
      flash(`Reset to default: ${CONTENT_BLOCK_LABELS[key]}`);
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try { await adminLogout(); } catch { /* ignore */ }
    navigate('/admin/login', { replace: true });
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm';
  const textareaCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm resize-none';
  const fileBtnCls = 'inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg disabled:opacity-50 transition hover:scale-[1.02] active:scale-[0.98]';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground anim-fade-in">Loading admin panel…</p>
      </div>
    );
  }

  const societyColumns = [
    { key: 'name', label: 'Name' },
    { key: 'membership_type', label: 'Type' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
  ];
  const dainikColumns = [
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-temple-dark text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            <h1 className="font-bold">Jagannath Mandir — Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshSubmissions}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2 flex flex-wrap gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-sm rounded-t-lg flex items-center gap-1.5 transition-all duration-200 ${
                  tab === t.id ? 'bg-gray-50 text-temple-dark font-medium' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {notice && (
          <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 anim-fade-up">
            <CheckCircle className="w-4 h-4" /> {notice}
          </div>
        )}

        {tab === 'membership' && (
          <div className="space-y-6">
            <SectionCard title="Society Membership Applications" badge={`${society.length} total`}>
              <SubTable rows={society} columns={societyColumns} detail={(r) => <SocietyDetail row={r} />} />
            </SectionCard>
            <p className="text-xs text-muted-foreground anim-fade-in">
              Tap any row to view the full application including uploaded documents.
            </p>
          </div>
        )}

        {tab === 'seva' && (
          <div className="space-y-6">
            <SectionCard title="Dainik Sewa Applications" badge={`${dainik.length} total`}>
              <SubTable rows={dainik} columns={dainikColumns} detail={(r) => <DainikDetail row={r} />} />
            </SectionCard>
            <p className="text-xs text-muted-foreground anim-fade-in">
              Tap any row to view the full application including uploaded documents.
            </p>
          </div>
        )}

        {tab === 'gallery' && (
          <div className="space-y-6">
            <SectionCard title="Upload Photo">
              <form onSubmit={handleUploadGallery} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input className={inputCls} value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="e.g. Rath Yatra 2026" />
                  </div>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <input className={inputCls} value={gCategory} onChange={(e) => setGCategory(e.target.value)} placeholder="general / festival / aarti" />
                  </div>
                </div>
                <div>
                  <FieldLabel>Image (JPG/PNG/GIF/WebP)</FieldLabel>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setGFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                  />
                  {gFile && <p className="text-xs text-green-600 mt-1">Selected: {gFile.name}</p>}
                </div>
                <button type="submit" disabled={busy} className={fileBtnCls}>
                  <Upload className="w-4 h-4" /> Upload
                </button>
              </form>
            </SectionCard>
            <SectionCard title={`Gallery`} badge={`${gallery.length} photos`} delay={80}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((g, i) => (
                  <div key={g.id} className="relative group rounded-lg overflow-hidden border border-border anim-fade-up admin-card" style={{ animationDelay: `${i * 50}ms` }}>
                    <img src={g.image_url} alt={g.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={async () => { if (confirm('Delete this photo?')) { await deleteGalleryItem(g.id); refreshGallery(); } }}
                        className="p-2 bg-red-600 rounded-full text-white hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs px-2 py-1 truncate">{g.title}</p>
                  </div>
                ))}
              </div>
              {gallery.length === 0 && <p className="text-sm text-muted-foreground">No photos yet.</p>}
            </SectionCard>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="space-y-6">
            <SectionCard title="Add Announcement">
              <form onSubmit={handleAddAnnouncement} className="space-y-3">
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputCls} value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="e.g. Rath Yatra 2026 — 16 July" required />
                </div>
                <div>
                  <FieldLabel>Body</FieldLabel>
                  <textarea className={inputCls} rows={3} value={aBody} onChange={(e) => setABody(e.target.value)} placeholder="Announcement details…" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={aActive} onChange={(e) => setAActive(e.target.checked)} className="accent-primary" />
                  Show on homepage
                </label>
                <button type="submit" disabled={busy} className={fileBtnCls}>
                  <Plus className="w-4 h-4" /> Add Announcement
                </button>
              </form>
            </SectionCard>
            <SectionCard title={`Announcements`} badge={`${announcements.length} total`} delay={80}>
              <ul className="divide-y divide-border">
                {announcements.map((a, i) => (
                  <li key={a.id} className="py-3 flex items-start justify-between gap-3 anim-fade-up admin-row rounded px-1" style={{ animationDelay: `${i * 40}ms` }}>
                    <div>
                      <p className="font-medium text-gray-800">{a.title}</p>
                      {a.body && <p className="text-sm text-muted-foreground mt-0.5">{a.body}</p>}
                      {a.active && <span className="inline-block mt-1 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Live</span>}
                    </div>
                    <button
                      onClick={async () => { if (confirm('Delete this announcement?')) { await deleteAnnouncement(a.id); refreshAnnouncements(); } }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
            </SectionCard>
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-6">
            <SectionCard title="Upload Document (Government/Trust PDF)">
              <form onSubmit={handleUploadDocument} className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input className={inputCls} value={dTitle} onChange={(e) => setDTitle(e.target.value)} placeholder="e.g. Society Registration Certificate" required />
                  </div>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <input className={inputCls} value={dCategory} onChange={(e) => setDCategory(e.target.value)} placeholder="government / trust / receipt" />
                  </div>
                </div>
                <div>
                  <FieldLabel>PDF file</FieldLabel>
                  <input
                    type="file" accept=".pdf,application/pdf"
                    onChange={(e) => setDFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                  />
                  {dFile && <p className="text-xs text-green-600 mt-1">Selected: {dFile.name}</p>}
                </div>
                <button type="submit" disabled={busy} className={fileBtnCls}>
                  <Upload className="w-4 h-4" /> Upload Document
                </button>
              </form>
            </SectionCard>
            <SectionCard title={`Documents`} badge={`${documents.length} total`} delay={80}>
              <ul className="divide-y divide-border">
                {documents.map((d, i) => (
                  <li key={d.id} className="py-3 flex items-center justify-between gap-3 anim-fade-up admin-row rounded px-1" style={{ animationDelay: `${i * 40}ms` }}>
                    <div>
                      <p className="font-medium text-gray-800">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.category} · {d.original_name || ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.file_url && (
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-primary hover:bg-primary/10 rounded transition" title="View">
                          <FileDown className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={async () => { if (confirm('Delete this document?')) { await deleteDocument(d.id); refreshDocuments(); } }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {documents.length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}
            </SectionCard>
          </div>
        )}

        {tab === 'blog' && (
          <div className="space-y-6">
            <SectionCard title="Manage Blog Posts" delay={80}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputCls} value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog post title" />
                  <FieldLabel>Slug (e.g. festival-update)</FieldLabel>
                  <input className={inputCls} value={blogSlug} onChange={(e) => setBlogSlug(e.target.value)} placeholder="festival-update" />
                </div>
                <FieldLabel>Excerpt (optional)</FieldLabel>
                <textarea className={inputCls} rows={3} value={blogExcerpt} onChange={(e) => setBlogExcerpt(e.target.value)} placeholder="Short summary..." />
                <FieldLabel>Content</FieldLabel>
                <textarea className={textareaCls} rows={6} value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Blog post content..."></textarea>
                <FieldLabel>Cover Image URL (optional)</FieldLabel>
                <input className={inputCls} value={blogCover} onChange={(e) => setBlogCover(e.target.value)} placeholder="https://example.com/image.jpg" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!blogTitle.trim()) return alert('Title is required');
                    const slug = blogSlug.trim() || slugify(blogTitle);
                    if (slug.length < 3) return alert('Slug must be at least 3 characters (letters, numbers, hyphens)');
                    await createBlogPost({ title: blogTitle, slug, excerpt: blogExcerpt, content: blogContent, cover_image: blogCover, published: true });
                    fetchBlogPosts();
                    setBlogTitle(''); setBlogSlug(''); setBlogExcerpt(''); setBlogContent(''); setBlogCover('');
                    setCurrentBlogId(null);
                    flash('Blog post created');
                  }}
                  disabled={busy}
                  className={fileBtnCls}
                >
                  Publish
                </button>
                <button
                  onClick={async () => {
                    if (!currentBlogId) return alert('Select a post to update');
                    if (!blogTitle.trim()) return alert('Title is required');
                    const slug = blogSlug.trim() || slugify(blogTitle);
                    await updateBlogPost(currentBlogId, { title: blogTitle, slug, excerpt: blogExcerpt, content: blogContent, cover_image: blogCover, published: true });
                    fetchBlogPosts();
                    setBlogTitle(''); setBlogSlug(''); setBlogExcerpt(''); setBlogContent(''); setBlogCover('');
                    setCurrentBlogId(null);
                    flash('Blog post updated');
                  }}
                  disabled={busy}
                  className={fileBtnCls}
                >
                  Update
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Leave slug empty to auto-generate from the title. Posts go live on the blog immediately.</p>
            </SectionCard>

            <SectionCard title={`Blog Posts (${blogPosts.length})`} badge={`${blogPosts.length} total`} delay={120}>
              <ul className="divide-y divide-border">
                {blogPosts.map((p, i) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-3 anim-fade-up admin-row rounded px-1" style={{ animationDelay: `${i * 40}ms` }}>
                    <div>
                      <p className="font-medium text-gray-800">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                      {p.excerpt && <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentBlogId(p.id);
                          setBlogTitle(p.title);
                          setBlogSlug(p.slug);
                          setBlogExcerpt(p.excerpt || '');
                          setBlogContent(p.content);
                          setBlogCover(p.cover_image || '');
                        }}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this blog post?')) return;
                          await deleteBlogPost(p.id);
                          fetchBlogPosts();
                          flash('Blog post deleted');
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {blogPosts.length === 0 && <p className="text-sm text-muted-foreground">No blog posts yet.</p>}
            </SectionCard>
          </div>
        )}

        {tab === 'live' && (
          <div className="space-y-6">
            <SectionCard title="Live Darshan Stream">
              <form onSubmit={handleSaveLive} className="space-y-3">
                <FieldLabel>YouTube video id / link / channel live URL</FieldLabel>
                <input className={inputCls} value={liveInput} onChange={(e) => setLiveInput(e.target.value)} placeholder="e.g. dQw4w9WgXcQ or https://www.youtube.com/watch?v=…" />
                <p className="text-xs text-muted-foreground">Leave empty to fall back to automatic detection from the temple YouTube channel.</p>
                <button type="submit" disabled={busy} className={fileBtnCls}>
                  Save Live Stream
                </button>
              </form>
            </SectionCard>

            <SectionCard title="Aarti Timings" delay={60}>
              <FieldLabel>One timing per line: Name (TAB) Time</FieldLabel>
              <textarea className={inputCls} rows={6} value={timingsInput} onChange={(e) => setTimingsInput(e.target.value)} placeholder={'Mangala Aarti\t5:30 AM\nMadhyanha Bhoga Aarti\t12:00 PM'} />
              <button onClick={handleSaveTimings} disabled={busy} className={`${fileBtnCls} mt-3`}>
                Save Timings
              </button>
            </SectionCard>

            <SectionCard title="Festival Calendar" delay={120}>
              <FieldLabel>One festival per line: Name (TAB) Date</FieldLabel>
              <textarea className={inputCls} rows={6} value={festivalsInput} onChange={(e) => setFestivalsInput(e.target.value)} placeholder={'Rath Yatra\t16 July 2026\nJanmashtami\t4 Sep 2026'} />
              <button onClick={handleSaveFestivals} disabled={busy} className={`${fileBtnCls} mt-3`}>
                Save Festivals
              </button>
            </SectionCard>

            <SectionCard title="Donation / Under-Construction Banner" delay={180}>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <input type="checkbox" checked={settings.under_construction} onChange={handleToggleUnderConstruction} className="accent-primary" />
                Show "temple under construction — donate any amount" banner on the Donate page
              </label>
              <p className="text-xs text-muted-foreground">The banner appears on the Donate page when enabled.</p>
            </SectionCard>
          </div>
        )}

        {tab === 'branding' && (
          <div className="space-y-6">
            <SectionCard title="Header Logo">
              <form onSubmit={handleUploadLogo} className="space-y-3">
                {logoUrl && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Current logo (shown in the header):</p>
                    <img src={logoUrl} alt="Current logo" className="h-20 w-auto object-contain border border-border rounded-lg p-2 bg-white anim-pop" />
                  </div>
                )}
                <div>
                  <FieldLabel>Logo image (PNG/JPG/WebP with transparent background recommended)</FieldLabel>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white"
                  />
                  {logoFile && <p className="text-xs text-green-600 mt-1">Selected: {logoFile.name}</p>}
                </div>
                <button type="submit" disabled={busy} className={fileBtnCls}>
                  <Upload className="w-4 h-4" /> Change Logo
                </button>
              </form>
            </SectionCard>
            <p className="text-xs text-muted-foreground anim-fade-in" style={{ animationDelay: '80ms' }}>
              Tip: Use the existing <code className="bg-gray-100 px-1 rounded">horizontal.png</code> style logo for the best fit. The logo scales up in the header and keeps transparency.
            </p>
          </div>
        )}

        {tab === 'content' && (
          <div className="space-y-6">
            <SectionCard
              title="Site Content"
              badge={contentBlockKey in savedContent ? 'Custom content is live' : 'Using default content'}
            >
              <p className="text-sm text-muted-foreground mb-4">
                The website ships with built-in content. Pick a section below, edit it in the form (no JSON needed),
                and click “Save changes” — it appears on the site immediately. Sections you haven’t saved keep the
                built-in default.
              </p>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Section</FieldLabel>
                  <select
                    className={inputCls}
                    value={contentBlockKey}
                    onChange={(e) => setContentBlockKey(e.target.value)}
                  >
                    {Object.entries(CONTENT_BLOCK_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>
                {contentBlockKey in savedContent && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    This section is currently customized. To go back to the built-in content, click “Reset to default”.
                  </p>
                )}
                <SiteContentEditor
                  key={contentBlockKey}
                  blockKey={contentBlockKey}
                  value={
                    contentBlockKey in savedContent
                      ? savedContent[contentBlockKey]
                      : DEFAULT_SITE_CONTENT[contentBlockKey]
                  }
                  busy={busy}
                  onSave={handleSaveContentBlock}
                  onReset={handleResetContentBlock}
                />
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}
