import Link from 'next/link';
import { MessageCircle, Plus, Search, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createChatRoom } from './actions';

export default async function ChatsPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId,roleId}=await requireChurch();

  const [{data:rooms},{data:messages},{data:managePermission}] = await Promise.all([
    supabase.from('chat_rooms').select('id,name,description,room_type,last_message_at').eq('church_id',churchId).order('last_message_at',{ascending:false}),
    supabase.from('chat_messages').select('id,room_id,body,sender_user_id,created_at').eq('church_id',churchId).order('created_at',{ascending:false}).limit(100),
    supabase.from('role_permissions').select('permission_key').eq('role_id',roleId).eq('permission_key','communications.manage').maybeSingle(),
  ]);

  const latestByRoom=new Map<string,any>();
  (messages||[]).forEach(m=>{if(!latestByRoom.has(m.room_id))latestByRoom.set(m.room_id,m)});

  return <div className="member-app chats-index">
    <header className="module-heading">
      <div><span className="module-kicker">Comunidade</span><h1>Chats</h1><p>Converse com a igreja e acompanhe as conversas da comunidade.</p></div>
    </header>

    {qs.error&&<p className="alert">{qs.error}</p>}

    <section className="chat-index-layout">
      <div className="chat-room-list-panel">
        <div className="chat-list-search"><Search size={17}/><input placeholder="Buscar conversa..."/></div>
        <div className="chat-room-list">{rooms?.length?rooms.map(room=>{const last=latestByRoom.get(room.id);return <Link href={'/chats/'+room.id} key={room.id}><span className="chat-room-icon"><MessageCircle size={18}/></span><div><strong>{room.name}</strong><p>{last?.body||room.description||'Sem mensagens ainda.'}</p><small>{last?new Date(last.created_at).toLocaleString('pt-BR'):room.room_type}</small></div><span>→</span></Link>}):<div className="member-empty">Nenhum chat disponível.</div>}</div>
      </div>

      <aside className="chat-about-panel">
        <span className="chat-about-icon"><UsersRound size={24}/></span>
        <h2>Comunidade conectada</h2>
        <p>Use os chats para conversar sobre eventos, grupos e assuntos da igreja.</p>
        {managePermission&&<form action={createChatRoom} className="form"><div className="field"><label>Nome da conversa</label><input name="name" placeholder="Ex.: Jovens"/></div><div className="field"><label>Descrição</label><input name="description" placeholder="Sobre o que é este chat?"/></div><button className="primary-submit" type="submit"><Plus size={15}/> Criar chat</button></form>}
      </aside>
    </section>
  </div>;
}
