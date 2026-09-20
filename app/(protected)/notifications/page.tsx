import Link from 'next/link';
import { Bell, Archive, Check } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { archiveNotification, markNotificationRead } from './actions';

export default async function NotificationsPage() {
  const {supabase,churchId,user}=await requireChurch();
  const {data}=await supabase.from('notifications').select('id,title,body,type,data,created_at,read_at').eq('church_id',churchId).eq('user_id',user.id).is('archived_at',null).order('created_at',{ascending:false}).limit(100);
  return <><header className="topbar"><div className="title"><span className="eyebrow">Central</span><h1>Notificações</h1><p>Avisos, escalas, inscrições e atualizações importantes.</p></div></header><section className="card notification-list">{data?.length?data.map(item=>{const read=markNotificationRead.bind(null,item.id);const archive=archiveNotification.bind(null,item.id);const rawHref=typeof item.data==='object'&&item.data&&'href' in item.data?String((item.data as {href?:unknown}).href||''):'';const href=rawHref.startsWith('/')?rawHref:'/notifications';return <article className={'notification-row '+(item.read_at?'':'unread')} key={item.id}><span className="metric-icon"><Bell size={17}/></span><Link href={href} className="notification-content"><strong>{item.title}</strong><p>{item.body||'Nova atualização.'}</p><small>{new Date(item.created_at).toLocaleString('pt-BR')}</small></Link><div className="row-actions">{!item.read_at&&<form action={read}><button className="icon-button-light" title="Marcar como lida"><Check size={16}/></button></form>}<form action={archive}><button className="icon-button-light" title="Arquivar"><Archive size={16}/></button></form></div></article>}):<div className="empty">Nenhuma notificação pendente.</div>}</section></>;
}
