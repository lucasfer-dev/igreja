import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Church, UserRoundCheck, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { addMinistryMember } from './actions';

export default async function MinistryDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {supabase,churchId}=await requireChurch();
  const [{data:ministry},{data:members},{data:allMembers},{data:schedules}]=await Promise.all([
    supabase.from('ministries').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('ministry_members').select('member_id,role_name,active,church_members(full_name,phone)').eq('ministry_id',id).eq('active',true),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name'),
    supabase.from('volunteer_schedules').select('id,function_name,starts_at,status,church_members(full_name),events(title)').eq('church_id',churchId).eq('ministry_id',id).gte('starts_at',new Date().toISOString()).order('starts_at').limit(20),
  ]);
  if(!ministry)notFound();
  const add=addMinistryMember.bind(null,id);

  return <>
    <Link className="creation-back" href="/ministries">← Todos os ministérios</Link>
    <header className="workspace-heading"><div><span className="module-status active">Ativo</span><h1>{ministry.name}</h1><p>{ministry.description||'Equipe ministerial da igreja.'}</p></div></header>
    <nav className="workspace-tabs"><a className="active" href="#overview">Visão geral</a><a href="#team">Equipe</a><a href="#schedules">Escalas</a></nav>
    <section id="overview" className="workspace-summary">
      <div><UsersRound size={18}/><strong>{members?.length||0}</strong><span>Integrantes</span></div>
      <div><UserRoundCheck size={18}/><strong>{schedules?.filter((s:any)=>s.status==='confirmed').length||0}</strong><span>Escalas confirmadas</span></div>
      <div><CalendarDays size={18}/><strong>{schedules?.length||0}</strong><span>Escalas futuras</span></div>
      <div><Church size={18}/><strong>{members?.filter((m:any)=>String(m.role_name||'').toLowerCase().includes('líder')).length||0}</strong><span>Lideranças</span></div>
    </section>

    <section className="workspace-grid">
      <div className="stack">
        <section id="team" className="panel"><div className="section-title"><div><span className="section-eyebrow">Equipe</span><h2>Integrantes</h2></div><span className="section-count">{members?.length||0}</span></div>{members?.length?<div className="team-roster">{members.map((r:any)=><Link href={'/members/'+r.member_id} key={r.member_id}><span className="person-dot">{r.church_members?.full_name?.slice(0,1)||'?'}</span><div><strong>{r.church_members?.full_name||'Membro'}</strong><span>{r.church_members?.phone||'Sem telefone'}</span></div><span className="soft-status">{r.role_name||'Integrante'}</span></Link>)}</div>:<div className="empty compact">Nenhum integrante.</div>}</section>
        <section id="schedules" className="panel"><div className="section-title"><div><span className="section-eyebrow">Operação</span><h2>Próximas escalas</h2></div><Link href="/volunteers">Gerenciar escalas</Link></div>{schedules?.length?<div className="schedule-worklist">{schedules.map((s:any)=><div key={s.id}><span className="schedule-date-block"><strong>{new Date(s.starts_at).getDate()}</strong><small>{new Date(s.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small></span><div><strong>{s.events?.title||'Evento'}</strong><span>{s.church_members?.full_name||'Voluntário'} • {s.function_name}</span></div><span className={'schedule-state '+s.status}>{s.status}</span></div>)}</div>:<div className="empty compact">Sem escalas futuras.</div>}</section>
      </div>
      <aside className="panel"><div className="section-title"><div><span className="section-eyebrow">Equipe</span><h2>Adicionar integrante</h2></div></div><form action={add} className="form"><div className="field"><label>Pessoa</label><select name="member_id" required><option value="">Selecione</option>{allMembers?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div><div className="field"><label>Função</label><input name="role_name" placeholder="Líder, vocal, mídia..."/></div><button className="primary-submit" type="submit">Adicionar à equipe</button></form></aside>
    </section>
  </>;
}
