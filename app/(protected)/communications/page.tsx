import { Megaphone } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { publishAnnouncement } from './actions';

export default async function CommunicationsPage() {
  const { supabase, churchId } = await requireChurch();
  const { data } = await supabase.from('announcements').select('id,title,body,published_at').eq('church_id', churchId).order('published_at', { ascending: false }).limit(20);

  return (
    <>
      <header className="topbar"><div className="title"><span className="eyebrow">Comunicação</span><h1>Avisos da igreja</h1><p>Publique atualizações que aparecem diretamente no dashboard dos membros.</p></div></header>
      <section className="content-grid admin-grid">
        <div className="card">
          <div className="section-head"><h2>Publicações recentes</h2><span className="metric-icon"><Megaphone size={18} /></span></div>
          <div className="announcement-list">
            {data?.length ? data.map((item) => <article className="announcement" key={item.id}><h3>{item.title}</h3><p>{item.body}</p><small>{new Date(item.published_at).toLocaleString('pt-BR')}</small></article>) : <div className="empty">Nenhum aviso publicado ainda.</div>}
          </div>
        </div>
        <aside className="card sticky-card"><span className="eyebrow">Novo comunicado</span><h2>Publicar aviso</h2><form action={publishAnnouncement} className="form"><div className="field"><label htmlFor="title">Título</label><input id="title" name="title" required /></div><div className="field"><label htmlFor="body">Mensagem</label><textarea id="body" name="body" rows={7} required /></div><button className="btn" type="submit">Publicar para os membros</button></form></aside>
      </section>
    </>
  );
}
