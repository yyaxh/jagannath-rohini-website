import { useEffect, useState } from 'react';
import { getSiteContent } from './api';
import { CONTENT_PAGES } from '../content/contentPages';

// ---------------------------------------------------------------------------
// Types for each editable block.
// ---------------------------------------------------------------------------

export interface HeroSlide {
  id: number;
  image: string;
  headline?: string;
  subtext?: string;
  location?: string;
  cta?: { label: string; href: string };
}

export interface BlogCard {
  title: string;
  excerpt: string;
  image: string;
  href: string;
}

export interface BeshaCard {
  title: string;
  excerpt: string;
  image: string;
  href: string;
}

export interface FooterContent {
  address: string;
  email: string;          // mailto target for the main info email
  email2: string;         // secondary email display
  prasadPhone: string;
  phone1: string;
  phone2: string;
  notice: string;         // bottom notice bar text
}

export interface HeaderContact {
  phone: string;
  email: string;          // mailto target
}

export type ContentPages = Record<string, { title: string; content: string }>;

// ---------------------------------------------------------------------------
// Hardcoded defaults — the site ships with these and keeps using them for any
// block the admin hasn't overridden yet.
// ---------------------------------------------------------------------------

export const DEFAULT_SITE_CONTENT: Record<string, unknown> = {
  hero_slides: [
    {
      id: 1,
      image: '/airo-assets/images/hero/slide-1-rath-yatra.jpg',
      headline: 'SREE JAGANNATH RATHA YATRA 2026',
      subtext: 'Ratha Yatra on 16-07-2026 (Thursday)',
      location: 'JAGANNATH TEMPLE, ROHINI, NEW DELHI',
      cta: { label: 'Donate Now', href: '/prasad-booking' },
    },
    {
      id: 2,
      image: '/airo-assets/images/hero/slide-2-annadaan.jpg',
      headline: 'Maha Annadaan — Narayan Seva',
      subtext: 'Prasad Sewan — Rs. 11,000 for 100 persons | Rs. 5,500 for 50 persons',
      cta: { label: 'Donate Now', href: '/prasad-booking' },
    },
    {
      id: 3,
      image: '/airo-assets/images/hero/slide-3-celebration.jpg',
      headline: 'Divine celebrations at Jagannath Mandir, Rohini!',
      subtext: 'Feel the bliss of the sacred Shree Jagannath Rath Yatra 🛕',
      cta: { label: 'Click Here', href: '/rath-yatra' },
    },
    { id: 4, image: '/airo-assets/images/hero/slide-4-deity.jpg' },
    { id: 5, image: '/airo-assets/images/hero/slide-5-aarti.jpg' },
    { id: 6, image: '/airo-assets/images/hero/slide-6-rathyatra-crowd.jpg' },
    { id: 7, image: '/airo-assets/images/hero/slide-7-deities.jpg' },
    { id: 8, image: '/airo-assets/images/hero/slide-8-devotees.jpg' },
  ] as HeroSlide[],

  featured_videos: [
    'https://www.youtube.com/embed/rkgIdy9aQv4',
    'https://www.youtube.com/embed/sB3hFY9xlMU',
    'https://www.youtube.com/embed/kSJT8T_Z0SU',
    'https://www.youtube.com/embed/I7YWww_REBU',
    'https://www.youtube.com/embed/07gW2xUhOVc',
    'https://www.youtube.com/embed/dMToh8Nh9pc',
  ] as string[],

  blog_cards: [
    {
      title: 'Ganpati Bappa Morya',
      excerpt:
        'Vakratuṇḍa mahākāya sūryakoṭi samaprabha | Nirvighnaṃ kuru me deva sarvakāryeṣu sarvadā || Ganesh Chaturthi is one of the most celebrated Hindu festivals…',
      image: '/airo-assets/images/blog/ganesh-chaturthi.jpg',
      href: '/blog/ganpati-bappa-morya',
    },
    {
      title: 'II Oṃ śrī kṛṣṇāya namaḥ II',
      excerpt:
        'Every time, when goodness is suppressed by evil, when people are subjected to atrocities, the divine incarnates to restore dharma and protect the righteous…',
      image: '/airo-assets/images/blog/krishna-janmashtami.jpg',
      href: '/blog/om-sri-krishnaya-namah',
    },
    {
      title: 'Balabhadra Janma',
      excerpt:
        "The full moon day in the month of Sravana also known as 'Sravana Purnima' marks the auspicious birth anniversary of Lord Balabhadra, the elder brother of Lord Jagannath…",
      image: '/airo-assets/images/blog/balabhadra-janma.jpg',
      href: '/blog/balabhadra-janma',
    },
  ] as BlogCard[],

  beshas: [
    {
      title: 'Bana Bhoji Besha',
      excerpt:
        'Lord Jagannatha has been identified with Krishna and most of the rituals performed in Sreemandir are based on the life of Krishna. The Bana Bhoji Besha is one of the most elaborate and visually stunning costumes…',
      image: '/airo-assets/images/besha/bana-bhoji.jpg',
      href: '/blog',
    },
    {
      title: 'Suna Besha',
      excerpt:
        'The Suna Besha is also known as the Raja Besha or the Rajarajeshwara Besha. It is one of the most spectacular and grand Beshas of Lord Jagannath, performed on special occasions with gold ornaments…',
      image: '/airo-assets/images/besha/suna-besha.jpg',
      href: '/blog',
    },
    {
      title: 'Tahiya Lagi Besha',
      excerpt:
        'The Tahiya Lagi Besha is performed during the Rath Yatra festival. Tahiya is a floral crown made of flowers and leaves, symbolizing the divine connection between nature and the deity…',
      image: '/airo-assets/images/besha/tahiya-lagi.jpg',
      href: '/blog',
    },
  ] as BeshaCard[],

  footer: {
    address: 'DAMB Apartments, Sector 11 Extn, Sector 11, Rohini, New Delhi 110085',
    email: 'neelachalasevasangha@rediffmail.com',
    email2: 'odiasamajrohini@gmail.com',
    prasadPhone: '7011510512',
    phone1: '011-46015314',
    phone2: '46015316',
    notice:
      'Dear Devotee, For unsuccessful orders we will share the QR code on your Whatsapp number to complete the transaction. Closing Time on Website for Day Prasad Booking 9:30 am and closing time for Night Prasad Booking 6:00 p.m. Our Whatsapp Agent will answer your queries between 9 a.m. to 10 a.m. and 5 p.m. to 6 p.m. Jai Jagannath 🙏',
  } as FooterContent,

  header_contact: {
    phone: '7011510512',
    email: 'info@jagannathmandirrohini.com',
  } as HeaderContact,

  content_pages: CONTENT_PAGES as ContentPages,
};

// ---------------------------------------------------------------------------
// Loader + React hook. Admin-saved blocks are fetched once per page load and
// merged over the defaults (whole-block override).
// ---------------------------------------------------------------------------

let overridesCache: Record<string, unknown> | null = null;
let inflight: Promise<Record<string, unknown>> | null = null;
const listeners = new Set<() => void>();

/** Fetch admin overrides (cached per session). force=true refetches, e.g.
 * right after the admin saves content. */
export function loadSiteContent(force = false): Promise<Record<string, unknown>> {
  if (force) inflight = null;
  if (overridesCache && !force) return Promise.resolve(overridesCache);
  if (inflight) return inflight;
  inflight = getSiteContent()
    .then((data) => {
      overridesCache = data || {};
      listeners.forEach((l) => l());
      return overridesCache!;
    })
    .catch(() => {
      overridesCache = {};
      listeners.forEach((l) => l());
      return overridesCache!;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Refresh the cache from the server (call after admin saves). */
export const refreshSiteContent = (): Promise<Record<string, unknown>> => loadSiteContent(true);

/** Returns the effective value for a block: admin override if saved, else the
 * hardcoded default. */
export function useSiteContent<T>(block: string): T {
  const [overrides, setOverrides] = useState<Record<string, unknown> | null>(overridesCache);

  useEffect(() => {
    const update = () => setOverrides(overridesCache);
    listeners.add(update);
    loadSiteContent().then(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  if (overrides && block in overrides) return overrides[block] as T;
  return (DEFAULT_SITE_CONTENT as Record<string, unknown>)[block] as T;
}

/** All block keys with friendly labels (used by the admin Site Content tab). */
export const CONTENT_BLOCK_LABELS: Record<string, string> = {
  hero_slides: 'Homepage Hero Slides',
  featured_videos: 'Featured Videos (YouTube embed URLs)',
  blog_cards: 'Homepage Blog Cards',
  beshas: 'Beshas Section Cards',
  footer: 'Footer (address, emails, phones, notice)',
  header_contact: 'Header Contact (phone, email)',
  content_pages: 'Content Pages (About, History, Rituals, etc.)',
};
