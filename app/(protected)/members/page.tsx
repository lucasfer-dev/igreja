import { requireChurch } from '@/lib/auth';

export default async function Members() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase
    .from('church_members')
    .select('id,full_name,email,phone,status,created_at')
    .eq('church_id', churchId)
    .order('full_name');

  return (
    <>
      <header className="topbar">
        <div className="title"><h1>Membros</h1><p>Cadastro e acompanhamento das pessoas da igreja.</p></div>
        <a className="btn" href="/members/new">Novo membro</a>
      </header>
      <section className="card">
        {error ? <p className="alert">{error.message}</p> : data?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Situação</th></tr></thead>
              <tbody>{data.map(member => (
                <tr key={member.id}>
                  <td>{member.full_name}</td><td>{member.email || '—'}</td><td>{member.phone || '—'}</td>
                  <td><span className="badge">{member.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="empty">Nenhum membro cadastrado.</div>}
      </section>
    </>
  );
}
