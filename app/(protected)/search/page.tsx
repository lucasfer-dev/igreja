import Link from 'next/link';
import { Search } from 'lucide-react';
import { requireAnyPermission } from '@/lib/auth';

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const params=await searchParams; const q=(params.q||'').trim(); const {supabase,churchId}=await requireAnyPermission(['members.read','visitors.read','cells.read','ministries.read','communications.manage','church.manage']);
  let results:{type:string;title:string;subtitle:string;href:string}[]=[];
  if(q.length>=2){
    const [members,visitors,events,cells,ministries,content]=await Promise.all([
      supabase.from('church_members').select('id,full_name,email,phone').eq('church_id',churchId).ilike('full_name',`%${q}%`).limit(8),
      supabase.from('visitors').select('id,full_name,email,phone').eq('church_id',churchId).ilike('full_name',`%${q}%`).limit(8),
      supabase.from('events').select('id,title,starts_at').eq('church_id',churchId).ilike('title',`%${q}%`).limit(8),
      supabase.from('cells').select('id,name,address').eq('church_id',churchId).ilike('name',`%${q}%`).limit(8),
      supabase.from('ministries').select('id,name,description').eq('church_id',churchId).ilike('name',`%${q}%`).limit(8),
      supabase.from('content_library').select('id,title,category').eq('church_id',churchId).ilike('title',`%${q}%`).limit(8),
    ]);
    results=[
      ...(members.data||[]).map(x=>({type:'Membro',title:x.full_name,subtitle:x.phone||x.email||'',href:'/members/'+x.id})),
      ...(visitors.data||[]).map(x=>({type:'Visitante',title:x.full_name,subtitle:x.phone||x.email||'',href:'/visitors'})),
      ...(events.data||[]).map(x=>({type:'Evento',title:x.title,subtitle:new Date(x.starts_at).toLocaleString('pt-BR'),href:'/events/'+x.id})),
      ...(cells.data||[]).map(x=>({type:'Célula',title:x.name,subtitle:x.address||'',href:'/cells'})),
      ...(ministries.data||[]).map(x=>({type:'Ministério',title:x.name,subtitle:x.description||'',href:'/ministries'})),
      ...(content.data||[]).map(x=>({type:'Conteúdo',title:x.title,subtitle:x.category||'',href:'/content'})),
    ];
  }
  return <><header className="topbar"><div className="title"><span className="eyebrow">Busca global</span><h1>Encontre qualquer coisa</h1><p>Membros, visitantes, eventos, células, ministérios e conteúdos.</p></div></header>
  <section className="card"><form className="global-search"><Search size={18}/><input name="q" autoFocus placeholder="Digite pelo menos 2 letras..." defaultValue={q}/><button className="btn" type="submit">Buscar</button></form></section>
  {q&&<section className="search-results">{results.length?results.map((r,i)=><Link className="card search-result" href={r.href} key={r.type+r.title+i}><span className="badge">{r.type}</span><div><strong>{r.title}</strong><p>{r.subtitle||'Sem detalhes adicionais'}</p></div><span>→</span></Link>):<div className="card empty">Nenhum resultado para “{q}”.</div>}</section>}</>;
}
