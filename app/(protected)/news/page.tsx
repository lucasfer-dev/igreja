import { CalendarDays, Newspaper, Pin } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function NewsPage(){
  const {supabase,churchId}=await requireChurch();
  const {data:news}=await supabase.from('news_posts').select('id,title,summary,body,cover_url,featured,published_at')
    .eq('church_id',churchId).eq('published',true).order('featured',{ascending:false}).order('published_at',{ascending:false}).limit(50);

  return <>
    <header className="module-heading"><div><span className="module-kicker">Comunidade</span><h1>Notícias</h1><p>Novidades, comunicados e histórias da sua igreja.</p></div></header>
    <section className="content-cards">
      {news?.length?news.map(item=><article className="card content-card" key={item.id}>
        <span className="metric-icon">{item.featured?<Pin size={20}/>:<Newspaper size={20}/>}</span>
        <div>
          <span className="eyebrow">{item.featured?'Destaque':'Notícia'}</span>
          <h2>{item.title}</h2>
          {item.summary&&<p><strong>{item.summary}</strong></p>}
          <p>{item.body}</p>
          <small><CalendarDays size={12}/> {new Date(item.published_at).toLocaleString('pt-BR')}</small>
          {item.cover_url&&<a className="btn secondary" href={item.cover_url} target="_blank" rel="noreferrer">Abrir mídia</a>}
        </div>
      </article>):<div className="card empty">Nenhuma notícia publicada ainda.</div>}
    </section>
  </>;
}
