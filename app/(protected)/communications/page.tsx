import { Bell, Megaphone, MessageSquareText, Plus, Send, UsersRound } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { publishAnnouncement } from './actions';

const audienceLabels: Record<string,string> = {
  church: 'Toda a igreja',
  unit: 'Unidade',
  cell: 'Célula',
  ministry: 'Ministério',
  event: 'Evento',
  person: 'Pessoa',
};

export default async function CommunicationsPage(){
  const {supabase,churchId}=await requirePermission('communications.manage');

  const now=new Date().toISOString();
  const [announcements,userCount,units,cells,ministries,events,members] = await Promise.all([
    supabase.from('announcements').select('id,title,body,published_at,published,audience_type').eq('church_id',churchId).order('published_at',{ascending:false}).limit(30),
    supabase.from('church_users').select('*',{count:'exact',head:true}).eq('church_id',churchId).eq('status','active'),
    supabase.from('church_units').select('id,name').eq('church_id',churchId).order('name'),
    supabase.from('cells').select('id,name').eq('church_id',churchId).eq('active',true).order('name'),
    supabase.from('ministries').select('id,name').eq('church_id',churchId).eq('active',true).order('name'),
    supabase.from('events').select('id,title,starts_at').eq('church_id',churchId).gte('starts_at',now).order('starts_at').limit(30),
    supabase.from('church_members').select('id,full_name,status').eq('church_id',churchId).neq('status','inactive').not('auth_user_id','is',null).order('full_name').limit(250),
  ]);

  return <>
    <header className="module-heading">
      <div>
        <span className="module-kicker">Comunicação</span>
        <h1>Central de comunicação</h1>
        <p>Publique avisos para públicos específicos e acompanhe o histórico sem fingir integrações externas.</p>
      </div>
      <a className="module-primary" href="#compose"><Plus size={16}/> Nova mensagem</a>
    </header>

    <section className="communication-summary">
      <div><Megaphone size={18}/><strong>{announcements.data?.length||0}</strong><span>Publicações recentes</span></div>
      <div><Bell size={18}/><strong>{userCount.count||0}</strong><span>Pessoas alcançáveis no app</span></div>
      <div><UsersRound size={18}/><strong>6</strong><span>Tipos de público</span></div>
      <div><MessageSquareText size={18}/><strong>App</strong><span>Canal ativo</span></div>
    </section>

    <section className="communication-layout">
      <div className="panel communication-history">
        <div className="section-title">
          <div><span className="section-eyebrow">Histórico</span><h2>Mensagens publicadas</h2></div>
        </div>
        {announcements.data?.length?announcements.data.map(item=>
          <article className="communication-item" key={item.id}>
            <span className="communication-icon"><Megaphone size={16}/></span>
            <div>
              <div className="communication-title-row">
                <strong>{item.title}</strong>
                <span className="soft-status">{audienceLabels[item.audience_type]||'Toda a igreja'}</span>
              </div>
              <p>{item.body}</p>
              <span>{new Date(item.published_at).toLocaleString('pt-BR')}</span>
            </div>
            <span className="soft-status success">Publicado</span>
          </article>
        ):<div className="empty">Nenhuma mensagem publicada.</div>}
      </div>

      <aside id="compose" className="panel communication-composer">
        <div className="section-title">
          <div><span className="section-eyebrow">Nova mensagem</span><h2>Publicar aviso</h2></div>
          <Send size={18}/>
        </div>

        <div className="channel-row" aria-label="Canais disponíveis">
          <span className="active">App</span>
          <span className="disabled" title="Integração ainda não configurada">Push</span>
          <span className="disabled" title="Integração ainda não configurada">E-mail</span>
          <span className="disabled" title="Integração ainda não configurada">WhatsApp</span>
        </div>

        <form action={publishAnnouncement} className="form">
          <div className="field">
            <label htmlFor="audience">Público</label>
            <select id="audience" name="audience" defaultValue="church" required>
              <option value="church">Toda a igreja — {userCount.count||0} usuários ativos</option>
              {units.data?.length?<optgroup label="Unidades">{units.data.map(item=><option value={'unit:'+item.id} key={item.id}>{item.name}</option>)}</optgroup>:null}
              {cells.data?.length?<optgroup label="Células">{cells.data.map(item=><option value={'cell:'+item.id} key={item.id}>{item.name}</option>)}</optgroup>:null}
              {ministries.data?.length?<optgroup label="Ministérios">{ministries.data.map(item=><option value={'ministry:'+item.id} key={item.id}>{item.name}</option>)}</optgroup>:null}
              {events.data?.length?<optgroup label="Eventos">{events.data.map(item=><option value={'event:'+item.id} key={item.id}>{item.title} — {new Date(item.starts_at).toLocaleDateString('pt-BR')}</option>)}</optgroup>:null}
              {members.data?.length?<optgroup label="Pessoas específicas">{members.data.map(item=><option value={'person:'+item.id} key={item.id}>{item.full_name}</option>)}</optgroup>:null}
            </select>
            <small className="field-help">Somente usuários vinculados ao público escolhido recebem a notificação.</small>
          </div>
          <div className="field"><label htmlFor="communication-title">Título</label><input id="communication-title" name="title" placeholder="Ex.: Mudança no horário do culto" required/></div>
          <div className="field"><label htmlFor="communication-body">Mensagem</label><textarea id="communication-body" name="body" rows={8} placeholder="Escreva a mensagem..." required/></div>
          <button className="primary-submit" type="submit"><Send size={15}/> Publicar no app</button>
        </form>
        <p className="composer-note">Push, e-mail e WhatsApp aparecem como indisponíveis enquanto não houver integração real configurada.</p>
      </aside>
    </section>
  </>;
}
