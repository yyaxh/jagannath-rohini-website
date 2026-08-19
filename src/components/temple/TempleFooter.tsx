import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { useSiteContent, type FooterContent } from '@/lib/siteContent';
import { getBlogPosts, type BlogPost } from '@/lib/api';

const quickLinks = [
  { label: 'Donate', href: '/donate' },
  { label: 'About the Temple', href: '/about-the-temple' },
  { label: 'Society Membership', href: '/membership' },
  { label: 'Dainik Sewa', href: '/seva' },
  { label: 'Prasad Booking', href: '/prasad-booking' },
  { label: 'Temple Construction', href: '/temple-construction' },
  { label: 'Temple Timings', href: '/temple-timings' },
  { label: 'Live Darshan', href: '/live-darshan' },
  { label: 'Contact', href: '/contact' },
];

export default function TempleFooter() {
  const footer = useSiteContent<FooterContent>('footer');
  const [latest, setLatest] = useState<BlogPost | null>(null);

  useEffect(() => {
    let active = true;
    getBlogPosts()
      .then((posts) => {
        if (active) setLatest(posts[0] ?? null);
      })
      .catch(() => {
        if (active) setLatest(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer>
      {/* Main footer */}
      <div className="bg-temple-dark py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          {/* Column 1 — Latest Post */}
          <div>
            <h4
              className="font-bold text-primary mb-4 pb-2 border-b border-primary/30 uppercase tracking-wide text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}>
              Latest Post
            </h4>
            {latest ? (
              <div>
                <Link
                  to={`/blog/${latest.slug}`}
                  className="text-white hover:text-primary transition font-semibold text-sm block smooth-link">
                  {latest.title}
                </Link>
                {latest.excerpt && (
                  <p className="text-white/50 text-xs mt-1">{latest.excerpt}</p>
                )}
                <Link
                  to={`/blog/${latest.slug}`}
                  className="inline-block mt-2 text-primary hover:text-primary/80 text-xs underline smooth-link">
                  Read Post →
                </Link>
              </div>
            ) : (
              <div>
                <Link
                  to="/blog"
                  className="text-white hover:text-primary transition font-semibold text-sm smooth-link">
                  Read our Latest Posts
                </Link>
                <p className="text-white/50 text-xs mt-1">Stories, festivals & updates</p>
              </div>
            )}

            {/* Gajapati message */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-white/60 text-xs mb-2">Message from Gajapati Maharaja Dibyasingha Deb ji</p>
              <a
                href="https://jagannathmandirdelhi.com/assets/message-from-puri-jagapati.pdf"
                target="_blank"
                rel="noopener noreferrer"                  className="inline-block text-primary hover:text-primary/80 text-xs underline smooth-link">
                Message from Gajapati Maharaja Dibyasingha Deb ji — Download
              </a>
            </div>
          </div>

          {/* Column 2 — About the Temple */}
          <div>
            <h4
              className="font-bold text-primary mb-4 pb-2 border-b border-primary/30 uppercase tracking-wide text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}>
              About the Temple
            </h4>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Shree Jagannath Mandir, Rohini is managed by the Oriya Samaj (Regd. No. S/37924/2000).
              Presently situated at DAMB Apartments, Sector 11, Rohini, the temple offers daily darshan,
              aarti, prasad booking, society membership and seva — with the permanent temple under
              construction at Sector 7, Rohini. Donations to the trust are eligible for 80G tax benefits.
            </p>
            <div className="text-sm text-white/70 space-y-1">
              <p className="font-semibold text-white">Mailing Address:</p>
              <p>{footer.address}</p>
              <p className="mt-2">
                <span className="text-primary">Email:</span>{' '}
                <a href={`mailto:${footer.email}`}                  className="hover:text-primary transition break-all smooth-link">{footer.email}</a>
              </p>
              {footer.email2 && (
                <p>
                  <a href={`mailto:${footer.email2}`} className="hover:text-primary transition break-all">{footer.email2}</a>
                </p>
              )}
              <p className="mt-2">
                <span className="text-primary">Prasad Booking:</span>{' '}
                <a href={`tel:+91${footer.prasadPhone}`}                  className="hover:text-primary transition smooth-link">{footer.prasadPhone}</a>
              </p>
              <p>
                <span className="text-primary">Phone:</span>{' '}
                <a href={`tel:${footer.phone1.replace(/-/g, '')}`}                  className="hover:text-primary transition smooth-link">{footer.phone1}</a>
                {footer.phone2 && (
                  <>
                    ,{' '}
                    <a href={`tel:${footer.phone2.replace(/-/g, '')}`} className="hover:text-primary transition smooth-link">{footer.phone2}</a>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Column 3 — Quick Links */}
          <div>
            <h4
              className="font-bold text-primary mb-4 pb-2 border-b border-primary/30 uppercase tracking-wide text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}>
              Quick Links
            </h4>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/70 hover:bg-primary hover:border-primary hover:text-primary-foreground chip-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Policy + social */}
      <div className="bg-temple-dark-deeper py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap justify-center gap-3 text-xs text-white/50">
            {[
              { label: 'Terms & Conditions', href: '/terms-conditions' },
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Cancellation & Refund', href: '/cancellation-refund' },
              { label: 'Disclaimer', href: '/disclaimer' },
            ].map((link, i, arr) => (
              <span key={link.label} className="flex items-center gap-3">
                <Link to={link.href} className="hover:text-primary transition smooth-link">
                  {link.label}
                </Link>
                {i < arr.length - 1 && <span className="text-white/20">|</span>}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/SreeNeelachalaSevaSangha" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary social-icon" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://www.instagram.com/jagannath_mandir_hauzkhas/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary social-icon" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://www.youtube.com/channel/UC6xwf_MaEZRyVO_wC8XtrEQ" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary social-icon" aria-label="YouTube">
              <Youtube size={18} />
            </a>
            <a href="https://twitter.com/home" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary social-icon" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-3 text-center text-xs text-white/40">
          Copyright © 2026 Oriya Samaj.
        </div>
      </div>

      {/* Notice bar */}
      <div className="bg-primary py-3 px-4">
        <p className="text-primary-foreground text-xs text-center max-w-5xl mx-auto leading-relaxed">
          {footer.notice}
        </p>
      </div>
    </footer>
  );
}
