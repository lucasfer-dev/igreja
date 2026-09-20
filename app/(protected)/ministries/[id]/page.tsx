import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireChurch } from '@/lib/auth';
import { addMinistryMember } from './actions';

export default async function MinistryDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {supabase,churchId}=await requireChurch();
 const [{data:ministry},{data:members},{data:allMembers},{data:schedules}]=await Promise.all([
  supabase.from('ministries').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
  supabase.from('ministry_members').select('member_id,role_name,active,church_members(full_name,phone)').eq('ministry_id',id).eq('active',true),
  supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name'),
  supabase.from('volunteer_schedules').select('id,function_name,starts_at,status,church_members(full_name),events(title)').eq('church_id',churchId).eq('ministry_id',id).gte('starts_at',new Date().toISOString()).order('starts_at').limit(20),
 ]);
 if(!ministry)notFound();const add=addMinistryMember.bind(null,id);
 return <><header className="topbar"><div className="title"><Link className="back-link" href="/ministries">← Ministérios</Link><span className="eyebrow">Ministério</span><h1>{ministry.name}</h1><p>{ministry.description||'Equipe ministerial da igreja.'}</p></div></header><section className="content-grid admin-grid"><div className="stack"><section className="card"><div className="section-head"><h2>Equipe</h2><span className="badge">{members?.length||0} integrantes</span></div>{members?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Nome</th><th>Função</th><th>Contato</th></tr></thead><tbody>{members.map((r:any)=><tr key={r.member_id}><td><Link className="table-link" href={'/members/'+r.member_id}>{r.church_members?.full_name||'Membro'}</Link></td><td>{r.role_name||'Integrante'}</td><td>{r.church_members?.phone||'—'}</td></tr>)}</tbody></table></div>:<div className="empty">Nenhum integrante.</div>}</section><section className="card"><h2>Próximas escalas</h2>{schedules?.length?schedules.map((s:any)=><div className="mini-item" key={s.id}><strong>{s.church_members?.full_name||'Voluntário'} • {s.function_name}</strong><span>{s.events?.title||'Evento'} • {new Date(s.starts_at).toLocaleString('pt-BR')} • {s.status}</span></div>):<div className="empty compact">Sem escalas futuras.</div>}</section></div><aside className="card sticky-card"><h2>Adicionar integrante</h2><form action={add} className="form"><div className="field"><label>Membro</label><select name="member_id" required><option value="">Selecione</option>{allMembers?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div><div className="field"><label>Função</label><input name="role_name" placeholder="Líder, vocal, mídia..."/></div><button className="btn" type="submit">Adicionar à equipe</button></form></aside></section></>;
}
