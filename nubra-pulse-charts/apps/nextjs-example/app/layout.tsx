import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Celeris Charts - Next.js Example',
  description: 'Example Next.js app for testing Celeris charts',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

