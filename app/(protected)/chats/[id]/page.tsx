import Link from 'next/link';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireChurch } from '@/lib/auth';
import { sendChatMessage } from '../actions';

export default async function ChatRoomPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
  const {id}=await params;
  const qs=await searchParams;
  const {supabase,churchId,user,profileName}=await requireChurch();

  const [{data:room},{data:messages}] = await Promise.all([
    supabase.from('chat_rooms').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('chat_messages').select('id,body,sender_user_id,created_at').eq('church_id',churchId).eq('room_id',id).order('created_at',{ascending:true}).limit(150),
  ]);
  if(!room)notFound();

  const senderIds=[...new Set((messages||[]).map(m=>m.sender_user_id))];
  const {data:profiles}=senderIds.length?await supabase.from('profiles').select('id,full_name,avatar_url').in('id',senderIds):{data:[] as any[]};
  const names=new Map((profiles||[]).map(p=>[p.id,p.full_name||'Membro']));
  const action=sendChatMessage.bind(null,id);

  return <div className="member-app chat-room-page">
    <Link className="chat-back" href="/chats"><ArrowLeft size={15}/> Conversas</Link>
    <section className="chat-window">
      <header className="chat-window-head"><span className="chat-room-icon large"><MessageCircle size={20}/></span><div><h1>{room.name}</h1><p>{room.description||'Conversa da comunidade'}</p></div></header>
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
      <form action={action} className="chat-compose"><textarea name="body" rows={2} placeholder={'Mensagem para '+room.name+'...'} required/><button type="submit" title="Enviar"><Send size={18}/></button></form>
    </section>
  </div>;
}
