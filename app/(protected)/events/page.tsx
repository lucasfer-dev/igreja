import { requireChurch } from '@/lib/auth';

export default async function Events() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase.from('events').select('id,title,starts_at,status,capacity').eq('church_id', churchId).order('starts_at');

  return (
    <>
      <header className="topbar"><div className="title"><h1>Eventos</h1><p>Cultos, cursos, conferências e inscrições.</p></div></header>
      <section className="card">
        {error ? <p className="alert">{error.message}</p> : data?.length ? (
          <div className="table-wrap"><table className="table"><thead><tr><th>Evento</th><th>Data</th><th>Vagas</th><th>Status</th></tr></thead>
          <tbody>{data.map(item => <tr key={item.id}><td>{item.title}</td><td>{new Date(item.starts_at).toLocaleString('pt-BR')}</td><td>{item.capacity ?? '—'}</td><td><span className="badge">{item.status}</span></td></tr>)}</tbody></table></div>
        ) : <div className="empty">Nenhum evento cadastrado.</div>}
      </section>
    </>
  );
}
