import Link from 'next/link';
import { Clock3, MessageCircle, Plus, Sparkles, UserRoundCheck } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { updateVisitorStage } from './actions';

const stages=[['new','Novo'],['contacted','Contatado'],['returned','Retornou'],['integrated','Integrado'],['member','Membro']] as const;

export default async function Visitors(){
  const {supabase,churchId}=await requireChurch();
  const {data,error}=await supabase.from('visitors').select('id,full_name,email,phone,source,stage,first_visit_at,created_at').eq('church_id',churchId).order('created_at',{ascending:false});
  const grouped=stages.map(([key,label])=>({key,label,items:(data||[]).filter(v=>v.stage===key)}));
  const pending=(data||[]).filter(v=>['new','contacted'].includes(v.stage)).length;
  const integrated=(data||[]).filter(v=>['integrated','member'].includes(v.stage)).length;

  return <>
    <header className="page-heading">
      <div><span className="page-kicker">Integração</span><h1>Visitantes & follow-up</h1><p>Garanta que ninguém passe pela igreja sem acompanhamento.</p></div>
      <Link className="primary-action" href="/visitors/new"><Plus size={16}/> Novo visitante</Link>
    </header>

    <section className="people-summary visitor-summary">
      <div><span className="summary-icon"><Sparkles size={18}/></span><div><strong>{data?.length||0}</strong><span>Total de visitantes</span></div></div>
      <div><span className="summary-icon warning"><Clock3 size={18}/></span><div><strong>{pending}</strong><span>Precisam de contato</span></div></div>
      <div><span className="summary-icon"><MessageCircle size={18}/></span><div><strong>{grouped.find(x=>x.key==='contacted')?.items.length||0}</strong><span>Em acompanhamento</span></div></div>
      <div><span className="summary-icon success"><UserRoundCheck size={18}/></span><div><strong>{integrated}</strong><span>Integrados</span></div></div>
    </section>

    {error?<p className="alert">{error.message}</p>:<section className="followup-board">
      {grouped.map(col=><div className="followup-column" key={col.key}>
        <div className="followup-column-head"><div><strong>{col.label}</strong><span>{col.items.length}</span></div></div>
        <div className="followup-column-body">
          {col.items.length?col.items.map(visitor=>{
            const action=updateVisitorStage.bind(null,visitor.id);
            return <article className="followup-card" key={visitor.id}>
              <div className="followup-person"><span className="person-dot">{visitor.full_name.slice(0,1)}</span><div><strong>{visitor.full_name}</strong><span>{visitor.phone||visitor.email||'Sem contato'}</span></div></div>
              <div className="followup-meta"><span>{visitor.source||'Origem não informada'}</span><span>{visitor.first_visit_at?'1ª visita '+new Date(visitor.first_visit_at+'T12:00:00').toLocaleDateString('pt-BR'):'Data não informada'}</span></div>
              <form action={action} className="stage-control"><select name="stage" defaultValue={visitor.stage}>{stages.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button type="submit">Mover</button></form>
            </article>
          }):<div className="board-empty">Sem pessoas nesta etapa</div>}
        </div>
      </div>)}
    </section>}
  </>;
}
