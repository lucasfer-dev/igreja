import Link from 'next/link';
import { CalendarDays, MapPin, Plus, Users } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function Events(){
  const {supabase,churchId,roleKey}=await requireChurch();
  const [{data:events,error},{data:registrations}] = await Promise.all([
    supabase.from('events').select('id,title,description,starts_at,ends_at,status,capacity,address').eq('church_id',churchId).order('starts_at'),
    supabase.from('event_registrations').select('event_id,checked_in_at').eq('church_id',churchId),
  ]);
  const isStaff=roleKey!=='member';
  const now=Date.now();
  const upcoming=(events||[]).filter(e=>new Date(e.starts_at).getTime()>=now);
  const past=(events||[]).filter(e=>new Date(e.starts_at).getTime()<now).reverse();
  const regCount=new Map<string,number>(); const checkinCount=new Map<string,number>();
  (registrations||[]).forEach((r:any)=>{regCount.set(r.event_id,(regCount.get(r.event_id)||0)+1);if(r.checked_in_at)checkinCount.set(r.event_id,(checkinCount.get(r.event_id)||0)+1)});

  return <>
    <header className="module-heading"><div><span className="module-kicker">Agenda</span><h1>Eventos</h1><p>Cultos, conferências e encontros com inscrições, check-in e operação.</p></div>{isStaff&&<Link className="module-primary" href="/events/new"><Plus size={16}/> Novo evento</Link>}</header>

    {error?<p className="alert">{error.message}</p>:<>
      <section className="events-featured">
        {upcoming.slice(0,3).map(event=><Link href={'/events/'+event.id} className="event-feature-card" key={event.id}><div className="event-feature-date"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div><div className="event-feature-copy"><span className="module-status active">{event.status}</span><h2>{event.title}</h2><div><span><CalendarDays size={14}/>{new Date(event.starts_at).toLocaleString('pt-BR',{dateStyle:'medium',timeStyle:'short'})}</span>{event.address&&<span><MapPin size={14}/>{event.address}</span>}</div></div><div className="event-feature-stats"><div><strong>{regCount.get(event.id)||0}</strong><span>inscritos</span></div><div><strong>{checkinCount.get(event.id)||0}</strong><span>check-ins</span></div></div></Link>)}
        {!upcoming.length&&<section className="module-empty-state"><CalendarDays size={34}/><h2>Nenhum evento futuro</h2><p>Crie um evento para começar a receber inscrições e check-ins.</p>{isStaff&&<Link href="/events/new">Criar evento</Link>}</section>}
      </section>

      {upcoming.length>3&&<section className="panel event-list-panel"><div className="section-title"><div><span className="section-eyebrow">Agenda</span><h2>Mais eventos</h2></div></div>{upcoming.slice(3).map(event=><Link href={'/events/'+event.id} className="event-agenda-row" key={event.id}><span className="schedule-date-block"><strong>{new Date(event.starts_at).getDate()}</strong><small>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small></span><div><strong>{event.title}</strong><span>{new Date(event.starts_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}{event.address?' • '+event.address:''}</span></div><div><strong>{regCount.get(event.id)||0}</strong><span>inscritos</span></div><span>→</span></Link>)}</section>}

      {past.length>0&&<section className="panel past-events"><div className="section-title"><div><span className="section-eyebrow">Histórico</span><h2>Eventos anteriores</h2></div></div><div className="past-event-grid">{past.slice(0,8).map(event=><Link href={'/events/'+event.id} key={event.id}><CalendarDays size={17}/><div><strong>{event.title}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR')} • {checkinCount.get(event.id)||0} presenças</span></div></Link>)}</div></section>}
    </>}
  </>;
}
