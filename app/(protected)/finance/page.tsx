import { requireChurch } from '@/lib/auth';

export default async function Finance() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase.from('transactions').select('id,direction,category,amount,occurred_at,description').eq('church_id', churchId).order('occurred_at', { ascending: false });

  return (
    <>
      <header className="topbar"><div className="title"><h1>Financeiro</h1><p>Receitas, despesas e acompanhamento financeiro.</p></div></header>
      <section className="card">
        {error ? <p className="alert">{error.message}</p> : data?.length ? (
          <div className="table-wrap"><table className="table"><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th></tr></thead>
          <tbody>{data.map(item => <tr key={item.id}><td>{new Date(item.occurred_at + 'T12:00:00').toLocaleDateString('pt-BR')}</td><td>{item.direction === 'income' ? 'Entrada' : 'Saída'}</td><td>{item.category}</td><td>{item.description || '—'}</td><td>{Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>)}</tbody></table></div>
        ) : <div className="empty">Nenhum lançamento financeiro registrado.</div>}
      </section>
    </>
  );
}
