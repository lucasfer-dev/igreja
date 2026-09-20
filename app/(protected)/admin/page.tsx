import Link from 'next/link';
import { CalendarPlus, CircleDollarSign, Sparkles, UserPlus, UsersRound, Cake, Activity } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

function weekLabel(date:Date){return date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});}

export default async function AdminDashboard() {
  const { supabase, churchId, churchName } = await requireChurch();
  const now=new Date(); const monthStart=new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10);
  const attendanceStart=new Date(now); attendanceStart.setDate(attendanceStart.getDate()-27);
  const growthStart=new Date(now); growthStart.setMonth(growthStart.getMonth()-5); growthStart.setDate(1); growthStart.setHours(0,0,0,0);

  const [members,visitors,cells,events,transactions,recentMembers,recentVisitors,attendance,growthMembers] = await Promise.all([
    supabase.from('church_members').select('*',{count:'exact',head:true}).eq('church_id',churchId).neq('status','inactive'),
    supabase.from('visitors').select('*',{count:'exact',head:true}).eq('church_id',churchId),
    supabase.from('cells').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('active',true),
    supabase.from('events').select('id,title,starts_at,status').eq('church_id',churchId).gte('starts_at',now.toISOString()).order('starts_at').limit(5),
    supabase.from('transactions').select('direction,amount,occurred_at').eq('church_id',churchId).gte('occurred_at',monthStart),
    supabase.from('church_members').select('id,full_name,status,birth_date,created_at').eq('church_id',churchId).order('created_at',{ascending:false}).limit(10),
    supabase.from('visitors').select('id,full_name,stage,created_at').eq('church_id',churchId).order('created_at',{ascending:false}).limit(5),
    supabase.from('attendances').select('occurred_at').eq('church_id',churchId).gte('occurred_at',attendanceStart.toISOString()).order('occurred_at'),
    supabase.from('church_members').select('created_at').eq('church_id',churchId).gte('created_at',growthStart.toISOString()).neq('status','inactive'),
  ]);

  const finance=(transactions.data||[]).reduce((a,row)=>{const v=Number(row.amount);row.direction==='income'?a.income+=v:a.expense+=v;return a;},{income:0,expense:0});
  const allBirthdayRows = await supabase.from('church_members').select('id,full_name,birth_date').eq('church_id',churchId).neq('status','inactive');
  const month=now.getMonth()+1;
  const birthdays=(allBirthdayRows.data||[]).filter(m=>m.birth_date&&Number(String(m.birth_date).slice(5,7))===month).sort((a,b)=>String(a.birth_date).slice(8).localeCompare(String(b.birth_date).slice(8)));

  const weeks=Array.from({length:4},(_,i)=>{const start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-((3-i)*7+6));const end=new Date(start);end.setDate(end.getDate()+6);end.setHours(23,59,59,999);const count=(attendance.data||[]).filter(a=>{const d=new Date(a.occurred_at);return d>=start&&d<=end}).length;return {label:weekLabel(start),count};});
  const maxAttendance=Math.max(1,...weeks.map(w=>w.count));

  const months=Array.from({length:6},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);const next=new Date(d.getFullYear(),d.getMonth()+1,1);const count=(growthMembers.data||[]).filter(m=>{const c=new Date(m.created_at);return c>=d&&c<next}).length;return {label:d.toLocaleDateString('pt-BR',{month:'short'}).replace('.',''),count};});
  const maxGrowth=Math.max(1,...months.map(m=>m.count));

  return <>
    <header className="topbar"><div className="title"><span className="eyebrow">Administração</span><h1>{churchName}</h1><p>Indicadores de pessoas, presença, operação e financeiro.</p></div><div className="actions"><Link className="btn secondary" href="/communications">Publicar aviso</Link><Link className="btn" href="/members/new"><UserPlus size={17}/> Novo membro</Link></div></header>
    <section className="grid kpis">
      <div className="card kpi"><span className="metric-icon"><UsersRound size={20}/></span><span className="muted">Membros ativos</span><strong>{members.count||0}</strong><small>base atual da igreja</small></div>
      <div className="card kpi"><span className="metric-icon"><Sparkles size={20}/></span><span className="muted">Visitantes</span><strong>{visitors.count||0}</strong><small>pipeline de integração</small></div>
      <div className="card kpi"><span className="metric-icon"><UsersRound size={20}/></span><span className="muted">Células ativas</span><strong>{cells.count||0}</strong><small>grupos em funcionamento</small></div>
      <div className="card kpi"><span className="metric-icon"><CircleDollarSign size={20}/></span><span className="muted">Saldo do mês</span><strong>{(finance.income-finance.expense).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong><small>{finance.income.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} em entradas</small></div>
    </section>

    <section className="dashboard-charts">
      <div className="card chart-card"><div className="section-head"><div><span className="eyebrow">Presença</span><h2>Últimas 4 semanas</h2></div><span className="metric-icon"><Activity size={18}/></span></div><div className="bar-chart">{weeks.map(w=><div className="bar-col" key={w.label}><div className="bar-value">{w.count}</div><div className="bar-track"><div className="bar-fill" style={{height:`${Math.max(5,(w.count/maxAttendance)*100)}%`}}/></div><span>{w.label}</span></div>)}</div></div>
      <div className="card chart-card"><div className="section-head"><div><span className="eyebrow">Crescimento</span><h2>Novos membros</h2></div></div><div className="bar-chart">{months.map(m=><div className="bar-col" key={m.label}><div className="bar-value">{m.count}</div><div className="bar-track"><div className="bar-fill soft" style={{height:`${Math.max(5,(m.count/maxGrowth)*100)}%`}}/></div><span>{m.label}</span></div>)}</div></div>
    </section>

    <section className="content-grid admin-grid"><div className="stack">
      <section className="card"><div className="section-head"><div><span className="eyebrow">Agenda</span><h2>Próximos eventos</h2></div><Link href="/events"><CalendarPlus size={16}/> Gerenciar</Link></div>{events.data?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Evento</th><th>Data</th><th>Status</th></tr></thead><tbody>{events.data.map(e=><tr key={e.id}><td><Link className="table-link" href={'/events/'+e.id}>{e.title}</Link></td><td>{new Date(e.starts_at).toLocaleString('pt-BR')}</td><td><span className="badge">{e.status}</span></td></tr>)}</tbody></table></div>:<div className="empty">Nenhum evento futuro cadastrado.</div>}</section>
      <section className="card"><div className="section-head"><h2>Entradas recentes</h2><Link href="/members">Ver membros</Link></div><div className="split-list"><div><h3 className="subhead">Novos membros</h3>{recentMembers.data?.slice(0,5).map(item=><div className="person-row" key={item.id}><span className="avatar mini">{item.full_name.slice(0,1)}</span><div><Link className="table-link" href={'/members/'+item.id}>{item.full_name}</Link><span>{String(item.status)}</span></div></div>)||<div className="empty compact">Sem cadastros.</div>}</div><div><h3 className="subhead">Visitantes recentes</h3>{recentVisitors.data?.length?recentVisitors.data.map(item=><div className="person-row" key={item.id}><span className="avatar mini">{item.full_name.slice(0,1)}</span><div><strong>{item.full_name}</strong><span>{String(item.stage)}</span></div></div>):<div className="empty compact">Sem visitantes.</div>}</div></div></section>
    </div>
    <aside className="stack">
      <section className="card"><div className="section-head"><div><span className="eyebrow">Este mês</span><h2>Aniversariantes</h2></div><span className="metric-icon"><Cake size={18}/></span></div>{birthdays.length?birthdays.slice(0,8).map(m=><div className="mini-item" key={m.id}><Link className="table-link" href={'/members/'+m.id}>{m.full_name}</Link><span>{new Date('2000-'+String(m.birth_date).slice(5)+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</span></div>):<div className="empty compact">Nenhum aniversário neste mês.</div>}</section>
      <section className="card"><span className="eyebrow">Ações rápidas</span><h2>O que precisa ser feito?</h2><div className="action-list"><Link href="/members/new">Cadastrar membro <span>→</span></Link><Link href="/visitors/new">Registrar visitante <span>→</span></Link><Link href="/communications">Publicar comunicado <span>→</span></Link><Link href="/volunteers">Montar escala <span>→</span></Link><Link href="/finance">Lançar financeiro <span>→</span></Link><Link href="/kids">Abrir Kids <span>→</span></Link></div></section>
      <section className="card finance-card"><span className="eyebrow">Financeiro do mês</span><div className="finance-row"><span>Entradas</span><strong className="positive">{finance.income.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div><div className="finance-row"><span>Saídas</span><strong>{finance.expense.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div><div className="finance-row total"><span>Saldo</span><strong>{(finance.income-finance.expense).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div></section>
    </aside></section>
  </>;
}
