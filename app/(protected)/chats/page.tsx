import Link from 'next/link';
import { MessageCircle, Plus, Search, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createChatRoom } from './actions';

const roomTypeLabel:Record<string,string>={
  community:'Comunidade',
  cell:'Célula',
  ministry:'Ministério',
  event:'Evento',
};

export default async function ChatsPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId,roleId}=await requireChurch();

  const [{data:rooms},{data:messages},{data:managePermission},{data:members}] = await Promise.all([
    supabase.from('chat_rooms').select('id,name,description,room_type,last_message_at').eq('church_id',churchId).order('last_message_at',{ascending:false}),
    supabase.from('chat_messages').select('id,room_id,body,sender_user_id,created_at').eq('church_id',churchId).order('created_at',{ascending:false}).limit(100),
    supabase.from('role_permissions').select('permission_key').eq('role_id',roleId).eq('permission_key','communications.manage').maybeSingle(),
    supabase.from('church_members').select('id,full_name,auth_user_id').eq('church_id',churchId).not('auth_user_id','is',null).neq('status','inactive').order('full_name').limit(250),
  ]);

  const latestByRoom=new Map<string,{body:string;created_at:string}>();
  (messages||[]).forEach(m=>{if(!latestByRoom.has(m.room_id))latestByRoom.set(m.room_id,m)});

  return <div className="member-app chats-index">
    <header className="module-heading">
      <div><span className="module-kicker">Comunidade</span><h1>Chats</h1><p>Converse com a igreja e acompanhe apenas os grupos dos quais você participa.</p></div>
    </header>

    {qs.error&&<p className="alert">{qs.error}</p>}

    <section className="chat-index-layout">
      <div className="chat-room-list-panel">
        <div className="chat-list-search"><Search size={17}/><input placeholder="Buscar conversa..." aria-label="Buscar conversa"/></div>
        <div className="chat-room-list">{rooms?.length?rooms.map(room=>{const last=latestByRoom.get(room.id);return <Link href={'/chats/'+room.id} key={room.id}><span className="chat-room-icon"><MessageCircle size={18}/></span><div><div className="chat-room-title-row"><strong>{room.name}</strong><span className="soft-status">{roomTypeLabel[room.room_type]||room.room_type}</span></div><p>{last?.body||room.description||'Sem mensagens ainda.'}</p><small>{last?new Date(last.created_at).toLocaleString('pt-BR'):'Sem mensagens'}</small></div><span>→</span></Link>}):<div className="member-empty">Nenhum chat disponível.</div>}</div>
      </div>

      <aside className="chat-about-panel">
        <span className="chat-about-icon"><UsersRound size={24}/></span>
        <h2>Comunidade conectada</h2>
        <p>Salas gerais são abertas à igreja. Salas de célula, ministério e evento ficam restritas aos participantes adicionados.</p>
        {managePermission&&<form action={createChatRoom} className="form">
          <div className="field"><label htmlFor="room-name">Nome da conversa</label><input id="room-name" name="name" placeholder="Ex.: Louvor — Domingo" required/></div>
          <div className="field"><label htmlFor="room-description">Descrição</label><input id="room-description" name="description" placeholder="Sobre o que é este chat?"/></div>
          <div className="field"><label htmlFor="room-type">Tipo de sala</label><select id="room-type" name="room_type" defaultValue="community"><option value="community">Comunidade — toda a igreja</option><option value="cell">Célula — restrita</option><option value="ministry">Ministério — restrita</option><option value="event">Evento — restrita</option></select></div>
          <div className="field"><label htmlFor="room-members">Participantes iniciais</label><select id="room-members" name="member_ids" multiple size={7}>{members?.map(member=><option value={member.id} key={member.id}>{member.full_name}</option>)}</select><small className="field-help">Em salas restritas, use Ctrl/Cmd para selecionar mais de uma pessoa. O criador da sala é incluído automaticamente.</small></div>
          <button className="primary-submit" type="submit"><Plus size={15}/> Criar chat</button>
        </form>}
      </aside>
    </section>
  </div>;
}
