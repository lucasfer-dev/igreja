import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock3, ListMusic, Music2, UserRoundCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireChurch } from '@/lib/auth';
import { addSongToSet, updateSetStatus } from '../../actions';

export default async function WorshipSetDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {supabase,churchId}=await requireChurch();
  const [{data:set},{data:rows},{data:songs},{data:schedules},{data:leader}]=await Promise.all([
    supabase.from('worship_sets').select('*,events(id,title,starts_at)').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('worship_set_songs').select('set_id,song_id,position,transpose_to,notes,songs(id,title,artist,key,bpm,meter,category,duration_seconds,lyrics,chords,link_url)').eq('set_id',id).order('position'),
    supabase.from('songs').select('id,title,artist,key').eq('church_id',churchId).eq('active',true).order('title'),
    supabase.from('volunteer_schedules').select('id,event_id,function_name,status,church_members(full_name),ministries(name)').eq('church_id',churchId),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId),
  ]);
  if(!set)notFound();
  const team=set.event_id?(schedules||[]).filter((s:any)=>s.event_id===set.event_id):[];
  const leaderName=leader?.find(m=>m.id===set.leader_member_id)?.full_name;
  const add=addSongToSet.bind(null,id);
  const status=updateSetStatus.bind(null,id);
  const duration=(rows||[]).reduce((a:any,r:any)=>a+Number(r.songs?.duration_seconds||0),0);

  return <>
    <Link className="creation-back" href="/worship"><ArrowLeft size={15}/> Louvor</Link>
    <header className="worship-set-heading"><div><span className={'module-status '+(set.status==='ready'?'active':'inactive')}>{set.status}</span><h1>{set.title}</h1><div className="workspace-meta"><span><CalendarDays size={14}/>{set.scheduled_at?new Date(set.scheduled_at).toLocaleString('pt-BR'):'Sem data'}</span><span><UserRoundCheck size={14}/>{leaderName||'Líder não definido'}</span>{set.rehearsal_at&&<span><Clock3 size={14}/>Ensaio {new Date(set.rehearsal_at).toLocaleString('pt-BR')}</span>}</div></div><form action={status}><select name="status" defaultValue={set.status}><option value="draft">Rascunho</option><option value="ready">Pronto</option><option value="completed">Concluído</option></select><button type="submit">Atualizar</button></form></header>
    <nav className="workspace-tabs"><a className="active" href="#order">Ordem</a><a href="#team">Equipe</a><a href="#notes">Observações</a></nav>
    <section className="workspace-summary"><div><ListMusic size={18}/><strong>{rows?.length||0}</strong><span>Músicas</span></div><div><Clock3 size={18}/><strong>{duration?Math.round(duration/60)+' min':'—'}</strong><span>Duração estimada</span></div><div><UserRoundCheck size={18}/><strong>{team.length}</strong><span>Escalados</span></div><div><CalendarDays size={18}/><strong>{team.filter((s:any)=>s.status==='confirmed').length}</strong><span>Confirmados</span></div></section>
    <section className="worship-set-grid">
      <div className="stack">
        <section id="order" className="panel"><div className="section-title"><div><span className="section-eyebrow">Ordem do louvor</span><h2>Setlist</h2></div><span className="section-count">{rows?.length||0}</span></div>{rows?.length?<div className="worship-full-order">{rows.map((r:any)=><article key={r.song_id}><span className="worship-order-number">{r.position}</span><div><strong>{r.songs?.title}</strong><span>{r.songs?.artist||'Sem artista'}{r.songs?.category?' • '+r.songs.category:''}</span><small>{r.notes||'Sem observações específicas.'}</small></div><div className="worship-song-metrics"><span><b>{r.transpose_to||r.songs?.key||'—'}</b> tom</span><span><b>{r.songs?.bpm||'—'}</b> BPM</span><span><b>{r.songs?.meter||'—'}</b> compasso</span></div></article>)}</div>:<div className="empty compact">Ainda não há músicas no plano.</div>}</section>
        <section id="team" className="panel"><div className="section-title"><div><span className="section-eyebrow">Equipe</span><h2>Escalados para o culto</h2></div><Link href="/volunteers">Gerenciar escalas</Link></div>{team.length?<div className="team-roster">{team.map((s:any)=><div className="worship-team-detail" key={s.id}><span className="person-dot">{s.church_members?.full_name?.slice(0,1)||'?'}</span><div><strong>{s.church_members?.full_name||'Voluntário'}</strong><span>{s.function_name} • {s.ministries?.name||'Equipe'}</span></div><span className={'schedule-state '+s.status}>{s.status}</span></div>)}</div>:<div className="empty compact">Vincule o plano a um evento com escalas para visualizar a equipe aqui.</div>}</section>
      </div>
      <aside className="stack"><section className="panel"><div className="section-title"><div><span className="section-eyebrow">Setlist</span><h2>Adicionar música</h2></div><Music2 size={18}/></div><form action={add} className="form"><div className="field"><label>Música</label><select name="song_id" required><option value="">Selecione</option>{songs?.map(s=><option value={s.id} key={s.id}>{s.title}{s.artist?' — '+s.artist:''}</option>)}</select></div><div className="field"><label>Tom neste culto</label><input name="transpose_to" placeholder="Ex.: A"/></div><div className="field"><label>Observação</label><textarea name="notes" rows={3} placeholder="Entrada, dinâmica, sequência..."/></div><button className="primary-submit" type="submit">Adicionar ao plano</button></form></section><section id="notes" className="panel"><div className="section-title"><div><span className="section-eyebrow">Preparação</span><h2>Observações do plano</h2></div></div><p className="worship-plan-notes">{set.notes||'Nenhuma observação cadastrada.'}</p></section></aside>
    </section>
  </>;
}
