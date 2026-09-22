import Link from 'next/link';
import { Check, Church, HeartHandshake } from 'lucide-react';

export const metadata = { title: 'Recebemos seu cartão | PIBJG' };

export default function ConnectionSuccessPage() {
  return (
    <main className="connection-page connection-success-page">
      <section className="connection-success-card">
        <div className="connection-brand centered"><span><Church size={22}/></span><div><strong>PIBJG</strong><small>Primeira Igreja Batista em Jardim Gláucia</small></div></div>
        <span className="connection-success-icon"><Check size={30}/></span>
        <span className="connection-kicker">Cartão recebido</span>
        <h1>Que bom ter você com a gente ❤️</h1>
        <p>Recebemos seu cartão de conexão. Nossa equipe da PIBJG entrará em contato com você em breve.</p>
        <div className="connection-success-note"><HeartHandshake size={18}/><span>Esperamos que você se sinta em casa e encontre aqui uma comunidade para caminhar junto.</span></div>
        <Link href="/login">Já sou membro? Entrar na PIBJG</Link>
      </section>
    </main>
  );
}
