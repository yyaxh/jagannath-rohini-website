import { type RouteObject } from 'react-router-dom';
import HomePage from './pages/index';
import NotFoundPage from './pages/NotFound';
import ContentPage from './pages/ContentPage';
import LiveDarshanPage from './pages/LiveDarshan';
import DonatePage from './pages/Donate';
import MembershipPage from './pages/SocietyMembership';
import SevaPage from './pages/DainikSewa';
import GalleryPage from './pages/Gallery';
import DocumentsPage from './pages/Documents';
import BlogPage from './pages/Blog';
import BlogPostPage from './pages/BlogPost';

export const routes: RouteObject[] = [
  // ---- Home ----
  { path: '/', element: <HomePage /> },

  // ---- Live Features ----
  { path: '/live-darshan', element: <LiveDarshanPage /> },
  { path: '/donate', element: <DonatePage /> },
  { path: '/membership', element: <MembershipPage /> },
  { path: '/seva', element: <SevaPage /> },
  { path: '/gallery', element: <GalleryPage /> },
  { path: '/documents', element: <DocumentsPage /> },

  // ---- About Dropdown ----
  { path: '/the-supreme-god', element: <ContentPage slug="the-supreme-god" /> },
  { path: '/mahaprasad', element: <ContentPage slug="mahaprasad" /> },
  { path: '/about-the-temple', element: <ContentPage slug="about-the-temple" /> },
  { path: '/temple-construction', element: <ContentPage slug="temple-construction" /> },
  { path: '/location', element: <ContentPage slug="location" /> },
  { path: '/contact', element: <ContentPage slug="contact" /> },

  // ---- History / Saga ----
  { path: '/history', element: <ContentPage slug="history" /> },
  { path: '/unique-saga', element: <ContentPage slug="unique-saga" /> },

  // ---- Oriya Samaj ----
  { path: '/about-us', element: <ContentPage slug="about-us" /> },
  { path: '/trustees', element: <ContentPage slug="trustees" /> },

  // ---- Rituals & Prasad ----
  { path: '/rituals', element: <ContentPage slug="rituals" /> },
  { path: '/prasad-booking', element: <ContentPage slug="prasad-booking" /> },
  { path: '/temple-timings', element: <ContentPage slug="temple-timings" /> },

  // ---- Events ----
  { path: '/events', element: <ContentPage slug="events" /> },
  { path: '/rath-yatra', element: <ContentPage slug="rath-yatra" /> },
  { path: '/festival-calendar', element: <ContentPage slug="festival-calendar" /> },

  // ---- Blog ----
  { path: '/blog', element: <BlogPage /> },
  { path: '/blog/:slug', element: <BlogPostPage /> },

  // ---- Legal ----
  { path: '/terms-conditions', element: <ContentPage slug="terms" /> },
  { path: '/privacy-policy', element: <ContentPage slug="privacy" /> },
  { path: '/cancellation-refund', element: <ContentPage slug="refund" /> },
  { path: '/disclaimer', element: <ContentPage slug="disclaimer" /> },

  // NOTE: /admin and /admin/login are intentionally NOT here — they are
  // registered as top-level routes in App.tsx (outside RootLayout) so the
  // admin pages render WITHOUT the temple header/navbar/footer.

  // ---- Catch-all ----
  { path: '*', element: <NotFoundPage /> },
];