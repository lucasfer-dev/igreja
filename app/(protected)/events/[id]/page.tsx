import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, CheckCircle2, MapPin, UserRoundCheck, Users } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { whatsappLink } from '@/lib/whatsapp';
import { checkInRegistration, registerForEvent } from './actions';
import { ShareEventActions } from '@/components/share-event-actions';

export default async function EventDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;message?:string}>}){
  const {id}=await params; const qs=await searchParams;
  const {supabase,churchId,roleKey,user,churchName}=await requireChurch();
  const [{data:event},{data:registrations},{data:member},{data:schedules}]=await Promise.all([
    supabase.from('events').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('event_registrations').select('id,full_name,email,phone,status,checked_in_at,created_at,member_id').eq('church_id',churchId).eq('event_id',id).order('created_at'),
    supabase.from('church_members').select('id').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle(),
    supabase.from('volunteer_schedules').select('id,function_name,status,church_members(full_name),ministries(name)').eq('church_id',churchId).eq('event_id',id),
  ]);
  if(!event)notFound();

  const isStaff=roleKey!=='member';
  const isRegistered=registrations?.some(r=>r.member_id===member?.id);
  const register=registerForEvent.bind(null,id);
  const checked=registrations?.filter(r=>r.checked_in_at).length||0;
  const invite=`Olá! Quero convidar você para ${event.title} na ${churchName}, em ${new Date(event.starts_at).toLocaleString('pt-BR')}${event.address?' — '+event.address:''}. Vai ser muito bom ter você com a gente!`;

  return <>
    <Link className="creation-back" href="/events">← Todos os eventos</Link>
    <header className="event-workspace-hero">
      <div><span className="module-status active">{event.status}</span><h1>{event.title}</h1><p>{event.description||'Evento da igreja.'}</p><div className="workspace-meta"><span><CalendarDays size={14}/>{new Date(event.starts_at).toLocaleString('pt-BR')}</span>{event.address&&<span><MapPin size={14}/>{event.address}</span>}</div></div>
      <div className="quick-actions">
        <ShareEventActions title={event.title} text={invite} whatsappUrl={whatsappLink(null,invite)}/>
        {!isStaff&&!isRegistered&&<form action={register}><button className="module-primary" type="submit">Quero participar</button></form>}
        {!isStaff&&isRegistered&&<span className="success-chip"><CheckCircle2 size={16}/> Inscrição confirmada</span>}
      </div>
    </header>

    {qs.error&&<p className="alert">{qs.error}</p>}{qs.message&&<p className="success-alert">{qs.message}</p>}
    <nav className="workspace-tabs"><a className="active" href="#overview">Visão geral</a><a href="#registrations">Inscrições</a><a href="#checkin">Check-in</a><a href="#volunteers">Escalas</a></nav>
    <section id="overview" className="workspace-summary">
      <div><Users size={18}/><strong>{registrations?.length||0}</strong><span>Inscritos</span></div>
      <div><CheckCircle2 size={18}/><strong>{checked}</strong><span>Check-ins</span></div>
      <div><UserRoundCheck size={18}/><strong>{schedules?.length||0}</strong><span>Voluntários</span></div>
      <div><CalendarDays size={18}/><strong>{event.capacity||'—'}</strong><span>Capacidade</span></div>
    </section>

    {isStaff&&<section className="workspace-grid">
      <div className="stack"><section id="registrations" className="panel"><div className="section-title"><div><span className="section-eyebrow">Participantes</span><h2>Inscrições</h2></div><span className="section-count">{registrations?.length||0}</span></div>{registrations?.length?<div className="event-registration-list">{registrations.map(r=>{const checkin=checkInRegistration.bind(null,id,r.id);return <div key={r.id}><span className="person-dot">{(r.full_name||'P').slice(0,1)}</span><div><strong>{r.full_name||'Participante'}</strong><span>{r.phone||r.email||'Sem contato'}</span></div><span className="soft-status">{r.status}</span>{r.checked_in_at?<span className="checked-time">✓ {new Date(r.checked_in_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>:<form action={checkin}><button className="small-action" type="submit">Check-in</button></form>}</div>})}</div>:<div className="empty compact">Nenhuma inscrição ainda.</div>}</section></div>
      <aside id="volunteers" className="panel"><div className="section-title"><div><span className="section-eyebrow">Equipe</span><h2>Escalas do evento</h2></div><Link href="/volunteers">Gerenciar</Link></div>{schedules?.length?<div className="event-volunteer-list">{schedules.map((s:any)=><div key={s.id}><span className="person-dot">{s.church_members?.full_name?.slice(0,1)||'?'}</span><div><strong>{s.church_members?.full_name||'Voluntário'}</strong><span>{s.function_name} • {s.ministries?.name||'Sem ministério'}</span></div><span className={'schedule-state '+s.status}>{s.status}</span></div>)}</div>:<div className="empty compact">Nenhuma escala ligada a este evento.</div>}</aside>
    </section>}
  </>;
}
