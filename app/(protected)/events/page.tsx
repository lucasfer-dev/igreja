import { CalendarPlus } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createEvent } from './actions';

export default async function Events() {
  const { supabase, churchId, roleKey } = await requireChurch();
  const { data, error } = await supabase.from('events').select('id,title,starts_at,status,capacity,address').eq('church_id', churchId).order('starts_at');
  const isStaff = roleKey !== 'member';

  return (
    <>
      <header className="topbar"><div className="title"><span className="eyebrow">Agenda</span><h1>Eventos</h1><p>Cultos, cursos, conferências, encontros e inscrições.</p></div></header>
      <section className={isStaff ? 'content-grid admin-grid' : ''}>
        <div className="card">
          {error ? <p className="alert">{error.message}</p> : data?.length ? (
            <div className="event-list">{data.map(item => (
              <article className="event-item" key={item.id}>
                <div className="date-box"><strong>{new Date(item.starts_at).getDate()}</strong><span>{new Date(item.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div>
                <div><h3><a className="table-link" href={'/events/'+item.id}>{item.title}</a></h3><p>{new Date(item.starts_at).toLocaleString('pt-BR')}{item.address ? ' • ' + item.address : ''}{item.capacity ? ' • ' + item.capacity + ' vagas' : ''}</p></div>
                <span className="badge">{item.status}</span>
              </article>
            ))}</div>
          ) : <div className="empty">Nenhum evento cadastrado.</div>}
        </div>
        {isStaff && <aside className="card sticky-card"><div className="section-head"><h2>Novo evento</h2><span className="metric-icon"><CalendarPlus size={18}/></span></div><form action={createEvent} className="form"><div className="field"><label htmlFor="title">Título</label><input id="title" name="title" required/></div><div className="field"><label htmlFor="startsAt">Início</label><input id="startsAt" name="startsAt" type="datetime-local" required/></div><div className="field"><label htmlFor="endsAt">Término</label><input id="endsAt" name="endsAt" type="datetime-local"/></div><div className="field"><label htmlFor="address">Local</label><input id="address" name="address"/></div><div className="field"><label htmlFor="capacity">Capacidade</label><input id="capacity" name="capacity" type="number" min="1"/></div><button className="btn" type="submit">Publicar evento</button></form></aside>}
      </section>
    </>
  );
}
