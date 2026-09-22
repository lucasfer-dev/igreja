import { Bell, Megaphone, MessageCircle, Newspaper, Plus, Send, UsersRound, Zap } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createFollowupRule, publishAnnouncement, publishNews } from './actions';
import { whatsappLink } from '@/lib/whatsapp';

const audienceLabels:Record<string,string>={church:'Toda a igreja',unit:'Unidade',cell:'Célula',ministry:'Ministério',event:'Evento',person:'Pessoa'};

export default async function CommunicationsPage(){
  const {supabase,churchId,churchName}=await requirePermission('communications.manage');
  const now=new Date().toISOString();
  const [announcements,userCount,units,cells,ministries,events,members,news,rules,outbox]=await Promise.all([
    supabase.from('announcements').select('id,title,body,published_at,audience_type').eq('church_id',churchId).order('published_at',{ascending:false}).limit(12),
    supabase.from('church_users').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('status','active'),
    supabase.from('church_units').select('id,name').eq('church_id',churchId).order('name'),
    supabase.from('cells').select('id,name').eq('church_id',churchId).eq('active',true).order('name'),
    supabase.from('ministries').select('id,name').eq('church_id',churchId).eq('active',true).order('name'),
    supabase.from('events').select('id,title,starts_at,address').eq('church_id',churchId).gte('starts_at',now).order('starts_at').limit(20),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').not('auth_user_id','is',null).order('full_name').limit(250),
    supabase.from('news_posts').select('id,title,published_at,featured').eq('church_id',churchId).order('published_at',{ascending:false}).limit(8),
    supabase.from('whatsapp_followup_rules').select('id,name,trigger_stage,delay_hours,template_name,active').eq('church_id',churchId).order('created_at',{ascending:false}),
    supabase.from('whatsapp_outbox').select('status').eq('church_id',churchId)
  ]);
  const pending=(outbox.data||[]).filter(x=>x.status==='pending'||x.status==='processing').length;
  const sent=(outbox.data||[]).filter(x=>x.status==='sent').length;

  return <>
    <header className="module-heading"><div><span className="module-kicker">Engajamento</span><h1>Central de comunicação</h1><p>Avisos, notícias, convites e follow-ups em um único lugar.</p></div><a className="module-primary" href="#aviso"><Plus size={16}/> Nova comunicação</a></header>

    <section className="communication-summary">
      <div><Megaphone size={18}/><strong>{announcements.data?.length||0}</strong><span>Avisos recentes</span></div>
      <div><Newspaper size={18}/><strong>{news.data?.length||0}</strong><span>Notícias</span></div>
      <div><Zap size={18}/><strong>{pending}</strong><span>Follow-ups na fila</span></div>
      <div><MessageCircle size={18}/><strong>{sent}</strong><span>WhatsApps enviados</span></div>
    </section>

    <nav className="subnav"><a href="#aviso">Avisos</a><a href="#noticias">Notícias</a><a href="#whatsapp">WhatsApp</a><a href="#convites">Convites</a></nav>

    <section className="communication-layout" id="aviso">
      <div className="panel communication-history">
        <div className="section-title"><div><span className="section-eyebrow">Histórico</span><h2>Avisos publicados</h2></div></div>
        {announcements.data?.length?announcements.data.map(item=><article className="communication-item" key={item.id}><span className="communication-icon"><Megaphone size={16}/></span><div><div className="communication-title-row"><strong>{item.title}</strong><span className="soft-status">{audienceLabels[item.audience_type]||'Toda a igreja'}</span></div><p>{item.body}</p><span>{new Date(item.published_at).toLocaleString('pt-BR')}</span></div></article>):<div className="empty">Nenhum aviso publicado.</div>}
      </div>
      <aside className="panel communication-composer">
        <div className="section-title"><div><span className="section-eyebrow">App</span><h2>Publicar aviso</h2></div><Send size={18}/></div>
        <form action={publishAnnouncement} className="form">
          <div className="field"><label>Público</label><select name="audience" defaultValue="church" required>
            <option value="church">Toda a igreja — {userCount.count||0} usuários</option>
            {units.data?.length?<optgroup label="Unidades">{units.data.map(x=><option value={'unit:'+x.id} key={x.id}>{x.name}</option>)}</optgroup>:null}
            {cells.data?.length?<optgroup label="Células">{cells.data.map(x=><option value={'cell:'+x.id} key={x.id}>{x.name}</option>)}</optgroup>:null}
            {ministries.data?.length?<optgroup label="Ministérios">{ministries.data.map(x=><option value={'ministry:'+x.id} key={x.id}>{x.name}</option>)}</optgroup>:null}
            {events.data?.length?<optgroup label="Eventos">{events.data.map(x=><option value={'event:'+x.id} key={x.id}>{x.title}</option>)}</optgroup>:null}
            {members.data?.length?<optgroup label="Pessoas">{members.data.map(x=><option value={'person:'+x.id} key={x.id}>{x.full_name}</option>)}</optgroup>:null}
          </select></div>
          <div className="field"><label>Título</label><input name="title" required/></div>
          <div className="field"><label>Mensagem</label><textarea name="body" rows={7} required/></div>
          <button className="primary-submit" type="submit"><Send size={15}/> Publicar no app</button>
        </form>
      </aside>
    </section>

    <section className="communication-layout" id="noticias">
      <div className="panel"><div className="section-title"><div><span className="section-eyebrow">Conteúdo</span><h2>Últimas notícias</h2></div><a href="/news">Ver no app</a></div>
        {news.data?.length?news.data.map(item=><div className="communication-item" key={item.id}><span className="communication-icon"><Newspaper size={16}/></span><div><strong>{item.title}</strong><span>{new Date(item.published_at).toLocaleString('pt-BR')} {item.featured?'• Destaque':''}</span></div></div>):<div className="empty">Nenhuma notícia publicada.</div>}
      </div>
      <aside className="panel"><div className="section-title"><div><span className="section-eyebrow">Notícias</span><h2>Nova publicação</h2></div></div>
        <form action={publishNews} className="form">
          <div className="field"><label>Título</label><input name="title" required/></div>
          <div className="field"><label>Resumo</label><input name="summary" maxLength={240}/></div>
          <div className="field"><label>Texto</label><textarea name="body" rows={7} required/></div>
          <div className="field"><label>Link de imagem/mídia</label><input name="cover_url" type="url"/></div>
          <label><input name="featured" type="checkbox"/> Marcar como destaque</label>
          <button className="primary-submit" type="submit"><Newspaper size={15}/> Publicar notícia</button>
        </form>
      </aside>
    </section>

    <section className="communication-layout" id="whatsapp">
      <div className="panel"><div className="section-title"><div><span className="section-eyebrow">Automação</span><h2>Regras de follow-up</h2></div><Zap size={18}/></div>
        {rules.data?.length?rules.data.map(rule=><div className="communication-item" key={rule.id}><span className="communication-icon"><Zap size={16}/></span><div><strong>{rule.name}</strong><p>Quando entrar em “{rule.trigger_stage}” • após {rule.delay_hours}h • template {rule.template_name}</p></div><span className={'soft-status '+(rule.active?'success':'')}>{rule.active?'Ativa':'Pausada'}</span></div>):<div className="empty">Nenhuma automação configurada.</div>}
      </div>
      <aside className="panel"><div className="section-title"><div><span className="section-eyebrow">WhatsApp Cloud API</span><h2>Nova regra</h2></div></div>
        <form action={createFollowupRule} className="form">
          <div className="field"><label>Nome da regra</label><input name="name" placeholder="Boas-vindas após a visita" required/></div>
          <div className="form-row"><div className="field"><label>Etapa gatilho</label><select name="trigger_stage" defaultValue="new"><option value="new">Novo</option><option value="contacted">Contatado</option><option value="returned">Retornou</option><option value="integrated">Integrado</option><option value="member">Membro</option></select></div><div className="field"><label>Esperar (horas)</label><input name="delay_hours" type="number" min="0" max="720" defaultValue="2"/></div></div>
          <div className="field"><label>Template aprovado na Meta</label><input name="template_name" placeholder="visitor_followup" required/></div>
          <div className="field"><label>Idioma</label><input name="language_code" defaultValue="pt_BR"/></div>
          <div className="field"><label>Prévia interna</label><textarea name="preview_text" rows={3} placeholder="Olá! Foi muito bom receber você..."/></div>
          <button className="primary-submit" type="submit"><Zap size={15}/> Criar automação</button>
          <small className="field-help">A automação só entra na fila para visitantes com consentimento de WhatsApp.</small>
        </form>
      </aside>
    </section>

    <section className="panel" id="convites">
      <div className="section-title"><div><span className="section-eyebrow">Compartilhamento</span><h2>Convites pelo WhatsApp</h2></div><MessageCircle size={18}/></div>
      {events.data?.length?<div className="event-registration-list">{events.data.map(event=>{
        const message=`Olá! A ${churchName} quer convidar você para ${event.title}, em ${new Date(event.starts_at).toLocaleString('pt-BR')}${event.address?' — '+event.address:''}. Será muito bom ter você com a gente!`;
        return <div key={event.id}><span className="communication-icon"><CalendarInvite/></span><div><strong>{event.title}</strong><span>{new Date(event.starts_at).toLocaleString('pt-BR')}</span></div><a className="small-action" href={whatsappLink(null,message)} target="_blank" rel="noreferrer">Criar convite</a></div>;
      })}</div>:<div className="empty">Cadastre um evento para gerar convites.</div>}
    </section>
  </>;
}

function CalendarInvite(){return <Bell size={16}/>;}
