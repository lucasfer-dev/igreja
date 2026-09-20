import { CalendarDays } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function CalendarPage() {
  const {supabase,churchId}=await requireChurch();
  const now=new Date(); const until=new Date(now); until.setDate(until.getDate()+60);
  const [events,cells,schedules,members]=await Promise.all([
    supabase.from('events').select('id,title,starts_at,address,status').eq('church_id',churchId).gte('starts_at',now.toISOString()).lte('starts_at',until.toISOString()).order('starts_at'),
    supabase.from('cells').select('id,name,weekday,starts_at,address').eq('church_id',churchId).eq('active',true),
    supabase.from('volunteer_schedules').select('id,function_name,starts_at,status,events(title),church_members(full_name)').eq('church_id',churchId).gte('starts_at',now.toISOString()).lte('starts_at',until.toISOString()).order('starts_at'),
    supabase.from('church_members').select('id,full_name,birth_date').eq('church_id',churchId).neq('status','inactive'),
  ]);
  const birthdays=(members.data||[]).filter(m=>m.birth_date).sort((a,b)=>String(a.birth_date).slice(5).localeCompare(String(b.birth_date).slice(5)));
  return <><header className="topbar"><div className="title"><span className="eyebrow">Agenda geral</span><h1>Calendário</h1><p>Eventos, células, escalas e aniversários reunidos.</p></div></header>
  <section className="calendar-grid">
    <div className="card"><div className="section-head"><h2>Próximos 60 dias</h2><span className="metric-icon"><CalendarDays size={18}/></span></div><div className="timeline">{events.data?.length?events.data.map(e=><article key={e.id}><i></i><div><strong>{e.title}</strong><span>{new Date(e.starts_at).toLocaleString('pt-BR')}{e.address?' • '+e.address:''}</span></div></article>):<div className="empty compact">Nenhum evento futuro.</div>}</div></div>
    <div className="stack">
      <section className="card"><h2>Escalas</h2>{schedules.data?.length?schedules.data.map((s:any)=><div className="mini-item" key={s.id}><strong>{s.church_members?.full_name||'Voluntário'} • {s.function_name}</strong><span>{new Date(s.starts_at).toLocaleString('pt-BR')} • {s.events?.title||'Evento'}</span></div>):<div className="empty compact">Sem escalas.</div>}</section>
      <section className="card"><h2>Aniversários</h2>{birthdays.length?birthdays.slice(0,12).map(m=><div className="mini-item" key={m.id}><strong>{m.full_name}</strong><span>{new Date('2000-'+String(m.birth_date).slice(5)+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</span></div>):<div className="empty compact">Sem aniversários cadastrados.</div>}</section>
      <section className="card"><h2>Células recorrentes</h2>{cells.data?.length?cells.data.map(c=><div className="mini-item" key={c.id}><strong>{c.name}</strong><span>Dia {c.weekday ?? '—'} • {c.starts_at||'horário não definido'}{c.address?' • '+c.address:''}</span></div>):<div className="empty compact">Sem células.</div>}</section>
    </div>
  </section></>;
}
