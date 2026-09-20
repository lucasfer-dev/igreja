import { requireChurch } from '@/lib/auth';

export default async function Dashboard() {
  const { supabase, churchId } = await requireChurch();

  const [members, visitors, cells, events, transactions] = await Promise.all([
    supabase.from('church_members').select('*', { count: 'exact', head: true }).eq('church_id', churchId).neq('status', 'inactive'),
    supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('church_id', churchId),
    supabase.from('cells').select('*', { count: 'exact', head: true }).eq('church_id', churchId).eq('active', true),
    supabase.from('events').select('id,title,starts_at,status').eq('church_id', churchId).gte('starts_at', new Date().toISOString()).order('starts_at').limit(5),
    supabase.from('transactions').select('direction,amount').eq('church_id', churchId),
  ]);

  const balance = (transactions.data || []).reduce(
    (sum, row) => sum + (row.direction === 'income' ? Number(row.amount) : -Number(row.amount)),
    0,
  );

  return (
    <>
      <header className="topbar">
        <div className="title"><h1>Visão geral</h1><p>Indicadores operacionais da sua igreja.</p></div>
      </header>

      <section className="grid kpis">
        <div className="card kpi"><span className="muted">Membros ativos</span><strong>{members.count || 0}</strong></div>
        <div className="card kpi"><span className="muted">Visitantes</span><strong>{visitors.count || 0}</strong></div>
        <div className="card kpi"><span className="muted">Células ativas</span><strong>{cells.count || 0}</strong></div>
        <div className="card kpi"><span className="muted">Saldo</span><strong>{balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="section-head"><h2>Próximos eventos</h2></div>
          {events.data?.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Evento</th><th>Data</th><th>Status</th></tr></thead>
                <tbody>
                  {events.data.map((event) => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>{new Date(event.starts_at).toLocaleString('pt-BR')}</td>
                      <td><span className="badge">{event.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty">Nenhum evento futuro cadastrado.</div>}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Ações rápidas</h2>
          <div className="grid">
            <a className="btn" href="/members/new">Novo membro</a>
            <a className="btn secondary" href="/visitors/new">Novo visitante</a>
          </div>
        </div>
      </section>
    </>
  );
}
