import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Radio } from 'lucide-react';
import { getLiveStatus, getSiteSettings, type LiveStatus, type SiteSettings } from '@/lib/api';

const DEFAULT_TIMINGS = [
  { name: 'Mangala Aarti', time: '5:30 AM' },
  { name: 'Madhyanha Bhoga Aarti', time: '12:00 PM' },
  { name: 'Sandhya Aarti', time: '7:00 PM' },
  { name: 'Shayan Aarti', time: '9:00 PM' },
];

export default function LiveDarshanPage() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    // Refresh every 60s (backend caches YouTube status for the same window) so
    // the player appears on its own the moment the channel goes live — no
    // manual reload needed.
    const fetchStatus = () => {
      getLiveStatus()
        .then(setStatus)
        .catch(() => setStatus({ is_live: false, video_id: null, title: null, embed_url: null }));
    };
    fetchStatus();
    const timer = setInterval(fetchStatus, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const embedUrl = status?.embed_url || (status?.video_id ? `https://www.youtube.com/embed/${status.video_id}` : null);

  const timings = settings && settings.timings && settings.timings.length > 0 ? settings.timings : DEFAULT_TIMINGS;

  return (
    <>
      <Helmet>
        <title>Live Darshan & Aarti — Jagannath Mandir Rohini</title>
        <meta
          name="description"
          content="Watch Live Aarti and Darshan from Jagannath Mandir, Rohini. Daily aarti timings and live YouTube stream."
        />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 py-12 anim-fade-up">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-temple-dark mb-2">
          Live Darshan & Aarti
        </h1>
        <p className="text-muted-foreground mb-8">
          Watch live darshan from Jagannath Mandir, Rohini. Jai Jagannath! 🙏
        </p>

        {status?.is_live && status?.title && (
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="text-red-600 font-bold text-sm tracking-wide uppercase flex items-center gap-1">
              <Radio size={14} /> Live Now — {status.title}
            </span>
          </div>
        )}

        {embedUrl ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl bg-temple-dark">
            <iframe
              src={embedUrl}
              title="Jagannath Mandir Rohini — Live Darshan"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl bg-temple-dark flex items-center justify-center">
            <p className="text-white/70 text-sm px-4 text-center">
              Live stream will appear here when the temple goes live.
            </p>
          </div>
        )}

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-heading font-semibold text-temple-dark mb-3">Daily Aarti Timings</h2>
            <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-card">
              {timings.map((a) => (
                <li key={a.name} className="flex justify-between px-4 py-3 text-sm">
                  <span>{a.name}</span>
                  <span className="font-semibold text-primary">{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-heading font-semibold text-temple-dark mb-3">Not live right now?</h2>
            <p className="text-sm text-muted-foreground">
              The player above automatically shows our live stream once it begins. Subscribe on YouTube to get
              notified the moment we go live.
            </p>
            {settings && settings.festivals && settings.festivals.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-heading font-semibold text-temple-dark mb-3">Upcoming Festivals</h2>
                <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-card">
                  {settings.festivals.map((f) => (
                    <li key={f.name} className="flex justify-between px-4 py-3 text-sm">
                      <span>{f.name}</span>
                      <span className="font-semibold text-primary">{f.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
