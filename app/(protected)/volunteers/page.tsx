import { CalendarDays, CheckCircle2, Clock3, RefreshCw, UserRoundCheck, XCircle } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createSchedule, updateScheduleStatus } from './actions';

export default async function VolunteersPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId}=await requirePermission('ministries.manage');
  const [{data:schedules},{data:members},{data:ministries},{data:events}]=await Promise.all([
    supabase.from('volunteer_schedules').select('id,event_id,function_name,starts_at,status,church_members(full_name),ministries(name),events(title)').eq('church_id',churchId).gte('starts_at',new Date(Date.now()-7*86400000).toISOString()).order('starts_at').limit(120),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name'),
    supabase.from('ministries').select('id,name').eq('church_id',churchId).eq('active',true).order('name'),
    supabase.from('events').select('id,title,starts_at').eq('church_id',churchId).gte('starts_at',new Date().toISOString()).order('starts_at').limit(50),
  ]);

  const confirmed=schedules?.filter((s:any)=>s.status==='confirmed').length||0;
  const pending=schedules?.filter((s:any)=>s.status==='pending').length||0;
  const declined=schedules?.filter((s:any)=>s.status==='declined').length||0;
  const replacement=schedules?.filter((s:any)=>s.status==='replacement_requested').length||0;

  const grouped=(events||[]).map(event=>({event,rows:(schedules||[]).filter((s:any)=>s.event_id===event.id)})).filter(group=>group.rows.length);

  return <>
    <header className="module-heading"><div><span className="module-kicker">Equipes</span><h1>Escalas</h1><p>Visualize quem serve em cada culto e resolva confirmações antes do evento.</p></div></header>
    {qs.error&&<p className="alert">{qs.error}</p>}

    <section className="schedule-summary">
      <div className="confirmed"><CheckCircle2 size={18}/><strong>{confirmed}</strong><span>Confirmadas</span></div>
      <div className="pending"><Clock3 size={18}/><strong>{pending}</strong><span>Pendentes</span></div>
      <div className="declined"><XCircle size={18}/><strong>{declined}</strong><span>Recusadas</span></div>
      <div className="replace"><RefreshCw size={18}/><strong>{replacement}</strong><span>Substituições</span></div>
    </section>

    <section className="schedule-page-grid">
      <div className="stack">
        {grouped.length?grouped.map(({event,rows})=><section className="schedule-event" key={event.id}>
          <header><div className="schedule-date-large"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div><div><span className="module-kicker">Evento</span><h2>{event.title}</h2><p>{new Date(event.starts_at).toLocaleString('pt-BR',{dateStyle:'medium',timeStyle:'short'})}</p></div><span className="section-count">{rows.length}</span></header>
          <div className="schedule-roster">{rows.map((row:any)=>{const action=updateScheduleStatus.bind(null,row.id);return <div key={row.id}><span className="person-dot">{row.church_members?.full_name?.slice(0,1)||'?'}</span><div><strong>{row.church_members?.full_name||'Voluntário'}</strong><span>{row.function_name} • {row.ministries?.name||'Sem ministério'}</span></div><form action={action} className="schedule-status-form"><select name="status" defaultValue={row.status}><option value="pending">Pendente</option><option value="confirmed">Confirmada</option><option value="declined">Recusada</option><option value="replacement_requested">Substituição</option></select><button type="submit">Salvar</button></form></div>})}</div>
        </section>):<section className="module-empty-state"><UserRoundCheck size={34}/><h2>Nenhuma escala futura</h2><p>Crie uma escala usando o painel ao lado.</p></section>}
      </div>

      <aside className="panel sticky-panel"><div className="section-title"><div><span className="section-eyebrow">Planejamento</span><h2>Nova escala</h2></div><CalendarDays size={18}/></div><form action={createSchedule} className="form"><div className="field"><label>Evento</label><select name="event_id" required><option value="">Selecione</option>{events?.map(e=><option value={e.id} key={e.id}>{e.title} — {new Date(e.starts_at).toLocaleDateString('pt-BR')}</option>)}</select></div><div className="field"><label>Voluntário</label><select name="member_id" required><option value="">Selecione</option>{members?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div><div className="field"><label>Ministério</label><select name="ministry_id"><option value="">Sem ministério</option>{ministries?.map(m=><option value={m.id} key={m.id}>{m.name}</option>)}</select></div><div className="field"><label>Função</label><input name="function_name" placeholder="Recepção, vocal, câmera..." required/></div><button className="primary-submit" type="submit">Criar escala</button></form></aside>
    </section>
  </>;
}
