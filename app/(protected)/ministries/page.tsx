import { requireChurch } from '@/lib/auth';

export default async function Ministries() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase.from('ministries').select('id,name,description,active').eq('church_id', churchId).order('name');

  return (
    <>
      <header className="topbar"><div className="title"><h1>Ministérios</h1><p>Equipes, líderes e operação ministerial.</p></div></header>
      <section className="card">
        {error ? <p className="alert">{error.message}</p> : data?.length ? (
          <div className="table-wrap"><table className="table"><thead><tr><th>Nome</th><th>Descrição</th><th>Status</th></tr></thead>
          <tbody>{data.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.description || '—'}</td><td><span className="badge">{item.active ? 'Ativo' : 'Inativo'}</span></td></tr>)}</tbody></table></div>
        ) : <div className="empty">Nenhum ministério cadastrado.</div>}
      </section>
    </>
  );
}
