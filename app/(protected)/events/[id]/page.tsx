import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, MapPin, Users } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { checkInRegistration, registerForEvent } from './actions';

export default async function EventDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;message?:string}>}) {
  const {id}=await params; const qs=await searchParams;
  const {supabase,churchId,roleKey,user}=await requireChurch();
  const [{data:event},{data:registrations},{data:member}]=await Promise.all([
    supabase.from('events').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('event_registrations').select('id,full_name,email,phone,status,checked_in_at,created_at,member_id').eq('church_id',churchId).eq('event_id',id).order('created_at'),
    supabase.from('church_members').select('id').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle(),
  ]);
  if(!event)notFound();
  const isStaff=roleKey!=='member'; const isRegistered=registrations?.some(r=>r.member_id===member?.id);
  const register=registerForEvent.bind(null,id);
  return <><header className="event-hero"><div><Link className="back-link" href="/events">← Eventos</Link><span className="eyebrow">{event.category||'Evento'}</span><h1>{event.title}</h1><p>{event.description||'Participe deste momento com a nossa comunidade.'}</p><div className="event-meta"><span>{new Date(event.starts_at).toLocaleString('pt-BR')}</span>{event.address&&<span><MapPin size={14}/>{event.address}</span>}{event.capacity&&<span><Users size={14}/>{event.capacity} vagas</span>}</div></div><div>{!isStaff&&!isRegistered&&<form action={register}><button className="btn large" type="submit">Quero participar</button></form>}{!isStaff&&isRegistered&&<span className="success-chip"><CheckCircle2 size={16}/> Inscrição confirmada</span>}</div></header>
  {qs.error&&<p className="alert">{qs.error}</p>}{qs.message&&<p className="success-alert">{qs.message}</p>}
  {isStaff&&<section className="card"><div className="section-head"><div><span className="eyebrow">Inscrições</span><h2>Participantes</h2></div><span className="badge">{registrations?.length||0} inscritos</span></div>{registrations?.length?<div className="table-wrap"><table className="table"><thead><tr><th>Nome</th><th>Contato</th><th>Status</th><th>Check-in</th></tr></thead><tbody>{registrations.map(r=>{const checkin=checkInRegistration.bind(null,id,r.id);return <tr key={r.id}><td><strong>{r.full_name||'Participante'}</strong></td><td>{r.phone||r.email||'—'}</td><td><span className="badge">{r.status}</span></td><td>{r.checked_in_at?new Date(r.checked_in_at).toLocaleString('pt-BR'):<form action={checkin}><button className="btn secondary" type="submit">Confirmar entrada</button></form>}</td></tr>})}</tbody></table></div>:<div className="empty">Nenhuma inscrição ainda.</div>}</section>}</>;
}
