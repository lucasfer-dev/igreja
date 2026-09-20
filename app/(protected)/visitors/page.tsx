import Link from 'next/link';
import { requireChurch } from '@/lib/auth';
import { updateVisitorStage } from './actions';

const stages=[['new','Novo'],['contacted','Contatado'],['returned','Retornou'],['integrated','Integrado'],['member','Membro']] as const;

export default async function Visitors(){
 const {supabase,churchId}=await requireChurch();
 const {data,error}=await supabase.from('visitors').select('id,full_name,email,phone,source,stage,first_visit_at').eq('church_id',churchId).order('created_at',{ascending:false});
 const grouped=stages.map(([key,label])=>({key,label,items:(data||[]).filter(v=>v.stage===key)}));
 return <><header className="topbar"><div className="title"><span className="eyebrow">Integração</span><h1>Visitantes</h1><p>Acompanhe cada pessoa desde a primeira visita até a integração.</p></div><Link className="btn" href="/visitors/new">Novo visitante</Link></header>
 {error?<p className="alert">{error.message}</p>:<section className="pipeline">{grouped.map(col=><div className="pipeline-col" key={col.key}><div className="pipeline-head"><strong>{col.label}</strong><span>{col.items.length}</span></div><div className="pipeline-stack">{col.items.length?col.items.map(visitor=>{const action=updateVisitorStage.bind(null,visitor.id);return <article className="visitor-card" key={visitor.id}><strong>{visitor.full_name}</strong><span>{visitor.phone||visitor.email||'Sem contato'}</span><small>{visitor.source||'Origem não informada'}{visitor.first_visit_at?' • '+new Date(visitor.first_visit_at+'T12:00:00').toLocaleDateString('pt-BR'):''}</small><form action={action}><select name="stage" defaultValue={visitor.stage}>{stages.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select><button type="submit">Atualizar</button></form></article>}):<div className="empty compact">Nenhum visitante.</div>}</div></div>)}</section>}</>;
}
