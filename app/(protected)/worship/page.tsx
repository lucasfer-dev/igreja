import Link from 'next/link';
import { CalendarDays, Clock3, ListMusic, Music2, Plus, Search, UserRoundCheck } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function Worship(){
  const {supabase,churchId}=await requireChurch();
  const now=new Date().toISOString();

  const [{data:songs},{data:sets},{data:setSongs},{data:schedules},{data:members}]=await Promise.all([
    supabase.from('songs').select('*').eq('church_id',churchId).eq('active',true).order('title'),
    supabase.from('worship_sets').select('id,title,event_id,leader_member_id,scheduled_at,rehearsal_at,status,notes,events(title)').eq('church_id',churchId).order('scheduled_at',{ascending:false}),
    supabase.from('worship_set_songs').select('set_id,position,transpose_to,songs(id,title,artist,key,bpm,meter,category,duration_seconds)').order('position'),
    supabase.from('volunteer_schedules').select('id,event_id,status,starts_at,church_members(full_name),ministries(name)').eq('church_id',churchId).gte('starts_at',now),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId),
  ]);

  const upcoming=(sets||[]).filter(s=>s.scheduled_at&&new Date(s.scheduled_at)>=new Date()).sort((a,b)=>new Date(a.scheduled_at!).getTime()-new Date(b.scheduled_at!).getTime());
  const next=upcoming[0];
  const nextSongs=next?(setSongs||[]).filter((r:any)=>r.set_id===next.id):[];
  const nextTeam=next?.event_id?(schedules||[]).filter((s:any)=>s.event_id===next.event_id):[];
  const leaderName=members?.find(m=>m.id===next?.leader_member_id)?.full_name;
  const categories=[...new Set((songs||[]).map(s=>s.category).filter(Boolean))];

  return <>
    <header className="module-heading">
      <div><span className="module-kicker">Cultos & operação</span><h1>Louvor</h1><p>Planeje repertório, preparação e equipe a partir do culto — não apenas de uma lista de músicas.</p></div>
      <div className="giving-actions"><Link className="module-primary" href="/worship/sets/new"><Plus size={16}/> Novo plano</Link><Link className="module-secondary" href="/worship/songs/new"><Music2 size={16}/> Nova música</Link></div>
    </header>

    <section className="worship-summary">
      <div><ListMusic size={19}/><strong>{songs?.length||0}</strong><span>Músicas na biblioteca</span></div>
      <div><CalendarDays size={19}/><strong>{upcoming.length}</strong><span>Planos futuros</span></div>
      <div><UserRoundCheck size={19}/><strong>{nextTeam.filter((s:any)=>s.status==='confirmed').length}</strong><span>Confirmados no próximo culto</span></div>
      <div><Clock3 size={19}/><strong>{next?.rehearsal_at?new Date(next.rehearsal_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'—'}</strong><span>Próximo ensaio</span></div>
    </section>

    {next?<section className="worship-next-plan">
      <div className="worship-plan-head"><div><span className="module-status active">{next.status}</span><span className="module-kicker">Próximo plano</span><h2>{next.title}</h2><p>{next.scheduled_at?new Date(next.scheduled_at).toLocaleString('pt-BR',{dateStyle:'long',timeStyle:'short'}):'Sem data'}{leaderName?' • Líder: '+leaderName:''}</p></div><Link href={'/worship/sets/'+next.id}>Abrir plano →</Link></div>
      <div className="worship-plan-body">
        <div className="worship-order-preview"><div className="section-title"><div><span className="section-eyebrow">Ordem</span><h3>Setlist</h3></div><span className="section-count">{nextSongs.length}</span></div>{nextSongs.length?nextSongs.map((row:any)=><div className="worship-order-row" key={row.songs?.id}><span className="worship-order-number">{row.position}</span><div><strong>{row.songs?.title}</strong><span>{row.songs?.artist||'Sem artista'}{row.songs?.bpm?' • '+row.songs.bpm+' BPM':''}{row.songs?.meter?' • '+row.songs.meter:''}</span></div><span className="worship-key">{row.transpose_to||row.songs?.key||'—'}</span></div>):<div className="empty compact">Adicione músicas ao plano.</div>}</div>
        <div className="worship-team-preview"><div className="section-title"><div><span className="section-eyebrow">Equipe</span><h3>Escalados</h3></div></div>{nextTeam.length?nextTeam.slice(0,7).map((s:any)=><div className="worship-team-row" key={s.id}><span className="person-dot">{s.church_members?.full_name?.slice(0,1)||'?'}</span><div><strong>{s.church_members?.full_name||'Voluntário'}</strong><span>{s.ministries?.name||'Equipe'}</span></div><span className={'schedule-state '+s.status}>{s.status}</span></div>):<div className="empty compact">Nenhuma escala ligada ao evento deste plano.</div>}</div>
      </div>
    </section>:<section className="module-empty-state"><ListMusic size={34}/><h2>Nenhum plano futuro</h2><p>Crie o próximo plano de culto para organizar repertório e preparação.</p><Link href="/worship/sets/new">Criar primeiro plano</Link></section>}

    <section className="worship-library-section">
      <div className="giving-section-head"><div><span>BIBLIOTECA</span><h2>Repertório da igreja</h2></div><Link href="/worship/songs/new">Adicionar música</Link></div>
      <div className="worship-library-toolbar"><div><Search size={15}/><span>{songs?.length||0} músicas</span></div><div className="worship-tags">{categories.slice(0,6).map(c=><span key={c}>{c}</span>)}</div></div>
      {songs?.length?<div className="worship-song-table"><div className="worship-song-head"><span>Música</span><span>Tom</span><span>BPM</span><span>Compasso</span><span>Categoria</span></div>{songs.slice(0,18).map(song=><div className="worship-song-row" key={song.id}><div><span className="worship-song-icon"><Music2 size={16}/></span><div><strong>{song.title}</strong><small>{song.artist||'Sem artista'}</small></div></div><strong>{song.key||'—'}</strong><span>{song.bpm||'—'}</span><span>{song.meter||'—'}</span><span className="soft-status">{song.category||'Sem categoria'}</span></div>)}</div>:<div className="module-empty-state"><Music2 size={34}/><h2>Biblioteca vazia</h2><p>Cadastre as músicas usadas pela equipe de louvor.</p><Link href="/worship/songs/new">Cadastrar música</Link></div>}
    </section>
  </>;
}
