import Link from 'next/link';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { hasPermission, requireChurch } from '@/lib/auth';

export default async function Events(){
  const context=await requireChurch();
  const {supabase,churchId,roleKey}=context;
  const canManage=await hasPermission(context,'events.manage');

  const {data:events,error}=await supabase
    .from('events')
    .select('id,title,description,category,banner_url,starts_at,ends_at,status,capacity,address')
    .eq('church_id',churchId)
    .order('starts_at');

  const {data:registrations}=canManage
    ? await supabase.from('event_registrations').select('event_id,checked_in_at').eq('church_id',churchId)
    : {data:[] as {event_id:string;checked_in_at:string|null}[]};

  const now=Date.now();
  const upcoming=(events||[]).filter(e=>new Date(e.starts_at).getTime()>=now);
  const past=(events||[]).filter(e=>new Date(e.starts_at).getTime()<now).reverse();
  const regCount=new Map<string,number>();
  const checkinCount=new Map<string,number>();
  (registrations||[]).forEach(r=>{
    regCount.set(r.event_id,(regCount.get(r.event_id)||0)+1);
    if(r.checked_in_at) checkinCount.set(r.event_id,(checkinCount.get(r.event_id)||0)+1);
  });

  if(roleKey==='member'){
    return <div className="member-events-page">
      <header className="member-section-head member-events-heading">
        <div><span>AGENDA</span><h1>Próximos eventos</h1><p>Encontre cultos, encontros e programações da igreja em um só lugar.</p></div>
      </header>

      {error?<p className="alert">{error.message}</p>:upcoming.length?<section className="member-event-gallery">
        {upcoming.map(event=><Link href={'/events/'+event.id} className="member-event-tile" key={event.id}>
          <div className="member-event-tile-media" style={event.banner_url?{backgroundImage:`linear-gradient(180deg,rgba(82,36,2,.04),rgba(82,36,2,.7)),url("${event.banner_url}")`}:undefined}>
            <span className="member-event-tile-date"><strong>{new Date(event.starts_at).getDate()}</strong><small>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small></span>
            <span className="member-event-tile-category">{event.category||'Evento'}</span>
          </div>
          <div className="member-event-tile-copy">
            <h2>{event.title}</h2>
            {event.description&&<p>{event.description}</p>}
            <div><span><CalendarDays size={14}/>{new Date(event.starts_at).toLocaleString('pt-BR',{dateStyle:'medium',timeStyle:'short'})}</span>{event.address&&<span><MapPin size={14}/>{event.address}</span>}</div>
          </div>
        </Link>)}
      </section>:<section className="module-empty-state"><CalendarDays size={34}/><h2>Nenhum evento programado</h2><p>Quando uma nova programação for publicada, ela aparecerá aqui.</p></section>}

      {past.length>0&&<section className="member-panel member-events-history">
        <div className="member-section-head"><div><span>HISTÓRICO</span><h2>Eventos anteriores</h2></div></div>
        <div className="past-event-grid">{past.slice(0,8).map(event=><Link href={'/events/'+event.id} key={event.id}><CalendarDays size={17}/><div><strong>{event.title}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR')}</span></div></Link>)}</div>
      </section>}
    </div>;
  }

  return <>
    <header className="module-heading"><div><span className="module-kicker">Agenda</span><h1>Eventos</h1><p>Cultos, conferências e encontros com inscrições, check-in e operação.</p></div>{canManage&&<Link className="module-primary" href="/events/new"><Plus size={16}/> Novo evento</Link>}</header>

    {error?<p className="alert">{error.message}</p>:<>
      <section className="events-featured">
        {upcoming.slice(0,3).map(event=><Link href={'/events/'+event.id} className="event-feature-card" key={event.id}><div className="event-feature-date"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div><div className="event-feature-copy"><span className="module-status active">{event.status}</span><h2>{event.title}</h2><div><span><CalendarDays size={14}/>{new Date(event.starts_at).toLocaleString('pt-BR',{dateStyle:'medium',timeStyle:'short'})}</span>{event.address&&<span><MapPin size={14}/>{event.address}</span>}</div></div>{canManage&&<div className="event-feature-stats"><div><strong>{regCount.get(event.id)||0}</strong><span>inscritos</span></div><div><strong>{checkinCount.get(event.id)||0}</strong><span>check-ins</span></div></div>}</Link>)}
        {!upcoming.length&&<section className="module-empty-state"><CalendarDays size={34}/><h2>Nenhum evento futuro</h2><p>{canManage?'Crie um evento para começar a receber inscrições e check-ins.':'Nenhum evento foi programado para os próximos dias.'}</p>{canManage&&<Link href="/events/new">Criar evento</Link>}</section>}
      </section>

      {upcoming.length>3&&<section className="panel event-list-panel"><div className="section-title"><div><span className="section-eyebrow">Agenda</span><h2>Mais eventos</h2></div></div>{upcoming.slice(3).map(event=><Link href={'/events/'+event.id} className="event-agenda-row" key={event.id}><span className="schedule-date-block"><strong>{new Date(event.starts_at).getDate()}</strong><small>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small></span><div><strong>{event.title}</strong><span>{new Date(event.starts_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}{event.address?' • '+event.address:''}</span></div>{canManage&&<div><strong>{regCount.get(event.id)||0}</strong><span>inscritos</span></div>}<span>→</span></Link>)}</section>}

      {past.length>0&&<section className="panel past-events"><div className="section-title"><div><span className="section-eyebrow">Histórico</span><h2>Eventos anteriores</h2></div></div><div className="past-event-grid">{past.slice(0,8).map(event=><Link href={'/events/'+event.id} key={event.id}><CalendarDays size={17}/><div><strong>{event.title}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR')}{canManage?' • '+(checkinCount.get(event.id)||0)+' presenças':''}</span></div></Link>)}</div></section>}
    </>}
  </>;
}
