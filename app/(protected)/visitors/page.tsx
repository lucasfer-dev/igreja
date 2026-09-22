import Link from 'next/link';
import { Clock3, HeartHandshake, MessageCircle, Plus, Sparkles, UserRoundCheck, Zap } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { updateVisitorStage } from './actions';
import { whatsappLink } from '@/lib/whatsapp';

const stages=[['new','Novo'],['contacted','Contato realizado'],['returned','Retornou'],['integrated','Conectado'],['member','Membro']] as const;
const interestLabels:Record<string,string>={
  small_group:'Pequeno grupo',baptism:'Batismo',pastoral_visit:'Conversa pastoral',ministry:'Servir',just_visiting:'Conhecendo'
};

function daysSince(value:string){
  const diff=Date.now()-new Date(value).getTime();
  return Math.max(0,Math.floor(diff/86400000));
}

export default async function Visitors(){
  const {supabase,churchId,churchName}=await requireChurch();
  const [{data,error},{data:queue}]=await Promise.all([
    supabase.from('visitors').select('id,full_name,email,phone,source,stage,first_visit_at,created_at,whatsapp_opt_in,interests,prayer_request,visit_status').eq('church_id',churchId).order('created_at',{ascending:false}),
    supabase.from('whatsapp_outbox').select('visitor_id,status,scheduled_for').eq('church_id',churchId).in('status',['pending','processing']).order('scheduled_for')
  ]);
  const grouped=stages.map(([key,label])=>({key,label,items:(data||[]).filter(v=>v.stage===key)}));
  const pending=(data||[]).filter(v=>['new','contacted'].includes(v.stage)).length;
  const integrated=(data||[]).filter(v=>['integrated','member'].includes(v.stage)).length;

  return <>
    <header className="page-heading">
      <div><span className="page-kicker">Relacionamento</span><h1>Visitantes & follow-up</h1><p>Acompanhe cada pessoa da primeira visita até a conexão com a comunidade.</p></div>
      <div className="quick-actions"><Link href="/conectar" target="_blank">Cartão público</Link><Link href="/communications#whatsapp">Automações</Link><Link className="primary-action" href="/visitors/new"><Plus size={16}/> Novo visitante</Link></div>
    </header>

    <section className="people-summary visitor-summary">
      <div><span className="summary-icon"><Sparkles size={18}/></span><div><strong>{data?.length||0}</strong><span>Total de visitantes</span></div></div>
      <div><span className="summary-icon warning"><Clock3 size={18}/></span><div><strong>{pending}</strong><span>Precisam de atenção</span></div></div>
      <div><span className="summary-icon"><Zap size={18}/></span><div><strong>{queue?.length||0}</strong><span>Follow-ups programados</span></div></div>
      <div><span className="summary-icon success"><UserRoundCheck size={18}/></span><div><strong>{integrated}</strong><span>Conectados / membros</span></div></div>
    </section>

    {error?<p className="alert">{error.message}</p>:<section className="followup-board">
      {grouped.map(col=><div className="followup-column" key={col.key}>
        <div className="followup-column-head"><div><strong>{col.label}</strong><span>{col.items.length}</span></div></div>
        <div className="followup-column-body">
          {col.items.length?col.items.map(visitor=>{
            const action=updateVisitorStage.bind(null,visitor.id);
            const queued=queue?.find(q=>q.visitor_id===visitor.id);
            const message=`Olá, ${visitor.full_name.split(' ')[0]}! Aqui é da ${churchName}. Foi muito bom receber você. Como você está?`;
            const age=daysSince(visitor.created_at);
            return <article className="followup-card" key={visitor.id}>
              <div className="followup-person"><span className="person-dot">{visitor.full_name.slice(0,1)}</span><div><strong>{visitor.full_name}</strong><span>{visitor.phone||visitor.email||'Sem contato'}</span></div></div>
              <div className="followup-meta">
                <span>{visitor.visit_status==='returning'?'Visitante recorrente':'Primeira visita'} • há {age} {age===1?'dia':'dias'}</span>
                <span>{visitor.source||'Origem não informada'}</span>
                {visitor.whatsapp_opt_in?<span className="visitor-ok">WhatsApp autorizado</span>:<span>WhatsApp não autorizado</span>}
                {queued&&<span>Follow-up {new Date(queued.scheduled_for).toLocaleString('pt-BR')}</span>}
              </div>
              {visitor.interests?.length?<div className="visitor-interest-tags">{visitor.interests.map((item:string)=><span key={item}>{interestLabels[item]||item}</span>)}</div>:null}
              {visitor.prayer_request&&<Link className="visitor-care-link" href="/care"><HeartHandshake size={13}/> Pedido de oração enviado</Link>}
              {visitor.phone&&<a className="small-action" href={whatsappLink(visitor.phone,message)} target="_blank" rel="noreferrer"><MessageCircle size={14}/> Abrir WhatsApp</a>}
              <form action={action} className="stage-control"><select name="stage" defaultValue={visitor.stage}>{stages.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button type="submit">Mover</button></form>
            </article>
          }):<div className="board-empty">Sem pessoas nesta etapa</div>}
        </div>
      </div>)}
    </section>}
  </>;
}
