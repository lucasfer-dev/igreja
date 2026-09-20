import { requireChurch } from '@/lib/auth';

export default async function Cells() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase.from('cells').select('id,name,weekday,starts_at,capacity,active').eq('church_id', churchId).order('name');

  return (
    <>
      <header className="topbar"><div className="title"><h1>Células</h1><p>Pequenos grupos, liderança e frequência.</p></div></header>
      <section className="card">
        {error ? <p className="alert">{error.message}</p> : data?.length ? (
          <div className="table-wrap"><table className="table"><thead><tr><th>Nome</th><th>Dia</th><th>Horário</th><th>Capacidade</th><th>Status</th></tr></thead>
          <tbody>{data.map(cell => <tr key={cell.id}><td>{cell.name}</td><td>{cell.weekday ?? '—'}</td><td>{cell.starts_at ?? '—'}</td><td>{cell.capacity ?? '—'}</td><td><span className="badge">{cell.active ? 'Ativa' : 'Inativa'}</span></td></tr>)}</tbody></table></div>
        ) : <div className="empty">Nenhuma célula cadastrada.</div>}
      </section>
    </>
  );
}
