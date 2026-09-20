import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, UserRound, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { addCellMember, recordCellAttendance, setCellLeadership } from './actions';

export default async function CellDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {supabase,churchId}=await requireChurch();
  const [{data:cell},{data:members},{data:allMembers},{data:attendance}] = await Promise.all([
    supabase.from('cells').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('cell_members').select('member_id,joined_at,active,church_members(id,full_name,phone)').eq('cell_id',id).eq('active',true),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name'),
    supabase.from('attendances').select('id,member_id,occurred_at,church_members(full_name)').eq('church_id',churchId).eq('cell_id',id).order('occurred_at',{ascending:false}).limit(50),
  ]);
  if(!cell)notFound();

  const add=addCellMember.bind(null,id),lead=setCellLeadership.bind(null,id),record=recordCellAttendance.bind(null,id);
  const leader=allMembers?.find(m=>m.id===cell.leader_member_id);
  const coLeader=allMembers?.find(m=>m.id===cell.co_leader_member_id);
  const host=allMembers?.find(m=>m.id===cell.host_member_id);

  return <>
    <Link className="creation-back" href="/cells">← Todas as células</Link>
    <header className="workspace-heading">
      <div><span className="module-status active">Ativa</span><h1>{cell.name}</h1><div className="workspace-meta"><span><CalendarDays size={14}/>{cell.starts_at?String(cell.starts_at).slice(0,5):'Horário não definido'}</span><span><MapPin size={14}/>{cell.address||'Local não informado'}</span></div></div>
    </header>

    <nav className="workspace-tabs"><a className="active" href="#overview">Visão geral</a><a href="#people">Pessoas</a><a href="#attendance">Presença</a><a href="#leadership">Liderança</a></nav>

    <section id="overview" className="workspace-summary">
      <div><UsersRound size={18}/><strong>{members?.length||0}</strong><span>Participantes</span></div>
      <div><UserRound size={18}/><strong>{leader?.full_name||'—'}</strong><span>Líder</span></div>
      <div><CalendarDays size={18}/><strong>{attendance?.length||0}</strong><span>Presenças registradas</span></div>
      <div><MapPin size={18}/><strong>{cell.capacity||'—'}</strong><span>Capacidade</span></div>
    </section>

    <section className="workspace-grid">
      <div className="stack">
        <section id="people" className="panel"><div className="section-title"><div><span className="section-eyebrow">Equipe da célula</span><h2>Participantes</h2></div><span className="section-count">{members?.length||0}</span></div>{members?.length?<div className="workspace-people">{members.map((r:any)=><Link href={'/members/'+r.member_id} key={r.member_id}><span className="person-dot">{r.church_members?.full_name?.slice(0,1)||'?'}</span><div><strong>{r.church_members?.full_name||'Membro'}</strong><span>{r.church_members?.phone||'Sem telefone'}</span></div><small>desde {new Date(r.joined_at+'T12:00:00').toLocaleDateString('pt-BR')}</small></Link>)}</div>:<div className="empty compact">Nenhum participante ainda.</div>}</section>

        <section id="attendance" className="panel"><div className="section-title"><div><span className="section-eyebrow">Encontro</span><h2>Registrar presença</h2></div></div><form action={record} className="attendance-worklist">{members?.map((r:any)=><label key={r.member_id}><input type="checkbox" name="member_id" value={r.member_id}/><span className="person-dot">{r.church_members?.full_name?.slice(0,1)||'?'}</span><strong>{r.church_members?.full_name||'Membro'}</strong></label>)}{members?.length?<button className="primary-submit" type="submit">Salvar presença de hoje</button>:<div className="empty compact">Adicione participantes primeiro.</div>}</form></section>

        <section className="panel"><div className="section-title"><div><span className="section-eyebrow">Histórico</span><h2>Presenças recentes</h2></div></div>{attendance?.length?<div className="attendance-history">{attendance.slice(0,12).map((a:any)=><div key={a.id}><span className="person-dot">{a.church_members?.full_name?.slice(0,1)||'?'}</span><strong>{a.church_members?.full_name||'Membro'}</strong><small>{new Date(a.occurred_at).toLocaleString('pt-BR')}</small></div>)}</div>:<div className="empty compact">Nenhuma presença registrada.</div>}</section>
      </div>

      <aside className="stack">
        <section className="panel"><h2 className="panel-title">Adicionar participante</h2><form action={add} className="form"><div className="field"><label>Membro</label><select name="member_id" required><option value="">Selecione uma pessoa</option>{allMembers?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div><button className="primary-submit" type="submit">Adicionar à célula</button></form></section>

        <section id="leadership" className="panel"><div className="section-title"><div><span className="section-eyebrow">Responsáveis</span><h2>Liderança</h2></div></div><div className="leadership-preview"><div><small>Líder</small><strong>{leader?.full_name||'Não definido'}</strong></div><div><small>Vice-líder</small><strong>{coLeader?.full_name||'Não definido'}</strong></div><div><small>Anfitrião</small><strong>{host?.full_name||'Não definido'}</strong></div></div><form action={lead} className="form compact-form"><div className="field"><label>Líder</label><select name="leader_member_id" defaultValue={cell.leader_member_id||''}><option value="">Sem líder</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><div className="field"><label>Vice-líder</label><select name="co_leader_member_id" defaultValue={cell.co_leader_member_id||''}><option value="">Sem vice</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><div className="field"><label>Anfitrião</label><select name="host_member_id" defaultValue={cell.host_member_id||''}><option value="">Sem anfitrião</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><button className="primary-submit" type="submit">Salvar liderança</button></form></section>
      </aside>
    </section>
  </>;
}
