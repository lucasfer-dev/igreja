import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChurchOS',
  description: 'Gestão integrada para igrejas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
