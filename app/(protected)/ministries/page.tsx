import { Church } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createMinistry } from './actions';

export default async function Ministries() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase.from('ministries').select('id,name,description,active').eq('church_id', churchId).order('name');

  return <><header className="topbar"><div className="title"><span className="eyebrow">Equipes</span><h1>Ministérios</h1><p>Organize áreas, equipes e frentes de serviço.</p></div></header><section className="content-grid admin-grid"><div className="card">{error?<p className="alert">{error.message}</p>:data?.length?<div className="card-grid">{data.map(item=><article className="module-card" key={item.id}><span className="metric-icon"><Church size={18}/></span><h3>{item.name}</h3><p>{item.description||'Sem descrição cadastrada.'}</p><span className="badge">{item.active?'Ativo':'Inativo'}</span></article>)}</div>:<div className="empty">Nenhum ministério cadastrado.</div>}</div><aside className="card sticky-card"><h2>Novo ministério</h2><form action={createMinistry} className="form"><div className="field"><label htmlFor="name">Nome</label><input id="name" name="name" required/></div><div className="field"><label htmlFor="description">Descrição</label><textarea id="description" name="description" rows={5}/></div><button className="btn" type="submit">Criar ministério</button></form></aside></section></>;
}
