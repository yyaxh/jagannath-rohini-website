import { Helmet } from '@dr.pogodin/react-helmet';
import HeroCarousel from '@/components/temple/HeroCarousel';
import LiveAartiBanner from '@/components/temple/LiveAartiBanner';
import FeaturedVideos from '@/components/temple/FeaturedVideos';
import BlogSection from '@/components/temple/BlogSection';
import BeshasSection from '@/components/temple/BeshasSection';
import GallerySection from '@/components/temple/GallerySection';
import AnnouncementsBar from '@/components/temple/AnnouncementsBar';

const site = 'https://jagannathmandirrohini.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      name: 'Jagannath Mandir Rohini',
      url: `${site}/`,
    },
    {
      '@type': 'HinduTemple',
      '@id': `${site}/#organization`,
      name: 'Jagannath Mandir, Rohini',
      url: `${site}/`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Rohini',
        addressRegion: 'New Delhi',
        addressCountry: 'IN',
      },
      telephone: '+91-7011510512',
      email: 'info@jagannathmandirrohini.com',
    },
    {
      '@type': 'WebPage',
      '@id': `${site}/#webpage`,
      url: `${site}/`,
      name: 'Jagannath Mandir Rohini — Oriya Samaj',
      isPartOf: { '@id': `${site}/#website` },
      about: { '@id': `${site}/#organization` },
      datePublished: '2023-04-01',
      dateModified: '2026-08-10',
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Shree Jagannath Mandir Rohini — Rath Yatra 2026 | Oriya Samaj, New Delhi</title>
        <meta
          name="description"
          content="Welcome to Shree Jagannath Mandir, Rohini, New Delhi. Book Annaprasad prasad, Rituals, and celebrate Rath Yatra 2026 on 16 July. Jai Jagannath!"
        />
        <link rel="canonical" href={`${site}/`} />
        <meta property="og:title" content="Shree Jagannath Mandir Rohini — Rath Yatra 2026" />
        <meta
          property="og:description"
          content="Official site of Shree Jagannath Mandir, Rohini, New Delhi. Annaprasad booking, Rituals, Rath Yatra 2026 and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${site}/`} />
        <meta property="og:image" content={`${site}/airo-assets/images/hero/slide-1-rath-yatra.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shree Jagannath Mandir Rohini — Rath Yatra 2026" />
        <meta
          name="twitter:description"
          content="Official site of Shree Jagannath Mandir, Rohini, New Delhi. Annaprasad booking, Rituals, Rath Yatra 2026 and more."
        />
        <meta name="twitter:image" content={`${site}/airo-assets/images/hero/slide-1-rath-yatra.jpg`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main>
        <h1 className="sr-only">Shree Jagannath Mandir Rohini — Oriya Samaj, New Delhi</h1>
        <AnnouncementsBar />
        <HeroCarousel />
        <LiveAartiBanner />
        <FeaturedVideos />
        <BlogSection />
        <BeshasSection />
        <GallerySection />
      </main>
    </>
  );
}
