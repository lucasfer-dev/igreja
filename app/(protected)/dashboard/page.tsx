import Link from 'next/link';
import {
  Bell, BookOpen, CalendarDays, ChevronRight, HandHeart, HeartHandshake,
  MessageCircle, Newspaper, PlayCircle
} from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function MemberDashboard(){
  const {supabase,churchId,user,churchName,profileName,roleKey}=await requireChurch();
  const now=new Date().toISOString();

  const [events,notifications,member,news,content,rooms]=await Promise.all([
    supabase.from('events').select('id,title,description,starts_at,address,banner_url,category').eq('church_id',churchId).gte('starts_at',now).order('starts_at').limit(6),
    supabase.from('notifications').select('id,title,body,type,created_at,read_at').eq('church_id',churchId).eq('user_id',user.id).is('archived_at',null).order('created_at',{ascending:false}).limit(5),
    supabase.from('church_members').select('id,full_name,status').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle(),
    supabase.from('news_posts').select('id,title,summary,body,featured,published_at').eq('church_id',churchId).eq('published',true).order('featured',{ascending:false}).order('published_at',{ascending:false}).limit(4),
    supabase.from('content_library').select('id,title,description,category,content_type,url,media_url').eq('church_id',churchId).eq('published',true).order('published_at',{ascending:false}).limit(4),
    supabase.from('chat_rooms').select('id,name,description,room_type,last_message_at').eq('church_id',churchId).order('last_message_at',{ascending:false}).limit(3),
  ]);

  const schedules=member.data?.id
    ? await supabase.from('volunteer_schedules').select('id,function_name,starts_at,status,events(title)').eq('church_id',churchId).eq('member_id',member.data.id).gte('starts_at',now).order('starts_at').limit(3)
    : {data:[] as any[]};

  const nextEvent=events.data?.[0];
  const unread=notifications.data?.filter(n=>!n.read_at).length||0;

  return <div className="member-app">
    <header className="member-home-head">
      <div><span className="member-greeting">Olá, {profileName.split(' ')[0]} 👋</span><h1>{churchName}</h1><p>Veja o que está acontecendo na sua comunidade.</p></div>
      {roleKey!=='member'&&<Link className="member-admin-link" href="/admin">Administração</Link>}
    </header>

    {nextEvent&&<Link href={'/events/'+nextEvent.id} className="member-feature-event">
      <div className="member-feature-overlay">
        <span className="member-feature-tag">PRÓXIMO EVENTO</span><h2>{nextEvent.title}</h2>
        <p>{new Date(nextEvent.starts_at).toLocaleString('pt-BR',{dateStyle:'long',timeStyle:'short'})}{nextEvent.address?' • '+nextEvent.address:''}</p>
        <span className="member-feature-cta">Ver detalhes <ChevronRight size={16}/></span>
      </div>
    </Link>}

    <section className="member-shortcuts">
      <Link href="/events"><span><CalendarDays size={21}/></span><strong>Eventos</strong><small>Agenda da igreja</small></Link>
      <Link href="/chats"><span><MessageCircle size={21}/></span><strong>Chats</strong><small>Comunidade e grupos</small></Link>
      <Link href="/notifications"><span><Bell size={21}/></span><strong>Avisos</strong><small>{unread} não lido(s)</small></Link>
      <Link href="/news"><span><Newspaper size={21}/></span><strong>Notícias</strong><small>Novidades da igreja</small></Link>
    </section>

    <section className="member-section">
      <div className="member-section-head"><div><span>ACONTECE NA IGREJA</span><h2>Próximos eventos</h2></div><Link href="/events">Ver todos</Link></div>
      <div className="member-event-rail">{events.data?.length?events.data.map(event=><Link href={'/events/'+event.id} className="member-event-card" key={event.id}><div className="member-event-date"><strong>{new Date(event.starts_at).getDate()}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div><div><span>{event.category||'Evento'}</span><h3>{event.title}</h3><p>{new Date(event.starts_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}{event.address?' • '+event.address:''}</p></div></Link>):<div className="member-empty">Nenhum evento futuro publicado.</div>}</div>
    </section>

    <section className="member-home-grid">
      <div className="stack">
        <section className="member-panel">
          <div className="member-section-head"><div><span>NOTÍCIAS</span><h2>Últimas da igreja</h2></div><Link href="/news">Ver todas</Link></div>
          {news.data?.length?<div className="member-update-list">{news.data.map(item=><article key={item.id}><span className="member-update-icon"><Newspaper size={17}/></span><div><strong>{item.title}</strong><p>{item.summary||item.body}</p><small>{item.featured?'Destaque • ':''}{new Date(item.published_at).toLocaleString('pt-BR')}</small></div></article>)}</div>:<div className="member-empty">Nenhuma notícia publicada.</div>}
        </section>

        <section className="member-panel">
          <div className="member-section-head"><div><span>PARA VOCÊ</span><h2>Conteúdos recentes</h2></div><Link href="/content">Ver biblioteca</Link></div>
          <div className="member-content-grid">{content.data?.length?content.data.map(item=><a href={item.url||item.media_url||'/content'} className="member-content-card" key={item.id}><span>{item.content_type==='video'?<PlayCircle size={20}/>:<BookOpen size={20}/>}</span><div><small>{item.category||item.content_type}</small><strong>{item.title}</strong><p>{item.description||'Conteúdo da igreja.'}</p></div></a>):<div className="member-empty">Nenhum conteúdo disponível.</div>}</div>
        </section>
      </div>

      <aside className="stack">
        <section className="member-panel">
          <div className="member-section-head"><div><span>COMUNIDADE</span><h2>Chats</h2></div><Link href="/chats">Abrir chats</Link></div>
          {rooms.data?.length?<div className="member-chat-preview">{rooms.data.map(room=><Link href={'/chats/'+room.id} key={room.id}><span><MessageCircle size={16}/></span><div><strong>{room.name}</strong><small>{room.description||'Conversa da comunidade'}</small></div><ChevronRight size={15}/></Link>)}</div>:<div className="member-empty">Nenhum chat disponível.</div>}
        </section>

        {schedules.data?.length?<section className="member-panel"><div className="member-section-head"><div><span>MINHA IGREJA</span><h2>Minhas escalas</h2></div></div>{schedules.data.map((s:any)=><div className="member-schedule" key={s.id}><span><HandHeart size={17}/></span><div><strong>{s.function_name}</strong><small>{s.events?.title||'Evento'} • {new Date(s.starts_at).toLocaleString('pt-BR')}</small></div><span className="soft-status">{s.status}</span></div>)}</section>:null}

        <section className="member-panel">
          <div className="member-section-head"><div><span>AVISOS</span><h2>Notificações</h2></div><Link href="/notifications">Ver todas</Link></div>
          {notifications.data?.length?<div className="member-notice-list">{notifications.data.map(n=><Link href="/notifications" key={n.id} className={!n.read_at?'unread':''}><span><Bell size={15}/></span><div><strong>{n.title}</strong><small>{n.body||'Nova atualização.'}</small></div></Link>)}</div>:<div className="member-empty">Você está em dia.</div>}
        </section>

        <section className="member-prayer"><HeartHandshake size={22}/><div><strong>Como podemos orar por você?</strong><p>Envie um pedido de oração para a equipe pastoral.</p></div><Link href="/profile">Enviar pedido</Link></section>
      </aside>
    </section>
  </div>;
}
