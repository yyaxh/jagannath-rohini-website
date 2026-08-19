import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { getLiveStatus, type LiveStatus } from '@/lib/api';

const POLL_MS = 60_000;

export default function LiveAartiBanner() {
  const [status, setStatus] = useState<LiveStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const s = await getLiveStatus();
        if (!cancelled) setStatus(s);
      } catch {
        // Backend unreachable or YouTube not configured — just stay hidden.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!status?.is_live || !status.video_id) return null;

  return (
    <section className="bg-temple-dark-deeper py-8 px-4 anim-fade-up">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <span className="text-red-500 font-bold text-sm tracking-wide uppercase flex items-center gap-1">
            <Radio size={14} /> Live Now
          </span>
        </div>
        <h2 className="text-white text-xl md:text-2xl font-heading font-semibold mb-4">
          {status.title || 'Live Aarti from Jagannath Mandir, Rohini'}
        </h2>
        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl">
          <iframe
            src={`https://www.youtube.com/embed/${status.video_id}?autoplay=0`}
            title="Live Aarti"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <Link
          to="/live-darshan"
          className="inline-block mt-4 text-primary text-sm font-medium hover:underline"
        >
          Open full Live Darshan page →
        </Link>
      </div>
    </section>
  );
}
