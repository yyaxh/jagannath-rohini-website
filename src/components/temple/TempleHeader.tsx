import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
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

const logoPath = '/airo-assets/images/logo/jagannath-emblem.png';

export default function TempleHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const contact = useSiteContent<HeaderContact>('header_contact');
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pathname } = useLocation();
  const isHome = pathname === '/';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileClosing(false);
  }, [pathname]);

  // Scroll detection: hide orange bar after 60px scroll
  useEffect(() => {
    if (!isHome) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const toggleMobile = useCallback(() => {
    if (mobileOpen) {
      setMobileClosing(true);
      setTimeout(() => {
        setMobileOpen(false);
        setMobileClosing(false);
      }, 450);
    } else {
      setMobileOpen(true);
      setMobileClosing(false);
    }
  }, [mobileOpen]);

  const onDropdownEnter = useCallback((label: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpenDropdown(label);
  }, []);

  const onDropdownLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Orange top bar — buttery smooth slide up/down on scroll */}
      {isHome && (
        <div
          className="bg-primary header-top-bar"
          style={{
            maxHeight: scrolled ? '0px' : '300px',
            opacity: scrolled ? 0 : 1,
            paddingBlock: scrolled ? '0' : undefined,
          }}
        >
          <div className="py-3 px-4">
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
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-xs lg:text-sm font-medium hover:underline mt-1 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>{contact.phone}
                  </a>
                  {isHome && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs lg:text-sm font-medium hover:underline transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  className="bg-red-600 hover:bg-red-700 text-white text-base font-bold px-8 py-4 rounded-full shadow-sm smooth-btn"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile hamburger + donate button row */}
      <div className="bg-temple-dark lg:hidden px-4 py-2 flex items-center justify-between">
        <button
          onClick={toggleMobile}
          className="p-2 text-white nav-link-lift hamburger-icon"
          aria-label="Toggle navigation menu"
        >
          <div className={`hamburger-lines ${mobileOpen ? 'open' : ''}`}>
            <span />
            <span />
            <span />
          </div>
        </button>

        <Link
          to="/donate"
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full smooth-btn"
        >
          Donate
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="bg-temple-dark hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center flex-wrap">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => onDropdownEnter(item.label)}
                onMouseLeave={onDropdownLeave}
              >
                <button className="nav-link-lift flex items-center gap-1 text-white text-sm font-medium px-3 py-3 hover:text-yellow-300 whitespace-nowrap">
                  {item.label}
                  <ChevronDown size={12} className={`transition-transform duration-300 ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`absolute top-full left-0 min-w-56 shadow-xl z-50 py-2 bg-temple-dark border-t-2 border-primary rounded-b-lg desktop-dropdown ${
                    openDropdown === item.label
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  {item.dropdown.map((sub, i) => (
                    <Link
                      key={sub.label}
                      to={sub.href}
                      className="block px-5 py-2.5 text-white text-sm hover:bg-primary hover:text-white whitespace-nowrap desktop-dropdown-item"
                      style={openDropdown === item.label ? {
                        animation: `fadeSlideRight 0.4s ${i * 0.06}s cubic-bezier(0.22, 1, 0.36, 1) both`
                      } : undefined}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.href!}
                className="nav-link-lift text-white text-sm font-medium px-3 py-3 hover:text-yellow-300 whitespace-nowrap"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      </nav>

      {/* Mobile nav — buttery smooth slide-down/up */}
      <div
        className={`bg-temple-dark lg:hidden shadow-md mobile-menu-wrap ${
          mobileOpen && !mobileClosing
            ? 'max-h-[900px] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <nav>
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col">
            {navItems.map((item, index) =>
              item.dropdown ? (
                <MobileDropdown
                  key={item.label}
                  item={item}
                  parentOpen={mobileOpen && !mobileClosing}
                  staggerIndex={index}
                />
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
                  className="text-white text-sm font-medium px-3 py-3.5 hover:text-yellow-300 border-b border-white/10 whitespace-nowrap nav-link-lift"
                  style={mobileOpen && !mobileClosing ? {
                    animation: `fadeSlideRight 0.4s ${index * 0.055}s cubic-bezier(0.22, 1, 0.36, 1) both`
                  } : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ---- Mobile accordion sub-menu — buttery smooth expand ---- */
function MobileDropdown({ item, parentOpen, staggerIndex }: { item: { label: string; dropdown: { label: string; href: string }[] }; parentOpen: boolean; staggerIndex: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!parentOpen) setOpen(false);
  }, [parentOpen]);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-white text-sm font-medium px-3 py-3.5 hover:text-yellow-300 whitespace-nowrap"
        style={parentOpen ? {
          animation: `fadeSlideRight 0.4s ${staggerIndex * 0.055}s cubic-bezier(0.22, 1, 0.36, 1) both`
        } : undefined}
      >
        {item.label}
        <ChevronDown
          size={14}
          className="text-white/60 transition-transform duration-400"
          style={{ transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div
        className="overflow-hidden mobile-menu-wrap"
        style={{
          maxHeight: open ? `${item.dropdown.length * 46}px` : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        {item.dropdown.map((sub, i) => (
          <Link
            key={sub.label}
            to={sub.href}
            className="block pl-6 pr-3 py-3 text-white/80 text-sm hover:text-yellow-300 hover:bg-white/5 whitespace-nowrap transition-colors duration-300"
            style={open ? {
              animation: `fadeSlideRight 0.35s ${i * 0.05}s cubic-bezier(0.22, 1, 0.36, 1) both`
            } : undefined}
          >
            {sub.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
