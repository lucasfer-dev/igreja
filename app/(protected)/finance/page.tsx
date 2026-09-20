import { CircleDollarSign } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createTransaction } from './actions';

export default async function Finance() {
  const { supabase, churchId } = await requireChurch();
  const { data, error } = await supabase.from('transactions').select('id,direction,category,amount,occurred_at,description').eq('church_id', churchId).order('occurred_at', { ascending: false });
  const totals = (data || []).reduce((acc,row)=>{ const n=Number(row.amount); if(row.direction==='income')acc.income+=n;else acc.expense+=n; return acc;},{income:0,expense:0});

  return (
    <>
      <header className="topbar"><div className="title"><span className="eyebrow">Gestão financeira</span><h1>Financeiro</h1><p>Receitas, despesas e acompanhamento do caixa.</p></div></header>
      <section className="grid kpis finance-kpis"><div className="card kpi"><span className="muted">Entradas</span><strong className="positive">{totals.income.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div><div className="card kpi"><span className="muted">Saídas</span><strong>{totals.expense.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div><div className="card kpi"><span className="muted">Saldo</span><strong>{(totals.income-totals.expense).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div></section>
      <section className="content-grid admin-grid">
        <div className="card">{error ? <p className="alert">{error.message}</p> : data?.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>{data.map(item => <tr key={item.id}><td>{new Date(item.occurred_at+'T12:00:00').toLocaleDateString('pt-BR')}</td><td><span className="badge">{item.direction==='income'?'Entrada':'Saída'}</span></td><td>{item.category}</td><td>{item.description||'—'}</td><td><strong>{Number(item.amount).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></td></tr>)}</tbody></table></div> : <div className="empty">Nenhum lançamento financeiro registrado.</div>}</div>
        <aside className="card sticky-card"><div className="section-head"><h2>Novo lançamento</h2><span className="metric-icon"><CircleDollarSign size={18}/></span></div><form action={createTransaction} className="form"><div className="field"><label htmlFor="direction">Tipo</label><select id="direction" name="direction" defaultValue="income"><option value="income">Entrada</option><option value="expense">Saída</option></select></div><div className="field"><label htmlFor="category">Categoria</label><input id="category" name="category" placeholder="Dízimo, oferta, aluguel..." required/></div><div className="field"><label htmlFor="amount">Valor</label><input id="amount" name="amount" type="number" min="0.01" step="0.01" required/></div><div className="field"><label htmlFor="occurredAt">Data</label><input id="occurredAt" name="occurredAt" type="date" required/></div><div className="field"><label htmlFor="description">Descrição</label><textarea id="description" name="description" rows={3}/></div><button className="btn" type="submit">Salvar lançamento</button></form></aside>
      </section>
    </>
  );
}
