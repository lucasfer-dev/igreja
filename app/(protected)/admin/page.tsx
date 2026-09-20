import Link from 'next/link';
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, Baby, CalendarDays, Cake, CheckCircle2,
  CircleDollarSign, Clock3, Sparkles, UserPlus, UserRoundPlus, UsersRound
} from 'lucide-react';
import { requireChurch } from '@/lib/auth';

function money(value:number){
  return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function dayLabel(date:Date){
  return date.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
}

export default async function AdminDashboard(){
  const {supabase,churchId,churchName,profileName}=await requireChurch();
  const now=new Date();
  const todayStart=new Date(now); todayStart.setHours(0,0,0,0);
  const todayEnd=new Date(now); todayEnd.setHours(23,59,59,999);
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);

  const [
    members, visitors, cells, transactions, upcomingEvents, todayEvents,
    pendingSchedules, activeKids, newVisitors, birthdaysRows, recentMembers, attendance
  ]=await Promise.all([
    supabase.from('church_members').select('*',{count:'exact',head:true}).eq('church_id',churchId).neq('status','inactive'),
    supabase.from('visitors').select('*',{count:'exact',head:true}).eq('church_id',churchId),
    supabase.from('cells').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('active',true),
    supabase.from('transactions').select('direction,amount,occurred_at,category').eq('church_id',churchId).gte('occurred_at',monthStart.toISOString().slice(0,10)),
    supabase.from('events').select('id,title,starts_at,address,status').eq('church_id',churchId).gte('starts_at',now.toISOString()).order('starts_at').limit(5),
    supabase.from('events').select('id,title,starts_at,address,status').eq('church_id',churchId).gte('starts_at',todayStart.toISOString()).lte('starts_at',todayEnd.toISOString()).order('starts_at'),
    supabase.from('volunteer_schedules').select('id,function_name,starts_at,status,church_members(full_name),events(title)').eq('church_id',churchId).eq('status','pending').gte('starts_at',now.toISOString()).order('starts_at').limit(8),
    supabase.from('kids_checkins').select('id,room,checked_in_at,kids_children(full_name)').eq('church_id',churchId).is('checked_out_at',null).order('checked_in_at'),
    supabase.from('visitors').select('id,full_name,stage,created_at,phone,email').eq('church_id',churchId).in('stage',['new','contacted']).order('created_at',{ascending:false}).limit(8),
    supabase.from('church_members').select('id,full_name,birth_date').eq('church_id',churchId).neq('status','inactive'),
    supabase.from('church_members').select('id,full_name,status,created_at').eq('church_id',churchId).order('created_at',{ascending:false}).limit(6),
    supabase.from('attendances').select('occurred_at').eq('church_id',churchId).gte('occurred_at',new Date(now.getTime()-28*86400000).toISOString()).order('occurred_at'),
  ]);

  const finance=(transactions.data||[]).reduce((acc,row)=>{
    const v=Number(row.amount);
    if(row.direction==='income')acc.income+=v; else acc.expense+=v;
    return acc;
  },{income:0,expense:0});

  const birthdays=(birthdaysRows.data||[]).filter(m=>{
    if(!m.birth_date)return false;
    const md=String(m.birth_date).slice(5);
    const current=now.toISOString().slice(5,10);
    const seven=new Date(now.getTime()+7*86400000).toISOString().slice(5,10);
    return md>=current&&md<=seven;
  }).slice(0,6);

  const attention=[
    pendingSchedules.data?.length?{type:'warning',icon:Clock3,title:`${pendingSchedules.data.length} escala(s) aguardando confirmação`,href:'/volunteers'}:null,
    activeKids.data?.length?{type:'info',icon:Baby,title:`${activeKids.data.length} criança(s) em atendimento agora`,href:'/kids'}:null,
    newVisitors.data?.length?{type:'warning',icon:Sparkles,title:`${newVisitors.data.length} visitante(s) precisam de acompanhamento`,href:'/visitors'}:null,
    birthdays.length?{type:'neutral',icon:Cake,title:`${birthdays.length} aniversário(s) nos próximos 7 dias`,href:'/members'}:null,
  ].filter(Boolean) as {type:string;icon:any;title:string;href:string}[];

  const weeks=Array.from({length:4},(_,i)=>{
    const end=new Date(now);end.setDate(end.getDate()-((3-i)*7));end.setHours(23,59,59,999);
    const start=new Date(end);start.setDate(start.getDate()-6);start.setHours(0,0,0,0);
    const count=(attendance.data||[]).filter(a=>{const d=new Date(a.occurred_at);return d>=start&&d<=end}).length;
    return {label:`${start.getDate()}/${start.getMonth()+1}`,count};
  });
  const maxAttendance=Math.max(1,...weeks.map(w=>w.count));

  return <>
    <header className="page-heading">
      <div>
        <span className="page-kicker">{dayLabel(now)}</span>
        <h1>Bom dia, {profileName.split(' ')[0]}</h1>
        <p>Aqui está o que precisa da sua atenção hoje em {churchName}.</p>
      </div>
      <div className="quick-actions">
        <Link href="/members/new"><UserPlus size={16}/> Pessoa</Link>
        <Link href="/visitors/new"><UserRoundPlus size={16}/> Visitante</Link>
        <Link href="/finance"><CircleDollarSign size={16}/> Lançamento</Link>
        <Link className="primary" href="/events"><CalendarDays size={16}/> Evento</Link>
      </div>
    </header>

    <section className="today-strip">
      <div className="today-strip-heading"><span>HOJE NA IGREJA</span><strong>{todayEvents.data?.length||0} atividade(s)</strong></div>
      <div className="today-grid">
        <div className="today-main">
          <span className="today-icon"><CalendarDays size={20}/></span>
          <div><small>Próximo compromisso</small><strong>{todayEvents.data?.[0]?.title||upcomingEvents.data?.[0]?.title||'Nenhum evento hoje'}</strong><span>{todayEvents.data?.[0]?.starts_at?new Date(todayEvents.data[0].starts_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):upcomingEvents.data?.[0]?.starts_at?new Date(upcomingEvents.data[0].starts_at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Agenda livre'}</span></div>
        </div>
        <div className="today-mini"><Baby size={18}/><div><strong>{activeKids.data?.length||0}</strong><span>Kids agora</span></div></div>
        <div className="today-mini"><UsersRound size={18}/><div><strong>{pendingSchedules.data?.length||0}</strong><span>Escalas pendentes</span></div></div>
        <div className="today-mini"><Sparkles size={18}/><div><strong>{newVisitors.data?.length||0}</strong><span>Follow-ups</span></div></div>
      </div>
    </section>

    <section className="attention-panel">
      <div className="section-title"><div><span className="section-eyebrow">Atenção</span><h2>O que precisa ser resolvido</h2></div></div>
      <div className="attention-list">
        {attention.length?attention.map(({icon:Icon,title,href,type})=><Link className={'attention-item '+type} href={href} key={title}><span className="attention-icon"><Icon size={17}/></span><strong>{title}</strong><span>Ver agora →</span></Link>):<div className="attention-empty"><CheckCircle2 size={19}/><span>Nada urgente por enquanto.</span></div>}
      </div>
    </section>

    <section className="overview-grid">
      <article className="overview-card"><div><span>Membros ativos</span><strong>{members.count||0}</strong></div><span className="overview-trend positive"><ArrowUpRight size={15}/> base atual</span></article>
      <article className="overview-card"><div><span>Visitantes</span><strong>{visitors.count||0}</strong></div><span className="overview-trend"><Sparkles size={15}/> integração</span></article>
      <article className="overview-card"><div><span>Células ativas</span><strong>{cells.count||0}</strong></div><span className="overview-trend"><UsersRound size={15}/> grupos</span></article>
      <article className="overview-card"><div><span>Saldo do mês</span><strong>{money(finance.income-finance.expense)}</strong></div><span className={'overview-trend '+(finance.income-finance.expense>=0?'positive':'negative')}>{finance.income-finance.expense>=0?<ArrowUpRight size={15}/>:<ArrowDownRight size={15}/>} caixa</span></article>
    </section>

    <section className="dashboard-main-grid">
      <div className="stack">
        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Presença</span><h2>Últimas 4 semanas</h2></div><Link href="/reports">Abrir relatório</Link></div>
          <div className="modern-chart">
            {weeks.map(w=><div className="modern-chart-col" key={w.label}><span>{w.count}</span><div><i style={{height:`${Math.max(8,(w.count/maxAttendance)*100)}%`}}/></div><small>{w.label}</small></div>)}
          </div>
        </section>

        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Próximos</span><h2>Agenda da igreja</h2></div><Link href="/calendar">Ver calendário</Link></div>
          <div className="schedule-list">{upcomingEvents.data?.length?upcomingEvents.data.map(event=><Link href={'/events/'+event.id} className="schedule-row" key={event.id}><div className="schedule-date"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div><div><strong>{event.title}</strong><span>{new Date(event.starts_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}{event.address?' • '+event.address:''}</span></div><span className="status-dot"/></Link>):<div className="empty compact">Nenhum evento futuro.</div>}</div>
        </section>
      </div>

      <aside className="stack">
        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Integração</span><h2>Visitantes recentes</h2></div><Link href="/visitors">Ver todos</Link></div>
          {newVisitors.data?.length?newVisitors.data.slice(0,5).map(v=><div className="person-list-row" key={v.id}><span className="person-dot">{v.full_name.slice(0,1)}</span><div><strong>{v.full_name}</strong><span>{v.stage==='new'?'Novo visitante':'Em acompanhamento'} • {v.phone||v.email||'sem contato'}</span></div></div>):<div className="empty compact">Sem visitantes pendentes.</div>}
        </section>

        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Pessoas</span><h2>Cadastros recentes</h2></div><Link href="/members">Abrir pessoas</Link></div>
          {recentMembers.data?.length?recentMembers.data.slice(0,5).map(m=><Link className="person-list-row" href={'/members/'+m.id} key={m.id}><span className="person-dot">{m.full_name.slice(0,1)}</span><div><strong>{m.full_name}</strong><span>{String(m.status)}</span></div></Link>):<div className="empty compact">Sem cadastros recentes.</div>}
        </section>

        <section className="panel finance-summary">
          <div className="section-title"><div><span className="section-eyebrow">Financeiro</span><h2>Resumo do mês</h2></div><Link href="/finance">Abrir</Link></div>
          <div className="finance-summary-row"><span>Entradas</span><strong className="positive">{money(finance.income)}</strong></div>
          <div className="finance-summary-row"><span>Saídas</span><strong>{money(finance.expense)}</strong></div>
          <div className="finance-summary-row total"><span>Saldo</span><strong>{money(finance.income-finance.expense)}</strong></div>
        </section>
      </aside>
    </section>
  </>;
}
