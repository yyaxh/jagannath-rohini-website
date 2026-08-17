import { Helmet } from '@dr.pogodin/react-helmet';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import TempleHeader from '@/components/temple/TempleHeader';
import TempleFooter from '@/components/temple/TempleFooter';
import Website from '@/layouts/Website';

export default function RootLayout() {
  return (
    <Website>
      <Helmet>
        <title>Shree Jagannath Mandir Rohini — Oriya Samaj, New Delhi</title>
        <meta
          name="description"
          content="Official website of Shree Jagannath Mandir, Rohini, New Delhi. Book Annaprasad, Rituals, Society Membership, and stay updated on Rath Yatra and temple events."
        />
      </Helmet>
      <ScrollRestoration />
      <TempleHeader />
      <Outlet />
      <TempleFooter />
    </Website>
  );
}
