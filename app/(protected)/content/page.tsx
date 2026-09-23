import { BookOpen, Headphones, PlayCircle, FileText } from 'lucide-react';
import { hasPermission, requireChurch } from '@/lib/auth';
import { createContent } from './actions';

function Icon({type}:{type:string}) {
  if(type==='video') return <PlayCircle size={20}/>;
  if(type==='audio'||type==='sermon') return <Headphones size={20}/>;
  if(type==='pdf') return <FileText size={20}/>;
  return <BookOpen size={20}/>;
}

export default async function ContentPage({searchParams}:{searchParams:Promise<{category?:string}>}) {
  const params=await searchParams;
  const context=await requireChurch();
  const {supabase,churchId}=context;
  let query=supabase.from('content_library').select('*').eq('church_id',churchId).eq('published',true).order('published_at',{ascending:false});
  if(params.category) query=query.eq('category',params.category);
  const {data}=await query.limit(50);
  const canManage=await hasPermission(context,'content.manage');

  return <><header className="topbar"><div className="title"><span className="eyebrow">Biblioteca</span><h1>Conteúdos</h1><p>Pregações, estudos, devocionais, vídeos, áudios e materiais.</p></div></header>
  <section className={canManage?'content-grid admin-grid':''}><div className="content-cards">{data?.length?data.map(item=><article className="card content-card" key={item.id}><span className="metric-icon"><Icon type={item.content_type}/></span><div><span className="eyebrow">{item.category||item.content_type}</span><h2>{item.title}</h2><p>{item.description||'Conteúdo da igreja.'}</p>{(item.url||item.media_url)&&<a className="btn secondary" href={item.url||item.media_url} target="_blank" rel="noreferrer">Abrir conteúdo</a>}</div></article>):<div className="card empty">Nenhum conteúdo publicado ainda.</div>}</div>
  {canManage&&<aside className="card sticky-card"><span className="eyebrow">Biblioteca</span><h2>Novo conteúdo</h2><form action={createContent} className="form"><div className="field"><label>Título</label><input name="title" required/></div><div className="field"><label>Categoria</label><input name="category" placeholder="Pregações, Devocionais..."/></div><div className="field"><label>Tipo</label><select name="content_type" defaultValue="article"><option value="article">Artigo</option><option value="sermon">Pregação</option><option value="video">Vídeo</option><option value="audio">Áudio</option><option value="pdf">PDF</option><option value="course">Curso</option></select></div><div className="field"><label>Descrição</label><textarea name="description" rows={4}/></div><div className="field"><label>Link</label><input name="url" type="url"/></div><div className="field"><label>Mídia</label><input name="media_url" type="url"/></div><button className="btn" type="submit">Publicar conteúdo</button></form></aside>}</section></>;
}
