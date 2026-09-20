import { requireChurch } from '@/lib/auth';

export default async function Visitors() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase
    .from('visitors')
    .select('id,full_name,email,phone,stage,first_visit_at')
    .eq('church_id', churchId)
    .order('created_at', { ascending: false });

  return (
    <>
      <header className="topbar">
        <div className="title"><h1>Visitantes</h1><p>Pipeline de acompanhamento e integração.</p></div>
        <a className="btn" href="/visitors/new">Novo visitante</a>
      </header>
      <section className="card">
        {error ? <p className="alert">{error.message}</p> : data?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Nome</th><th>Contato</th><th>Etapa</th><th>Primeira visita</th></tr></thead>
              <tbody>{data.map(visitor => (
                <tr key={visitor.id}>
                  <td>{visitor.full_name}</td><td>{visitor.phone || visitor.email || '—'}</td>
                  <td><span className="badge">{visitor.stage}</span></td>
                  <td>{visitor.first_visit_at ? new Date(visitor.first_visit_at).toLocaleDateString('pt-BR') : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="empty">Nenhum visitante cadastrado.</div>}
      </section>
    </>
  );
}
