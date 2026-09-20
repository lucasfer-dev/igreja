import { Image as ImageIcon, Megaphone, MessageSquareText } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createPost } from './actions';

export default async function FeedPage() {
  const { supabase, churchId, roleKey } = await requireChurch();
  const { data: posts } = await supabase.from('posts')
    .select('id,title,body,post_type,media_url,published_at,author_user_id')
    .eq('church_id', churchId).eq('published', true)
    .order('published_at', { ascending: false }).limit(30);

  const canPublish = roleKey !== 'member';

  return <>
    <header className="topbar"><div className="title"><span className="eyebrow">Comunidade</span><h1>Mural da igreja</h1><p>Avisos, testemunhos, fotos e novidades em um só lugar.</p></div></header>
    <section className="feed-layout">
      <div className="stack">
        {posts?.length ? posts.map(post => <article className="card feed-post" key={post.id}>
          <div className="feed-meta"><span className="metric-icon">{post.post_type==='announcement'?<Megaphone size={18}/>:<MessageSquareText size={18}/>}</span><div><strong>{post.title || 'Publicação'}</strong><span>{new Date(post.published_at).toLocaleString('pt-BR')}</span></div></div>
          <p>{post.body}</p>
          {post.media_url && <a className="media-link" href={post.media_url} target="_blank" rel="noreferrer"><ImageIcon size={16}/> Abrir mídia</a>}
        </article>) : <div className="card empty">O mural ainda não possui publicações.</div>}
      </div>
      {canPublish && <aside className="card sticky-card"><span className="eyebrow">Nova publicação</span><h2>Publicar no mural</h2><form action={createPost} className="form">
        <div className="field"><label htmlFor="title">Título</label><input id="title" name="title"/></div>
        <div className="field"><label htmlFor="post_type">Tipo</label><select id="post_type" name="post_type" defaultValue="post"><option value="post">Publicação</option><option value="announcement">Aviso</option><option value="testimony">Testemunho</option><option value="verse">Versículo</option></select></div>
        <div className="field"><label htmlFor="body">Conteúdo</label><textarea id="body" name="body" rows={7} required/></div>
        <div className="field"><label htmlFor="media_url">Link de imagem/vídeo</label><input id="media_url" name="media_url" type="url"/></div>
        <button className="btn" type="submit">Publicar</button>
      </form></aside>}
    </section>
  </>;
}
