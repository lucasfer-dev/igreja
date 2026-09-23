'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireChurch, requirePermission } from '@/lib/auth';

export async function registerForEvent(eventId:string) {
  const {supabase,churchId,user}=await requireChurch();

  const [{data:event},{data:member}]=await Promise.all([
    supabase.from('events').select('id,starts_at,status').eq('church_id',churchId).eq('id',eventId).maybeSingle(),
    supabase.from('church_members').select('id,full_name,email,phone').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle(),
  ]);

  if(!event) redirect('/events?error='+encodeURIComponent('Evento não encontrado.'));
  if(new Date(event.starts_at).getTime()<Date.now()) redirect('/events/'+eventId+'?error='+encodeURIComponent('As inscrições para este evento já foram encerradas.'));
  if(!member) redirect('/events/'+eventId+'?error='+encodeURIComponent('Seu usuário ainda não está vinculado a um cadastro de membro.'));

  const {data:existing}=await supabase.from('event_registrations').select('id').eq('church_id',churchId).eq('event_id',eventId).eq('member_id',member.id).maybeSingle();
  if(existing) redirect('/events/'+eventId+'?message='+encodeURIComponent('Você já está inscrito.'));

  const {error}=await supabase.from('event_registrations').insert({
    church_id:churchId,
    event_id:eventId,
    member_id:member.id,
    full_name:member.full_name,
    email:member.email,
    phone:member.phone,
    status:'confirmed'
  });
  if(error) redirect('/events/'+eventId+'?error='+encodeURIComponent('Não foi possível confirmar sua inscrição. Tente novamente.'));

  revalidatePath('/events/'+eventId);
  revalidatePath('/events');
  redirect('/events/'+eventId+'?message='+encodeURIComponent('Inscrição confirmada.'));
}

export async function checkInRegistration(eventId:string,registrationId:string) {
  const {supabase,churchId}=await requirePermission('events.manage');
  const {data:registration}=await supabase.from('event_registrations')
    .select('member_id,visitor_id')
    .eq('church_id',churchId)
    .eq('event_id',eventId)
    .eq('id',registrationId)
    .maybeSingle();

  if(!registration) return;

  const {error}=await supabase.from('event_registrations')
    .update({checked_in_at:new Date().toISOString(),status:'checked_in'})
    .eq('church_id',churchId)
    .eq('event_id',eventId)
    .eq('id',registrationId);
  if(error) return;

  await supabase.from('attendances').insert({
    church_id:churchId,
    event_id:eventId,
    member_id:registration.member_id,
    visitor_id:registration.visitor_id,
    occurred_at:new Date().toISOString(),
    source:'event_checkin'
  });

  revalidatePath('/events/'+eventId);
  revalidatePath('/admin');
}
