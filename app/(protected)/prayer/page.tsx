import Link from 'next/link';
import { ArrowLeft, HeartHandshake, LockKeyhole } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function PrayerPage(){
  const {churchName}=await requireChurch();

  return <div className="member-prayer-page">
    <Link href="/dashboard" className="member-back-link"><ArrowLeft size={15}/> Voltar ao início</Link>
    <section className="member-prayer-card">
      <span className="member-prayer-icon"><HeartHandshake size={26}/></span>
      <span className="page-kicker">Cuidado</span>
      <h1>Como podemos orar por você?</h1>
      <p>Compartilhe seu pedido com a equipe autorizada da {churchName}. Escreva somente o que se sentir confortável em dividir.</p>
      <form action="/api/prayer" method="post" className="form">
        <input type="hidden" name="title" value="Pedido de oração"/>
        <div className="field"><label htmlFor="body">Seu pedido</label><textarea id="body" name="body" rows={7} minLength={2} maxLength={4000} required placeholder="Conte como podemos orar por você..."/></div>
        <div className="member-prayer-privacy"><LockKeyhole size={15}/><span>Este pedido é confidencial e fica visível somente para você e para a equipe de cuidado autorizada.</span></div>
        <button className="primary-submit" type="submit">Enviar pedido <HeartHandshake size={16}/></button>
      </form>
    </section>
  </div>;
}
