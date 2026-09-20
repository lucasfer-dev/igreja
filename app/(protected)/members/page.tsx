import Link from 'next/link';
import { Cake, Search, UserPlus, Users, UserRoundCheck, UserRoundX } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function Members({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}){
  const params=await searchParams;
  const {supabase,churchId}=await requireChurch();

  let query=supabase.from('church_members')
    .select('id,full_name,email,phone,status,birth_date,created_at')
    .eq('church_id',churchId).order('full_name');

  if(params.status)query=query.eq('status',params.status);
  if(params.q)query=query.ilike('full_name',`%${params.q}%`);

  const [{data,error},{count:activeCount},{count:leadersCount},{count:inactiveCount}] = await Promise.all([
    query,
    supabase.from('church_members').select('*',{count:'exact',head:true}).eq('church_id',churchId).neq('status','inactive'),
    supabase.from('church_members').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('status','leader'),
    supabase.from('church_members').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('status','inactive'),
  ]);

  const month=new Date().getMonth()+1;
  const birthdays=(data||[]).filter(m=>m.birth_date&&Number(String(m.birth_date).slice(5,7))===month);

  return <>
    <header className="page-heading">
      <div><span className="page-kicker">Pessoas</span><h1>Diretório de pessoas</h1><p>Uma visão única de membros, líderes, contatos e histórico de participação.</p></div>
      <Link className="primary-action" href="/members/new"><UserPlus size={16}/> Adicionar pessoa</Link>
    </header>

    <section className="people-summary">
      <div><span className="summary-icon"><Users size={18}/></span><div><strong>{activeCount||0}</strong><span>Pessoas ativas</span></div></div>
      <div><span className="summary-icon"><UserRoundCheck size={18}/></span><div><strong>{leadersCount||0}</strong><span>Lideranças</span></div></div>
      <div><span className="summary-icon"><Cake size={18}/></span><div><strong>{birthdays.length}</strong><span>Aniversários no mês</span></div></div>
      <div><span className="summary-icon"><UserRoundX size={18}/></span><div><strong>{inactiveCount||0}</strong><span>Inativos</span></div></div>
    </section>

    <section className="directory-panel">
      <div className="directory-toolbar">
        <form className="directory-search">
          <Search size={17}/>
          <input name="q" placeholder="Buscar pessoa por nome..." defaultValue={params.q||''}/>
          <select name="status" defaultValue={params.status||''}>
            <option value="">Todos os vínculos</option>
            <option value="member">Membro</option>
            <option value="leader">Líder</option>
            <option value="volunteer">Voluntário</option>
            <option value="attendee">Frequentador</option>
            <option value="inactive">Inativo</option>
          </select>
          <button type="submit">Filtrar</button>
        </form>
        <span className="result-count">{data?.length||0} resultado(s)</span>
      </div>

      {error?<p className="alert">{error.message}</p>:data?.length?<div className="people-table">
        <div className="people-table-head"><span>Pessoa</span><span>Contato</span><span>Vínculo</span><span>Nascimento</span><span></span></div>
        {data.map(member=><Link href={'/members/'+member.id} className="people-table-row" key={member.id}>
          <div className="person-primary"><span className="person-dot large">{member.full_name.slice(0,1)}</span><div><strong>{member.full_name}</strong><small>Cadastrado em {new Date(member.created_at).toLocaleDateString('pt-BR')}</small></div></div>
          <div className="person-contact"><strong>{member.phone||'—'}</strong><small>{member.email||'Sem e-mail'}</small></div>
          <div><span className="soft-status">{member.status}</span></div>
          <div>{member.birth_date?new Date(member.birth_date+'T12:00:00').toLocaleDateString('pt-BR'):'—'}</div>
          <div className="row-arrow">→</div>
        </Link>)}
      </div>:<div className="empty">Nenhuma pessoa encontrada.</div>}
    </section>
  </>;
}
