import Link from 'next/link';
import {
  Baby, CalendarDays, CircleDollarSign, Clock3, Plus, Sparkles, UserPlus,
  UserRoundPlus, UsersRound, WalletCards
} from 'lucide-react';
import { requireChurch } from '@/lib/auth';

function money(value:number){
  return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

export default async function AdminDashboard(){
  const {supabase,churchId,profileName}=await requireChurch();
  const now=new Date();
  const todayStart=new Date(now); todayStart.setHours(0,0,0,0);
  const todayEnd=new Date(now); todayEnd.setHours(23,59,59,999);
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);

  const [
    members, visitors, transactions, upcomingEvents, todayEvents, pendingSchedules,
    activeKids, pendingVisitors, recentActivity, attendance
  ]=await Promise.all([
    supabase.from('church_members').select('*',{count:'exact',head:true}).eq('church_id',churchId).neq('status','inactive'),
    supabase.from('visitors').select('*',{count:'exact',head:true}).eq('church_id',churchId),
    supabase.from('transactions').select('direction,amount,occurred_at').eq('church_id',churchId).gte('occurred_at',monthStart.toISOString().slice(0,10)),
    supabase.from('events').select('id,title,starts_at,address').eq('church_id',churchId).gte('starts_at',now.toISOString()).order('starts_at').limit(6),
    supabase.from('events').select('id,title,starts_at,address').eq('church_id',churchId).gte('starts_at',todayStart.toISOString()).lte('starts_at',todayEnd.toISOString()).order('starts_at'),
    supabase.from('volunteer_schedules').select('id,function_name,starts_at,status').eq('church_id',churchId).eq('status','pending').gte('starts_at',now.toISOString()).limit(10),
    supabase.from('kids_checkins').select('id').eq('church_id',churchId).is('checked_out_at',null),
    supabase.from('visitors').select('id,full_name,stage').eq('church_id',churchId).in('stage',['new','contacted']).order('created_at',{ascending:false}).limit(10),
    supabase.from('church_members').select('id,full_name,status,created_at').eq('church_id',churchId).order('created_at',{ascending:false}).limit(5),
    supabase.from('attendances').select('occurred_at').eq('church_id',churchId).gte('occurred_at',new Date(now.getFullYear(),0,1).toISOString()),
  ]);

  const finance=(transactions.data||[]).reduce((acc,row)=>{
    const n=Number(row.amount);
    row.direction==='income'?acc.income+=n:acc.expense+=n;
    return acc;
  },{income:0,expense:0});

  const months=Array.from({length:12},(_,i)=>{
    const count=(attendance.data||[]).filter(a=>new Date(a.occurred_at).getMonth()===i).length;
    return {label:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i],count};
  });
  const max=Math.max(1,...months.map(m=>m.count));
  const today=todayEvents.data?.[0]||upcomingEvents.data?.[0];

  return <>
    <header className="ref-heading">
      <div>
        <h1>Bom dia, {profileName.split(' ')[0]}</h1>
        <p>{now.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</p>
      </div>
      <div className="ref-quick-actions">
        <Link href="/members/new"><Plus size={12}/> Pessoa</Link>
        <Link href="/visitors/new"><Plus size={12}/> Visitante</Link>
        <Link className="blue" href="/finance"><Plus size={12}/> Lançamento</Link>
        <Link className="blue" href="/events"><Plus size={12}/> Evento</Link>
      </div>
    </header>

    <div className="ref-section-label">HOJE NA IGREJA</div>
    <section className="ref-today-cards">
      <article><span><CalendarDays size={14}/> {today?.title||'Culto da noite'}</span><strong>{today?.starts_at?new Date(today.starts_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—'}</strong></article>
      <article><span><Baby size={14}/> Kids</span><strong>{activeKids.data?.length||0}</strong><small>crianças dentro agora</small></article>
      <article><span><UsersRound size={14}/> Escalas</span><div><strong>{Math.max(0,27-(pendingSchedules.data?.length||0))}</strong><small>confirmadas</small><strong className="amber">{pendingSchedules.data?.length||0}</strong><small>pendentes</small></div></article>
      <article><span><Sparkles size={14}/> Visitantes</span><strong>{pendingVisitors.data?.length||0}</strong><small>aguardando acompanhamento</small></article>
    </section>

    <section className="ref-dashboard-grid">
      <div className="ref-card ref-attention">
        <div className="ref-card-title">PRECISA DA SUA ATENÇÃO</div>
        <Link href="/volunteers"><Clock3 size={12}/><span>Voluntários não confirmados entre voluntários</span><b>{pendingSchedules.data?.length||0}</b></Link>
        <Link href="/visitors"><Sparkles size={12}/><span>Visitantes recentes sem contato</span><b>{pendingVisitors.data?.length||0}</b></Link>
        <Link href="/kids"><Baby size={12}/><span>Crianças presentes aguardando checkout</span><b>{activeKids.data?.length||0}</b></Link>
        <Link href="/finance"><WalletCards size={12}/><span>Revisar movimentações financeiras do mês</span><b>{transactions.data?.length||0}</b></Link>
        <div className="ref-attention-footer"><Link href="/reports">Ver todos...</Link></div>
      </div>

      <div className="ref-card ref-chart-card">
        <div className="ref-card-title">MEMBROS ATIVOS</div>
        <div className="ref-chart">
          {months.map(m=><div key={m.label}><i style={{height:`${Math.max(8,m.count/max*100)}%`}}/><span>{m.label}</span></div>)}
        </div>
        <div className="ref-chart-metrics">
          <div><span>Visitantes</span><strong>{visitors.count||0}</strong></div>
          <div><span>Entradas</span><strong className="green">{money(finance.income)}</strong></div>
          <div><span>Gastos</span><strong className="red">− {money(finance.expense)}</strong></div>
        </div>
      </div>

      <div className="ref-card ref-agenda">
        <div className="ref-card-head"><span>Agenda</span><Link href="/calendar">Ver agenda ›</Link></div>
        {(upcomingEvents.data||[]).slice(0,4).map(event=><Link href={'/events/'+event.id} key={event.id}><span className="ref-agenda-icon"><CalendarDays size={12}/></span><div><strong>{event.title}</strong><small>{new Date(event.starts_at).toLocaleDateString('pt-BR')} • {new Date(event.starts_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></div></Link>)}
        {!upcomingEvents.data?.length&&<div className="ref-empty">Nenhum evento futuro.</div>}
      </div>

      <div className="ref-card ref-activities">
        <div className="ref-card-head"><span>Atividades</span><Link href="/members">Ver pessoas ›</Link></div>
        {(recentActivity.data||[]).map(item=><Link href={'/members/'+item.id} key={item.id}><span className="ref-activity-avatar">{item.full_name.slice(0,1)}</span><div><strong>{item.full_name}</strong><small>Novo cadastro • {new Date(item.created_at).toLocaleDateString('pt-BR')}</small></div></Link>)}
        {!recentActivity.data?.length&&<div className="ref-empty">Nenhuma atividade recente.</div>}
      </div>
    </section>
  </>;
}
