import { CalendarDays, Newspaper, Pin } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function NewsPage(){
  const {supabase,churchId,churchShortName}=await requireChurch();
  const now=new Date().toISOString();
  const {data:news}=await supabase.from('news_posts')
    .select('id,title,summary,body,cover_url,featured,published_at,category')
    .eq('church_id',churchId).eq('published',true).lte('published_at',now).in('audience',['all','members'])
    .order('featured',{ascending:false}).order('published_at',{ascending:false}).limit(50);

  const featured=news?.find(item=>item.featured)||news?.[0];
  const rest=(news||[]).filter(item=>item.id!==featured?.id);

  return <div className="news-portal">
    <header className="module-heading"><div><span className="module-kicker">Últimas da {churchShortName}</span><h1>Notícias</h1><p>Novidades, comunicados e histórias da nossa comunidade.</p></div></header>

    {featured&&<article className="news-feature">
      <div className="news-feature-media" style={featured.cover_url?{backgroundImage:`linear-gradient(180deg,rgba(82,36,2,.05),rgba(82,36,2,.72)),url("${featured.cover_url}")`}:undefined}>
        {!featured.cover_url&&<Newspaper size={42}/>}
        <span><Pin size={13}/> Destaque</span>
      </div>
      <div className="news-feature-copy"><span className="news-category">{featured.category||'Igreja'}</span><h2>{featured.title}</h2>{featured.summary&&<p className="news-summary">{featured.summary}</p>}<p>{featured.body}</p><small><CalendarDays size={12}/> {new Date(featured.published_at).toLocaleString('pt-BR')}</small></div>
    </article>}

    {rest.length?<section className="news-grid">{rest.map(item=><article className="news-card" key={item.id}>
      <div className="news-card-media" style={item.cover_url?{backgroundImage:`url("${item.cover_url}")`}:undefined}>{!item.cover_url&&<Newspaper size={24}/>}</div>
      <div><span className="news-category">{item.category||'Igreja'}</span><h2>{item.title}</h2>{item.summary&&<p className="news-summary">{item.summary}</p>}<p>{item.body}</p><small><CalendarDays size={12}/> {new Date(item.published_at).toLocaleString('pt-BR')}</small></div>
    </article>)}</section>:!featured?<div className="panel empty">Nenhuma notícia publicada ainda.</div>:null}
  </div>;
}
