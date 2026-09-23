import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createEvent } from '../actions';

export default async function NewEvent({searchParams}:{searchParams:Promise<{error?:string}>}){
  await requirePermission('events.manage');
  const params=await searchParams;

  return <div className="creation-page">
    <Link className="creation-back" href="/events"><ArrowLeft size={15}/> Voltar para eventos</Link>
    <div className="creation-layout">
      <section className="creation-intro">
        <span className="creation-icon"><CalendarDays size={23}/></span>
        <span className="module-kicker">Novo evento</span>
        <h1>Planeje um evento</h1>
        <p>Publique as informações que o membro realmente precisa e acompanhe inscrições e operação no workspace administrativo.</p>
      </section>
      <section className="creation-form-panel">
        {params.error&&<p className="alert">{params.error}</p>}
        <form action={createEvent} className="form">
          <div className="field"><label htmlFor="title">Título</label><input id="title" name="title" placeholder="Ex.: Culto da noite" required/></div>
          <div className="form-row"><div className="field"><label htmlFor="category">Categoria</label><input id="category" name="category" placeholder="Culto, Conferência, Jovens..."/></div><div className="field"><label htmlFor="bannerUrl">Banner</label><input id="bannerUrl" name="bannerUrl" type="url" placeholder="https://..."/></div></div>
          <div className="field"><label htmlFor="description">Descrição</label><textarea id="description" name="description" rows={5} placeholder="Explique de forma clara o que vai acontecer e para quem é o evento."/></div>
          <div className="form-row"><div className="field"><label htmlFor="startsAt">Início</label><input id="startsAt" name="startsAt" type="datetime-local" required/></div><div className="field"><label htmlFor="endsAt">Término</label><input id="endsAt" name="endsAt" type="datetime-local"/></div></div>
          <div className="field"><label htmlFor="address">Local</label><input id="address" name="address" placeholder="Auditório principal"/></div>
          <div className="field"><label htmlFor="capacity">Capacidade</label><input id="capacity" name="capacity" type="number" min="1" placeholder="Ex.: 300"/></div>
          <div className="creation-actions"><Link href="/events">Cancelar</Link><button className="primary-submit" type="submit">Publicar evento</button></div>
        </form>
      </section>
    </div>
  </div>;
}
