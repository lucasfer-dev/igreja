import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireChurch } from '@/lib/auth';
import { addCellMember, recordCellAttendance, setCellLeadership } from './actions';

export default async function CellDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params; const {supabase,churchId}=await requireChurch();
  const [{data:cell},{data:members},{data:allMembers},{data:attendance}]=await Promise.all([
    supabase.from('cells').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('cell_members').select('member_id,joined_at,active,church_members(id,full_name,phone)').eq('cell_id',id).eq('active',true),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name'),
    supabase.from('attendances').select('id,member_id,occurred_at,church_members(full_name)').eq('church_id',churchId).eq('cell_id',id).order('occurred_at',{ascending:false}).limit(50),
  ]);
  if(!cell)notFound();
  const add=addCellMember.bind(null,id),lead=setCellLeadership.bind(null,id),record=recordCellAttendance.bind(null,id);
  return <><header className="topbar"><div className="title"><Link className="back-link" href="/cells">← Células</Link><span className="eyebrow">Pequeno grupo</span><h1>{cell.name}</h1><p>{cell.address||'Local não informado'} • {cell.starts_at||'horário não definido'}</p></div></header>
  <section className="content-grid admin-grid"><div className="stack">
    <section className="card"><div className="section-head"><h2>Participantes</h2><span className="badge">{members?.length||0} ativos</span></div>{members?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Nome</th><th>Contato</th><th>Desde</th></tr></thead><tbody>{members.map((r:any)=><tr key={r.member_id}><td><Link className="table-link" href={'/members/'+r.member_id}>{r.church_members?.full_name||'Membro'}</Link></td><td>{r.church_members?.phone||'—'}</td><td>{new Date(r.joined_at+'T12:00:00').toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div>:<div className="empty">Nenhum participante ainda.</div>}</section>
    <section className="card"><h2>Registrar presença de hoje</h2><form action={record} className="checklist-form">{members?.length?members.map((r:any)=><label className="check-row" key={r.member_id}><input type="checkbox" name="member_id" value={r.member_id}/><span>{r.church_members?.full_name||'Membro'}</span></label>):<div className="empty compact">Adicione participantes antes de registrar presença.</div>} {members?.length?<button className="btn" type="submit">Registrar presença</button>:null}</form></section>
    <section className="card"><h2>Presenças recentes</h2>{attendance?.length?attendance.slice(0,12).map((a:any)=><div className="mini-item" key={a.id}><strong>{a.church_members?.full_name||'Membro'}</strong><span>{new Date(a.occurred_at).toLocaleString('pt-BR')}</span></div>):<div className="empty compact">Nenhuma presença registrada.</div>}</section>
  </div><aside className="stack">
    <section className="card"><h2>Adicionar participante</h2><form action={add} className="form"><div className="field"><label>Membro</label><select name="member_id" required><option value="">Selecione</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><button className="btn" type="submit">Adicionar</button></form></section>
    <section className="card"><h2>Liderança</h2><form action={lead} className="form"><div className="field"><label>Líder</label><select name="leader_member_id" defaultValue={cell.leader_member_id||''}><option value="">Sem líder</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><div className="field"><label>Vice-líder</label><select name="co_leader_member_id" defaultValue={cell.co_leader_member_id||''}><option value="">Sem vice</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><div className="field"><label>Anfitrião</label><select name="host_member_id" defaultValue={cell.host_member_id||''}><option value="">Sem anfitrião</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><button className="btn secondary" type="submit">Salvar liderança</button></form></section>
  </aside></section></>;
}
