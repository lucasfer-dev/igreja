import { HeartHandshake, LockKeyhole, MessageCircle, UserRound } from 'lucide-react';
import { requireAnyPermission } from '@/lib/auth';
import { updateMemberPrayerStatus, updateVisitorCareStatus } from './actions';

const statusLabels: Record<string,string> = {
  new: 'Novo',
  praying: 'Em oração',
  following: 'Acompanhando',
  completed: 'Concluído',
};

function StatusForm({ id, value, action }: { id:string; value:string; action:(id:string,formData:FormData)=>Promise<void> }) {
  const bound = action.bind(null,id);
  return <form action={bound} className="care-status-form">
    <select name="status" defaultValue={statusLabels[value]?value:'new'} aria-label="Status do acompanhamento">
      {Object.entries(statusLabels).map(([key,label])=><option value={key} key={key}>{label}</option>)}
    </select>
    <button type="submit">Salvar</button>
  </form>;
}

export default async function CarePage() {
  const { supabase, churchId } = await requireAnyPermission(['care.read','care.manage']);
  const [{ data: visitorRequests }, { data: memberRequests }] = await Promise.all([
    supabase.from('visitor_care_requests')
      .select('id,visitor_id,body,status,confidential,created_at,visitors(full_name,phone)')
      .eq('church_id',churchId).order('created_at',{ascending:false}),
    supabase.from('prayer_requests')
      .select('id,user_id,title,body,status,is_private,created_at')
      .eq('church_id',churchId).order('created_at',{ascending:false}),
  ]);

  const userIds=[...new Set((memberRequests||[]).map(item=>item.user_id).filter(Boolean))];
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id,full_name').in('id',userIds)
    : { data: [] as {id:string;full_name:string|null}[] };
  const profileById = new Map((profiles||[]).map(profile=>[profile.id,profile.full_name||'Membro']));

  return <>
    <header className="page-heading">
      <div><span className="page-kicker">Cuidado</span><h1>Pedidos de oração</h1><p>Um espaço reservado para acompanhar pessoas com discrição, contexto e responsabilidade.</p></div>
    </header>

    <section className="care-summary">
      <article><HeartHandshake size={18}/><div><strong>{(visitorRequests||[]).filter(r=>r.status!=='completed').length}</strong><span>visitantes em cuidado</span></div></article>
      <article><UserRound size={18}/><div><strong>{(memberRequests||[]).filter(r=>r.status!=='completed').length}</strong><span>pedidos de membros</span></div></article>
      <article><LockKeyhole size={18}/><div><strong>Restrito</strong><span>somente equipe autorizada</span></div></article>
    </section>

    <section className="care-grid">
      <div className="panel">
        <div className="section-title"><div><span className="section-eyebrow">Cartão de conexão</span><h2>Visitantes</h2></div></div>
        <div className="care-list">
          {(visitorRequests||[]).length ? visitorRequests!.map((item:any)=><article className="care-item" key={item.id}>
            <div className="care-item-head">
              <span className="care-avatar">{item.visitors?.full_name?.slice(0,1)||'V'}</span>
              <div><strong>{item.visitors?.full_name||'Visitante'}</strong><small>{new Date(item.created_at).toLocaleString('pt-BR')}</small></div>
              {item.confidential&&<span className="care-confidential"><LockKeyhole size={12}/> Confidencial</span>}
            </div>
            <p>{item.body}</p>
            {item.visitors?.phone&&<a className="small-action" href={'https://wa.me/55'+String(item.visitors.phone).replace(/\D/g,'').replace(/^55/,'')} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a>}
            <StatusForm id={item.id} value={item.status} action={updateVisitorCareStatus}/>
          </article>) : <div className="member-empty">Nenhum pedido de visitante no momento.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="section-title"><div><span className="section-eyebrow">Área do membro</span><h2>Membros</h2></div></div>
        <div className="care-list">
          {(memberRequests||[]).length ? memberRequests!.map(item=><article className="care-item" key={item.id}>
            <div className="care-item-head">
              <span className="care-avatar">{(profileById.get(item.user_id)||'M').slice(0,1)}</span>
              <div><strong>{profileById.get(item.user_id)||'Membro'}</strong><small>{new Date(item.created_at).toLocaleString('pt-BR')}</small></div>
              {item.is_private&&<span className="care-confidential"><LockKeyhole size={12}/> Confidencial</span>}
            </div>
            <h3>{item.title}</h3><p>{item.body}</p>
            <StatusForm id={item.id} value={item.status} action={updateMemberPrayerStatus}/>
          </article>) : <div className="member-empty">Nenhum pedido de membro no momento.</div>}
        </div>
      </div>
    </section>
  </>;
}
