import Link from 'next/link';
import { ArrowLeft, MessageCircle, Send, UserPlus, X } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireChurch } from '@/lib/auth';
import { addChatParticipant, removeChatParticipant, sendChatMessage } from '../actions';
import { ChatRealtime } from '@/components/chat-realtime';

export default async function ChatRoomPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
  const {id}=await params;
  const qs=await searchParams;
  const {supabase,churchId,user,roleId}=await requireChurch();

  const [{data:room},{data:messages},{data:managePermission}] = await Promise.all([
    supabase.from('chat_rooms').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('chat_messages').select('id,body,sender_user_id,created_at').eq('church_id',churchId).eq('room_id',id).order('created_at',{ascending:true}).limit(150),
    supabase.from('role_permissions').select('permission_key').eq('role_id',roleId).eq('permission_key','communications.manage').maybeSingle(),
  ]);
  if(!room)notFound();

  const senderIds=[...new Set((messages||[]).map(m=>m.sender_user_id))];
  const {data:profiles}=senderIds.length?await supabase.from('profiles').select('id,full_name,avatar_url').in('id',senderIds):{data:[] as {id:string;full_name:string|null;avatar_url:string|null}[]};
  const names=new Map((profiles||[]).map(p=>[p.id,p.full_name||'Membro']));
  const action=sendChatMessage.bind(null,id);

  let roomMembers:{user_id:string;profiles:{full_name:string|null}|null}[]=[];
  let availableMembers:{id:string;full_name:string;auth_user_id:string|null}[]=[];

  if(room.room_type!=='community'&&managePermission){
    const [{data:participants},{data:allMembers}]=await Promise.all([
      supabase.from('chat_room_members').select('user_id,profiles:user_id(full_name)').eq('church_id',churchId).eq('room_id',id).order('created_at'),
      supabase.from('church_members').select('id,full_name,auth_user_id').eq('church_id',churchId).not('auth_user_id','is',null).neq('status','inactive').order('full_name').limit(250),
    ]);
    roomMembers=(participants||[]) as typeof roomMembers;
    const existing=new Set(roomMembers.map(item=>item.user_id));
    availableMembers=(allMembers||[]).filter(member=>member.auth_user_id&&!existing.has(member.auth_user_id));
  }

  return <div className="member-app chat-room-page"><ChatRealtime roomId={id}/>
    <Link className="chat-back" href="/chats"><ArrowLeft size={15}/> Conversas</Link>
    <section className="chat-room-layout">
      <div className="chat-window">
        <header className="chat-window-head"><span className="chat-room-icon large"><MessageCircle size={20}/></span><div><h1>{room.name}</h1><p>{room.description||'Conversa da comunidade'}</p></div><span className="soft-status">{room.room_type==='community'?'Toda a igreja':'Sala restrita'}</span></header>
        {qs.error&&<p className="alert">{qs.error}</p>}
        <div className="chat-messages">
          {messages?.length?messages.map(message=>{
            const own=message.sender_user_id===user.id;
            return <article className={'chat-message '+(own?'own':'')} key={message.id}>
              {!own&&<span className="chat-avatar">{(names.get(message.sender_user_id)||'M').slice(0,1)}</span>}
              <div><small>{own?'Você':names.get(message.sender_user_id)||'Membro'}</small><p>{message.body}</p><time>{new Date(message.created_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</time></div>
            </article>;
          }):<div className="chat-empty"><MessageCircle size={30}/><strong>Comece a conversa</strong><span>Seja a primeira pessoa a enviar uma mensagem.</span></div>}
        </div>
        <form action={action} className="chat-compose"><textarea name="body" rows={2} placeholder={'Mensagem para '+room.name+'...'} aria-label={'Mensagem para '+room.name} required/><button type="submit" title="Enviar"><Send size={18}/></button></form>
      </div>

      {room.room_type!=='community'&&managePermission?<aside className="panel chat-member-panel">
        <div className="section-title"><div><span className="section-eyebrow">Acesso</span><h2>Participantes</h2></div><span className="section-count">{roomMembers.length}</span></div>
        <div className="chat-member-list">
          {roomMembers.map(member=>{
            const remove=removeChatParticipant.bind(null,id,member.user_id);
            return <div key={member.user_id}><span className="person-dot">{(member.profiles?.full_name||'M').slice(0,1)}</span><strong>{member.profiles?.full_name||'Membro'}</strong><form action={remove}><button type="submit" title="Remover participante"><X size={14}/></button></form></div>;
          })}
        </div>
        {availableMembers.length?<form action={addChatParticipant.bind(null,id)} className="form compact-form"><div className="field"><label htmlFor="member_id">Adicionar pessoa</label><select id="member_id" name="member_id" required><option value="">Selecione</option>{availableMembers.map(member=><option value={member.id} key={member.id}>{member.full_name}</option>)}</select></div><button className="primary-submit" type="submit"><UserPlus size={15}/> Adicionar</button></form>:<p className="composer-note">Todos os membros vinculados já estão nesta sala.</p>}
      </aside>:null}
    </section>
  </div>;
}
