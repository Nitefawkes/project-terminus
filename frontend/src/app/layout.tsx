import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Terminus - Living World Clock',
  description: 'Web-native global intelligence dashboard with real-time day/night terminator, space weather, and geospatial layers',
  keywords: 'world clock, space weather, ham radio, geospatial, OSINT, satellite tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
