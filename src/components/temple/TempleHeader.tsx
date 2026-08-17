import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useSiteContent, type HeaderContact } from '@/lib/siteContent';

const navItems = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    dropdown: [
      { label: 'The Supreme God', href: '/the-supreme-god' },
      { label: 'About the Temple', href: '/about-the-temple' },
      { label: 'History', href: '/history' },
      { label: 'EC Members / Trustees', href: '/trustees' },
      { label: 'Location', href: '/location' },
      { label: 'Events', href: '/events' },
      { label: 'Rituals', href: '/rituals' },
      { label: 'Festival Calendar', href: '/festival-calendar' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    label: 'Prasad Booking',
    dropdown: [
      { label: 'Annaprasad & Sweets', href: '/prasad-booking' },
      { label: 'Day Prasad Sewan', href: '/prasad-booking' },
      { label: 'Night Prasad Sewan', href: '/prasad-booking' },
    ],
  },
  { label: 'Society Membership', href: '/membership' },
  { label: 'Dainik Sewa', href: '/seva' },
  { label: 'Temple Construction', href: '/temple-construction' },
  { label: 'Documents', href: '/documents' },
  { label: 'Live Darshan', href: '/live-darshan' },
  { label: 'Temple Timings', href: '/temple-timings' },
  { label: 'Contact', href: '/contact' },
];

// Fixed header logo — the Jagannath Mandir circular emblem. Always used,
// no settings fetch / swapping, so it can never flash or change.
const logoPath = '/airo-assets/images/logo/jagannath-emblem.png';

export default function TempleHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const contact = useSiteContent<HeaderContact>('header_contact');

  const { pathname } = useLocation();
  const isHome = pathname === '/';

  const toggleMobile = () => setMobileOpen((v) => !v);

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {isHome && (
      <div className="bg-primary py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 order-1 lg:order-none">
            <Link to="/" className="shrink-0">
              <img
                src={logoPath}
                alt="Jagannath Mandir Rohini"
                className="h-16 lg:h-20 w-auto object-contain"
                loading="eager"
                fetchPriority="high" />
            </Link>
            <div className="text-yellow-950">
              <p className="text-base lg:text-lg font-bold leading-tight">Shree Jagannath Mandir</p>
              <p className="text-xs lg:text-sm font-medium leading-snug">
                Sector 11, Rohini, New Delhi
              </p>
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-xs lg:text-sm font-medium hover:underline mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>{contact.phone}
              </a>
              {isHome && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs lg:text-sm font-medium hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span className="hidden sm:inline break-all">{contact.email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/donate"
              className="bg-red-600 hover:bg-red-700 text-white text-base font-bold px-8 py-4 rounded-full shadow-sm"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </div>
      )}

      {/* Mobile menu toggle — on every page (orange bar is homepage-only) */}
      <div className="bg-temple-dark lg:hidden px-4 py-2 flex items-center justify-between">
        <button
          onClick={toggleMobile}
          className="p-2 text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav className="bg-temple-dark hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center flex-wrap">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 text-white text-sm font-medium px-3 py-3 hover:text-yellow-300 transition whitespace-nowrap">
                  {item.label}
                  <ChevronDown size={12} />
                </button>
                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 min-w-52 shadow-lg z-50 py-1 bg-temple-dark border-t-2 border-primary">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.href}
                        className="block px-4 py-2 text-white text-sm hover:bg-primary hover:text-white transition whitespace-nowrap"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.href!}
                className="text-white text-sm font-medium px-3 py-3 hover:text-yellow-300 transition whitespace-nowrap"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      </nav>

      {mobileOpen && (
        <nav className="bg-temple-dark lg:hidden shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="py-1">
                  <p className="text-white text-sm font-semibold py-2 uppercase tracking-wide">{item.label}</p>
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.href}
                      onClick={toggleMobile}
                      className="block py-1.5 pl-3 text-white/85 text-sm hover:text-yellow-300 transition"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
                  onClick={toggleMobile}
                  className="text-white text-sm font-medium py-2 hover:text-yellow-300 transition"
                >
                  {item.label}
                </Link>
              )
            )}
            {isHome && (
              <Link
                to="/donate"
                onClick={toggleMobile}
                className="mt-2 bg-red-600 text-white text-center text-base font-bold px-4 py-3 rounded-full shadow-sm"
              >
                Donate Now
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}