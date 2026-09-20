import { notFound } from 'next/navigation';
import { requireChurch } from '@/lib/auth';
import { addMemberHistory, updateMember } from '../actions';

export default async function MemberDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{error?:string}> }) {
  const { id } = await params; const query=await searchParams;
  const { supabase, churchId } = await requireChurch();
  const [{data:member},{data:history},{data:cells},{data:ministries},{data:attendance}] = await Promise.all([
    supabase.from('church_members').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('member_history').select('id,type,title,description,occurred_at').eq('church_id',churchId).eq('member_id',id).order('occurred_at',{ascending:false}).limit(30),
    supabase.from('cell_members').select('joined_at,active,cells(name)').eq('member_id',id),
    supabase.from('ministry_members').select('role_name,active,ministries(name)').eq('member_id',id),
    supabase.from('attendances').select('id,occurred_at,source,events(title),cells(name)').eq('church_id',churchId).eq('member_id',id).order('occurred_at',{ascending:false}).limit(20),
  ]);
  if(!member)notFound();
  const save=updateMember.bind(null,id); const addHistory=addMemberHistory.bind(null,id);
  return <><header className="topbar"><div className="title"><span className="eyebrow">Membro</span><h1>{member.full_name}</h1><p>{member.email||member.phone||'Cadastro sem contato'} • <span className="badge">{member.status}</span></p></div></header>
  {query.error&&<p className="alert">{query.error}</p>}
  <section className="member-layout"><div className="stack">
    <section className="card"><div className="section-head"><h2>Dados cadastrais</h2></div><form action={save} className="form">
      <div className="field"><label>Nome completo</label><input name="full_name" defaultValue={member.full_name} required/></div>
      <div className="form-row"><div className="field"><label>E-mail</label><input name="email" type="email" defaultValue={member.email||''}/></div><div className="field"><label>Telefone</label><input name="phone" defaultValue={member.phone||''}/></div></div>
      <div className="form-row"><div className="field"><label>WhatsApp</label><input name="whatsapp" defaultValue={member.whatsapp||''}/></div><div className="field"><label>Nascimento</label><input name="birth_date" type="date" defaultValue={member.birth_date||''}/></div></div>
      <div className="form-row"><div className="field"><label>CPF</label><input name="cpf" defaultValue={member.cpf||''}/></div><div className="field"><label>Situação</label><select name="status" defaultValue={member.status}><option value="visitor">Visitante</option><option value="attendee">Frequentador</option><option value="member">Membro</option><option value="leader">Líder</option><option value="volunteer">Voluntário</option><option value="inactive">Inativo</option></select></div></div>
      <div className="field"><label>Endereço</label><input name="address" defaultValue={member.address||''}/></div>
      <div className="form-row"><div className="field"><label>Estado civil</label><input name="marital_status" defaultValue={member.marital_status||''}/></div><div className="field"><label>Profissão</label><input name="profession" defaultValue={member.profession||''}/></div></div>
      <div className="form-row"><div className="field"><label>Sexo</label><select name="gender" defaultValue={member.gender||''}><option value="">Não informar</option><option value="female">Feminino</option><option value="male">Masculino</option></select></div><div className="field"><label>Entrada</label><input name="joined_at" type="date" defaultValue={member.joined_at||''}/></div></div>
      <div className="form-row"><div className="field"><label>Conversão</label><input name="conversion_date" type="date" defaultValue={member.conversion_date||''}/></div><div className="field"><label>Batismo</label><input name="baptism_date" type="date" defaultValue={member.baptism_date||''}/></div></div>
      <div className="form-row"><div className="field"><label>Contato emergência</label><input name="emergency_contact_name" defaultValue={member.emergency_contact_name||''}/></div><div className="field"><label>Telefone emergência</label><input name="emergency_contact_phone" defaultValue={member.emergency_contact_phone||''}/></div></div>
      <div className="field"><label>Observações</label><textarea name="notes" rows={4} defaultValue={member.notes||''}/></div><button className="btn" type="submit">Salvar alterações</button>
    </form></section>
    <section className="card"><div className="section-head"><h2>Histórico</h2></div><div className="timeline">{history?.length?history.map(item=><article key={item.id}><i></i><div><strong>{item.title}</strong><span>{new Date(item.occurred_at).toLocaleString('pt-BR')} • {item.type}</span>{item.description&&<p>{item.description}</p>}</div></article>):<div className="empty compact">Sem histórico ainda.</div>}</div></section>
  </div><aside className="stack">
    <section className="card"><h2>Vínculos</h2><h3 className="subhead">Células</h3>{cells?.length?cells.map((r:any)=><div className="mini-item" key={r.cells?.name}><strong>{r.cells?.name}</strong><span>{r.active?'Ativo':'Inativo'}</span></div>):<div className="empty compact">Sem célula.</div>}<h3 className="subhead aside-gap">Ministérios</h3>{ministries?.length?ministries.map((r:any)=><div className="mini-item" key={r.ministries?.name}><strong>{r.ministries?.name}</strong><span>{r.role_name||'Integrante'}</span></div>):<div className="empty compact">Sem ministério.</div>}</section>
    <section className="card"><h2>Presenças recentes</h2>{attendance?.length?attendance.map((a:any)=><div className="mini-item" key={a.id}><strong>{a.events?.title||a.cells?.name||'Presença registrada'}</strong><span>{new Date(a.occurred_at).toLocaleString('pt-BR')} • {a.source}</span></div>):<div className="empty compact">Nenhuma presença registrada.</div>}</section>
    <section className="card"><h2>Adicionar ao histórico</h2><form action={addHistory} className="form"><div className="field"><label>Tipo</label><select name="type" defaultValue="note"><option value="note">Observação</option><option value="pastoral">Acompanhamento</option><option value="course">Curso</option><option value="baptism">Batismo</option><option value="volunteer">Voluntariado</option></select></div><div className="field"><label>Título</label><input name="title" required/></div><div className="field"><label>Descrição</label><textarea name="description" rows={3}/></div><button className="btn secondary" type="submit">Registrar</button></form></section>
  </aside></section></>;
}
