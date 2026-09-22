import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  applicationName: 'PIBJG',
  title: {
    default: 'PIBJG',
    template: '%s | PIBJG',
  },
  description: 'Ecossistema digital da Primeira Igreja Batista em Jardim Gláucia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
