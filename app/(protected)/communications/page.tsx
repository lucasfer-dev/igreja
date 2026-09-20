import { Bell, Megaphone, MessageSquareText, Plus, Send } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { publishAnnouncement } from './actions';

export default async function CommunicationsPage(){
  const {supabase,churchId}=await requirePermission('communications.manage');
  const [{data:announcements},{count:userCount}] = await Promise.all([
    supabase.from('announcements').select('id,title,body,published_at,published').eq('church_id',churchId).order('published_at',{ascending:false}).limit(30),
    supabase.from('church_users').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('status','active'),
  ]);

  return <>
    <header className="module-heading"><div><span className="module-kicker">Comunicação</span><h1>Central de comunicação</h1><p>Publique avisos para a comunidade e acompanhe o histórico de mensagens.</p></div><a className="module-primary" href="#compose"><Plus size={16}/> Nova mensagem</a></header>

    <section className="communication-summary">
      <div><Megaphone size={18}/><strong>{announcements?.length||0}</strong><span>Publicações recentes</span></div>
      <div><Bell size={18}/><strong>{userCount||0}</strong><span>Pessoas alcançáveis no app</span></div>
      <div><MessageSquareText size={18}/><strong>App</strong><span>Canal ativo</span></div>
    </section>

    <section className="communication-layout">
      <div className="panel communication-history"><div className="section-title"><div><span className="section-eyebrow">Histórico</span><h2>Mensagens publicadas</h2></div></div>{announcements?.length?announcements.map(item=><article className="communication-item" key={item.id}><span className="communication-icon"><Megaphone size={16}/></span><div><strong>{item.title}</strong><p>{item.body}</p><span>{new Date(item.published_at).toLocaleString('pt-BR')}</span></div><span className="soft-status">Publicado</span></article>):<div className="empty">Nenhuma mensagem publicada.</div>}</div>

      <aside id="compose" className="panel communication-composer"><div className="section-title"><div><span className="section-eyebrow">Nova mensagem</span><h2>Publicar aviso</h2></div><Send size={18}/></div><div className="channel-row"><span className="active">App</span><span className="disabled">Push</span><span className="disabled">E-mail</span><span className="disabled">WhatsApp</span></div><form action={publishAnnouncement} className="form"><div className="field"><label>Público</label><div className="audience-display">Toda a igreja <small>{userCount||0} usuários ativos</small></div></div><div className="field"><label>Título</label><input name="title" placeholder="Ex.: Mudança no horário do culto" required/></div><div className="field"><label>Mensagem</label><textarea name="body" rows={8} placeholder="Escreva a mensagem..." required/></div><button className="primary-submit" type="submit"><Send size={15}/> Publicar no app</button></form><p className="composer-note">Push, e-mail e WhatsApp ainda não estão conectados; esta tela não finge que esses canais enviam mensagens.</p></aside>
    </section>
  </>;
}
