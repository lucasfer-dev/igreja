import Link from 'next/link';
import { requireChurch } from '@/lib/auth';

export default async function Members({ searchParams }: { searchParams: Promise<{q?:string;status?:string}> }) {
  const params=await searchParams; const { supabase, churchId }=await requireChurch();
  let query=supabase.from('church_members').select('id,full_name,email,phone,status,birth_date,created_at').eq('church_id',churchId).order('full_name');
  if(params.status)query=query.eq('status',params.status);
  if(params.q)query=query.ilike('full_name',`%${params.q}%`);
  const {data,error}=await query;
  const month=new Date().getMonth()+1;
  const birthdays=(data||[]).filter(m=>m.birth_date&&Number(String(m.birth_date).slice(5,7))===month);
  return <><header className="topbar"><div className="title"><span className="eyebrow">Pessoas</span><h1>Membros</h1><p>Cadastro, histórico, vínculos e acompanhamento.</p></div><Link className="btn" href="/members/new">Novo membro</Link></header>
  <section className="filter-bar"><form className="filter-form"><input name="q" placeholder="Buscar por nome..." defaultValue={params.q||''}/><select name="status" defaultValue={params.status||''}><option value="">Todas as situações</option><option value="member">Membro</option><option value="leader">Líder</option><option value="volunteer">Voluntário</option><option value="attendee">Frequentador</option><option value="inactive">Inativo</option></select><button className="btn secondary" type="submit">Filtrar</button></form><span className="badge">{birthdays.length} aniversariante(s) no mês</span></section>
  <section className="card">{error?<p className="alert">{error.message}</p>:data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Nome</th><th>Contato</th><th>Situação</th><th>Nascimento</th></tr></thead><tbody>{data.map(member=><tr key={member.id}><td><Link className="table-link" href={'/members/'+member.id}>{member.full_name}</Link></td><td>{member.phone||member.email||'—'}</td><td><span className="badge">{member.status}</span></td><td>{member.birth_date?new Date(member.birth_date+'T12:00:00').toLocaleDateString('pt-BR'):'—'}</td></tr>)}</tbody></table></div>:<div className="empty">Nenhum membro encontrado.</div>}</section></>;
}
