import Link from 'next/link';
import { CalendarDays, HeartHandshake, Megaphone, UserRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function MemberDashboard() {
  const { supabase, churchId, user, churchName, profileName, roleKey } = await requireChurch();
  const now = new Date().toISOString();

  const [events, announcements, notifications, member] = await Promise.all([
    supabase.from('events').select('id,title,description,starts_at,address,status').eq('church_id', churchId).gte('starts_at', now).order('starts_at').limit(4),
    supabase.from('announcements').select('id,title,body,published_at').eq('church_id', churchId).eq('published', true).order('published_at', { ascending: false }).limit(4),
    supabase.from('notifications').select('id,title,body,created_at,read_at').eq('church_id', churchId).eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
    supabase.from('church_members').select('full_name,status,joined_at,baptism_date').eq('church_id', churchId).eq('auth_user_id', user.id).maybeSingle(),
  ]);

  return (
    <>
      <header className="hero hero-member">
        <div>
          <span className="eyebrow">Olá, {profileName}</span>
          <h1>Bem-vindo à {churchName}</h1>
          <p>Acompanhe o que está acontecendo na sua comunidade e encontre seus próximos passos.</p>
        </div>
        {roleKey !== 'member' && <Link className="btn secondary-light" href="/admin">Abrir administração</Link>}
      </header>

      <section className="quick-grid">
        <div className="quick-card"><span className="quick-icon"><UserRound size={20} /></span><div><small>Seu vínculo</small><strong>{member.data?.status ? String(member.data.status) : 'Comunidade'}</strong></div></div>
        <div className="quick-card"><span className="quick-icon"><CalendarDays size={20} /></span><div><small>Próximos eventos</small><strong>{events.data?.length || 0}</strong></div></div>
        <div className="quick-card"><span className="quick-icon"><Megaphone size={20} /></span><div><small>Novos avisos</small><strong>{announcements.data?.length || 0}</strong></div></div>
        <div className="quick-card"><span className="quick-icon"><HeartHandshake size={20} /></span><div><small>Precisa de apoio?</small><strong>Envie um pedido</strong></div></div>
      </section>

      <section className="content-grid">
        <div className="stack">
          <section className="card">
            <div className="section-head"><div><span className="eyebrow">Agenda</span><h2>Próximos eventos</h2></div><Link href="/events">Ver todos</Link></div>
            <div className="event-list">
              {events.data?.length ? events.data.map((event) => (
                <article className="event-item" key={event.id}>
                  <div className="date-box"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span></div>
                  <div><h3>{event.title}</h3><p>{new Date(event.starts_at).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}{event.address ? ' • ' + event.address : ''}</p></div>
                </article>
              )) : <div className="empty compact">Nenhum evento futuro publicado.</div>}
            </div>
          </section>

          <section className="card">
            <div className="section-head"><div><span className="eyebrow">Comunidade</span><h2>Avisos da igreja</h2></div></div>
            <div className="announcement-list">
              {announcements.data?.length ? announcements.data.map((item) => (
                <article className="announcement" key={item.id}><h3>{item.title}</h3><p>{item.body}</p><small>{new Date(item.published_at).toLocaleDateString('pt-BR')}</small></article>
              )) : <div className="empty compact">Quando a liderança publicar um aviso, ele aparecerá aqui.</div>}
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="card accent-card">
            <span className="eyebrow">Cuidado pastoral</span>
            <h2>Como podemos orar por você?</h2>
            <p>Envie um pedido de oração. Ele fica vinculado à sua conta e pode ser tratado com privacidade.</p>
            <form action="/api/prayer" method="post" className="form compact-form">
              <input name="title" placeholder="Assunto do pedido" required />
              <textarea name="body" rows={4} placeholder="Conte o que está no seu coração" required />
              <button className="btn" type="submit">Enviar pedido</button>
            </form>
          </section>

          <section className="card">
            <div className="section-head"><h2>Notificações</h2></div>
            <div className="mini-list">
              {notifications.data?.length ? notifications.data.map((item) => (
                <div className="mini-item" key={item.id}><strong>{item.title}</strong><span>{item.body || 'Nova atualização disponível.'}</span></div>
              )) : <div className="empty compact">Você está em dia.</div>}
            </div>
          </section>
        </aside>
      </section>
    </>
  );
}
