import Link from 'next/link';
import { CalendarDays, MapPin, Plus, Search, UserRound, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

const days=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

export default async function Cells({searchParams}:{searchParams:Promise<{q?:string;day?:string}>}){
  const params=await searchParams;
  const {supabase,churchId}=await requireChurch();

  let cellsQuery=supabase.from('cells')
    .select('id,name,weekday,starts_at,capacity,active,address,leader_member_id')
    .eq('church_id',churchId).order('name');
  if(params.q) cellsQuery=cellsQuery.ilike('name',`%${params.q}%`);
  if(params.day!==undefined&&params.day!=='') cellsQuery=cellsQuery.eq('weekday',Number(params.day));

  const [{data:cells,error},{data:members},{data:attendance},{data:people}] = await Promise.all([
    cellsQuery,
    supabase.from('cell_members').select('cell_id,member_id,active').eq('active',true),
    supabase.from('attendances').select('cell_id,occurred_at').eq('church_id',churchId).not('cell_id','is',null).gte('occurred_at',new Date(Date.now()-30*86400000).toISOString()),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId),
  ]);

  const memberCount=new Map<string,number>();
  (members||[]).forEach((row:any)=>memberCount.set(row.cell_id,(memberCount.get(row.cell_id)||0)+1));
  const attendanceCount=new Map<string,number>();
  (attendance||[]).forEach((row:any)=>row.cell_id&&attendanceCount.set(row.cell_id,(attendanceCount.get(row.cell_id)||0)+1));
  const peopleById=new Map((people||[]).map(p=>[p.id,p.full_name]));

  const totalPeople=Array.from(memberCount.values()).reduce((a,b)=>a+b,0);
  const openCapacity=(cells||[]).reduce((sum,c)=>sum+Math.max(0,(c.capacity||0)-(memberCount.get(c.id)||0)),0);

  return <>
    <header className="module-heading">
      <div><span className="module-kicker">Comunidade</span><h1>Células</h1><p>Acompanhe grupos, lideranças, participantes e frequência em uma única visão.</p></div>
      <Link className="module-primary" href="/cells/new"><Plus size={16}/> Nova célula</Link>
    </header>

    <section className="module-summary-row">
      <div><UsersRound size={19}/><strong>{cells?.filter(c=>c.active).length||0}</strong><span>Células ativas</span></div>
      <div><UserRound size={19}/><strong>{totalPeople}</strong><span>Participantes</span></div>
      <div><CalendarDays size={19}/><strong>{attendance?.length||0}</strong><span>Presenças em 30 dias</span></div>
      <div><MapPin size={19}/><strong>{openCapacity}</strong><span>Vagas disponíveis</span></div>
    </section>

    <section className="module-toolbar">
      <form>
        <div className="module-search"><Search size={16}/><input name="q" placeholder="Buscar célula..." defaultValue={params.q||''}/></div>
        <select name="day" defaultValue={params.day||''}><option value="">Todos os dias</option>{days.map((day,i)=><option key={day} value={i}>{day}</option>)}</select>
        <button type="submit">Filtrar</button>
      </form>
    </section>

    {error?<p className="alert">{error.message}</p>:cells?.length?<section className="cells-catalog">
      {cells.map(cell=>{
        const count=memberCount.get(cell.id)||0;
        const presence=attendanceCount.get(cell.id)||0;
        const capacity=cell.capacity||0;
        const occupancy=capacity?Math.min(100,Math.round(count/capacity*100)):0;
        return <Link className="cell-work-card" href={'/cells/'+cell.id} key={cell.id}>
          <div className="cell-card-head"><div><span className={'module-status '+(cell.active?'active':'inactive')}>{cell.active?'Ativa':'Inativa'}</span><h2>{cell.name}</h2></div><span className="cell-card-arrow">→</span></div>
          <div className="cell-card-meta"><span><CalendarDays size={14}/>{cell.weekday===null?'Dia não definido':days[cell.weekday]}{cell.starts_at?' • '+String(cell.starts_at).slice(0,5):''}</span><span><MapPin size={14}/>{cell.address||'Local não informado'}</span></div>
          <div className="cell-leader"><span className="person-dot">{peopleById.get(cell.leader_member_id||'')?.slice(0,1)||'?'}</span><div><small>Líder</small><strong>{peopleById.get(cell.leader_member_id||'')||'Definir liderança'}</strong></div></div>
          <div className="cell-card-stats"><div><strong>{count}</strong><span>pessoas</span></div><div><strong>{presence}</strong><span>presenças / 30d</span></div><div><strong>{capacity||'—'}</strong><span>capacidade</span></div></div>
          {capacity>0&&<div className="cell-capacity"><span><i style={{width:occupancy+'%'}}/></span><small>{occupancy}% ocupada</small></div>}
        </Link>
      })}
    </section>:<section className="module-empty-state"><UsersRound size={34}/><h2>Nenhuma célula cadastrada</h2><p>Crie a primeira célula para começar a acompanhar pessoas e encontros.</p><Link href="/cells/new">Criar primeira célula</Link></section>}
  </>;
}
