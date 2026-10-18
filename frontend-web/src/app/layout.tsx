import type { Metadata } from 'next';
import { Noto_Sans_Lao, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-noto-sans-lao',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Where to Go in Laos (ໄປໃສດີ) • Travel & Attractions Discovery',
  description:
    'Discover and post pristine waterfalls, specialty coffee cafes, nature trails, and UNESCO cultural heritage spots in Laos.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-v2.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo-v2.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lo" className={`${notoSansLao.variable} ${plusJakartaSans.variable} h-full bg-[#FBFBFA]`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/logo-v2.png" />
        <link rel="apple-touch-icon" href="/logo-v2.png" />
      </head>
      <body className={`${notoSansLao.className} min-h-full flex flex-col text-stone-900 antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
