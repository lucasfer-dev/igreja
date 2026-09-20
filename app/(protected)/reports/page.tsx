import { CalendarDays, CircleDollarSign, Sparkles, TrendingUp, Users, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function ReportsPage(){
  const {supabase,churchId}=await requireChurch();
  const now=new Date(); const since=new Date(now); since.setMonth(since.getMonth()-5); since.setDate(1);

  const [members,visitors,events,cells,tx,attendance,newMembers,newVisitors] = await Promise.all([
    supabase.from('church_members').select('*',{count:'exact',head:true}).eq('church_id',churchId).neq('status','inactive'),
    supabase.from('visitors').select('*',{count:'exact',head:true}).eq('church_id',churchId),
    supabase.from('events').select('*',{count:'exact',head:true}).eq('church_id',churchId),
    supabase.from('cells').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('active',true),
    supabase.from('transactions').select('direction,amount,occurred_at').eq('church_id',churchId).gte('occurred_at',since.toISOString().slice(0,10)),
    supabase.from('attendances').select('occurred_at,source').eq('church_id',churchId).gte('occurred_at',since.toISOString()),
    supabase.from('church_members').select('created_at').eq('church_id',churchId).gte('created_at',since.toISOString()),
    supabase.from('visitors').select('created_at').eq('church_id',churchId).gte('created_at',since.toISOString()),
  ]);

  const months=Array.from({length:6},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);
    const next=new Date(d.getFullYear(),d.getMonth()+1,1);
    const memberGrowth=(newMembers.data||[]).filter(r=>{const x=new Date(r.created_at);return x>=d&&x<next}).length;
    const visitorGrowth=(newVisitors.data||[]).filter(r=>{const x=new Date(r.created_at);return x>=d&&x<next}).length;
    const presence=(attendance.data||[]).filter(r=>{const x=new Date(r.occurred_at);return x>=d&&x<next}).length;
    const monthTx=(tx.data||[]).filter(r=>{const x=new Date(r.occurred_at+'T12:00:00');return x>=d&&x<next});
    const income=monthTx.filter(r=>r.direction==='income').reduce((a,r)=>a+Number(r.amount),0);
    const expense=monthTx.filter(r=>r.direction==='expense').reduce((a,r)=>a+Number(r.amount),0);
    return {label:d.toLocaleDateString('pt-BR',{month:'short'}).replace('.',''),memberGrowth,visitorGrowth,presence,income,expense};
  });
  const maxPresence=Math.max(1,...months.map(m=>m.presence));

  const totalIncome=(tx.data||[]).filter(r=>r.direction==='income').reduce((a,r)=>a+Number(r.amount),0);
  const totalExpense=(tx.data||[]).filter(r=>r.direction==='expense').reduce((a,r)=>a+Number(r.amount),0);

  return <>
    <header className="module-heading"><div><span className="module-kicker">Inteligência</span><h1>Relatórios</h1><p>Entenda crescimento, participação e saúde operacional da igreja.</p></div></header>

    <section className="report-domain-grid">
      <article><Users size={20}/><div><strong>{members.count||0}</strong><span>Pessoas</span><small>{months.reduce((a,m)=>a+m.memberGrowth,0)} novos em 6 meses</small></div></article>
      <article><Sparkles size={20}/><div><strong>{visitors.count||0}</strong><span>Visitantes</span><small>{months.reduce((a,m)=>a+m.visitorGrowth,0)} novos em 6 meses</small></div></article>
      <article><UsersRound size={20}/><div><strong>{cells.count||0}</strong><span>Células</span><small>grupos ativos</small></div></article>
      <article><CalendarDays size={20}/><div><strong>{events.count||0}</strong><span>Eventos</span><small>cadastrados</small></div></article>
      <article><CircleDollarSign size={20}/><div><strong>{(totalIncome-totalExpense).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong><span>Saldo 6 meses</span><small>entradas menos saídas</small></div></article>
    </section>

    <section className="report-grid">
      <div className="panel"><div className="section-title"><div><span className="section-eyebrow">Participação</span><h2>Presença mensal</h2></div><TrendingUp size={18}/></div><div className="report-bars">{months.map(m=><div key={m.label}><span>{m.presence}</span><div><i style={{height:Math.max(6,m.presence/maxPresence*100)+'%'}}/></div><small>{m.label}</small></div>)}</div></div>
      <div className="panel"><div className="section-title"><div><span className="section-eyebrow">Pessoas</span><h2>Crescimento</h2></div></div><div className="report-month-list">{months.map(m=><div key={m.label}><strong>{m.label}</strong><span><i className="blue-dot"/> {m.memberGrowth} membros</span><span><i className="amber-dot"/> {m.visitorGrowth} visitantes</span></div>)}</div></div>
      <div className="panel report-finance"><div className="section-title"><div><span className="section-eyebrow">Financeiro</span><h2>Entradas x saídas</h2></div></div>{months.map(m=><div className="report-finance-row" key={m.label}><strong>{m.label}</strong><div><span>Entradas</span><b className="positive">{m.income.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</b></div><div><span>Saídas</span><b>{m.expense.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</b></div></div>)}</div>
      <div className="panel report-sources"><div className="section-title"><div><span className="section-eyebrow">Presença</span><h2>Origem dos registros</h2></div></div>{Object.entries((attendance.data||[]).reduce<Record<string,number>>((acc,row)=>{acc[row.source||'manual']=(acc[row.source||'manual']||0)+1;return acc;},{})).map(([source,count])=><div key={source}><span>{source}</span><strong>{count}</strong></div>)}</div>
    </section>
  </>;
}
