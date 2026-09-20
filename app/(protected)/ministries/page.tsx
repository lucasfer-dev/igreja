import Link from 'next/link';
import { Church, Plus, Search, UserRoundCheck, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function Ministries({searchParams}:{searchParams:Promise<{q?:string}>}){
  const params=await searchParams;
  const {supabase,churchId}=await requireChurch();

  let query=supabase.from('ministries').select('id,name,description,active').eq('church_id',churchId).order('name');
  if(params.q) query=query.ilike('name',`%${params.q}%`);

  const [{data,error},{data:members},{data:schedules}]=await Promise.all([
    query,
    supabase.from('ministry_members').select('ministry_id,member_id,active').eq('active',true),
    supabase.from('volunteer_schedules').select('ministry_id,status,starts_at').eq('church_id',churchId).gte('starts_at',new Date().toISOString()),
  ]);

  const peopleCount=new Map<string,number>();
  (members||[]).forEach((m:any)=>peopleCount.set(m.ministry_id,(peopleCount.get(m.ministry_id)||0)+1));
  const scheduleCount=new Map<string,number>();
  (schedules||[]).forEach((s:any)=>s.ministry_id&&scheduleCount.set(s.ministry_id,(scheduleCount.get(s.ministry_id)||0)+1));

  return <>
    <header className="module-heading"><div><span className="module-kicker">Equipes</span><h1>Ministérios</h1><p>Organize equipes, funções, escalas e responsabilidades da igreja.</p></div><Link className="module-primary" href="/ministries/new"><Plus size={16}/> Novo ministério</Link></header>

    <section className="module-summary-row ministry-summary">
      <div><Church size={19}/><strong>{data?.filter(m=>m.active).length||0}</strong><span>Ministérios ativos</span></div>
      <div><UsersRound size={19}/><strong>{members?.length||0}</strong><span>Pessoas em equipes</span></div>
      <div><UserRoundCheck size={19}/><strong>{schedules?.filter(s=>s.status==='confirmed').length||0}</strong><span>Escalas confirmadas</span></div>
    </section>

    <section className="module-toolbar"><form><div className="module-search"><Search size={16}/><input name="q" placeholder="Buscar ministério..." defaultValue={params.q||''}/></div><button type="submit">Buscar</button></form></section>

    {error?<p className="alert">{error.message}</p>:data?.length?<section className="ministry-grid">{data.map(item=><Link href={'/ministries/'+item.id} className="ministry-card" key={item.id}>
      <div className="ministry-card-icon"><Church size={20}/></div>
      <div className="ministry-card-head"><div><span className={'module-status '+(item.active?'active':'inactive')}>{item.active?'Ativo':'Inativo'}</span><h2>{item.name}</h2></div><span>→</span></div>
      <p>{item.description||'Equipe ministerial da igreja.'}</p>
      <div className="ministry-card-footer"><div><strong>{peopleCount.get(item.id)||0}</strong><span>integrantes</span></div><div><strong>{scheduleCount.get(item.id)||0}</strong><span>escalas futuras</span></div></div>
    </Link>)}</section>:<section className="module-empty-state"><Church size={34}/><h2>Nenhum ministério cadastrado</h2><p>Crie áreas para organizar equipes e escalas.</p><Link href="/ministries/new">Criar ministério</Link></section>}
  </>;
}
