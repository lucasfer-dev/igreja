import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Plus, WalletCards } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createTransaction } from './actions';

function money(value:number){return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}

export default async function Finance(){
  const {supabase,churchId}=await requireChurch();
  const {data,error}=await supabase.from('transactions').select('id,direction,category,amount,occurred_at,description').eq('church_id',churchId).order('occurred_at',{ascending:false});
  const totals=(data||[]).reduce((acc,row)=>{const n=Number(row.amount);if(row.direction==='income')acc.income+=n;else acc.expense+=n;return acc;},{income:0,expense:0});
  const categories=(data||[]).reduce<Record<string,number>>((acc,row)=>{const key=row.category||'Outros';acc[key]=(acc[key]||0)+Number(row.amount);return acc;},{});
  const topCategories=Object.entries(categories).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxCategory=Math.max(1,...topCategories.map(([,v])=>v));

  return <>
    <header className="page-heading">
      <div><span className="page-kicker">Financeiro</span><h1>Visão financeira</h1><p>Caixa, lançamentos e categorias em uma única visão.</p></div>
      <a className="primary-action" href="#novo-lancamento"><Plus size={16}/> Novo lançamento</a>
    </header>

    <nav className="subnav"><a className="active" href="/finance">Visão geral</a><a href="#lancamentos">Lançamentos</a><a href="/donations">Dízimos & ofertas</a><a href="/reports">Relatórios</a></nav>

    <section className="finance-overview">
      <article><span>Saldo atual</span><strong>{money(totals.income-totals.expense)}</strong><small className={totals.income>=totals.expense?'positive':'negative'}>{totals.income>=totals.expense?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>} resultado acumulado</small></article>
      <article><span>Entradas</span><strong>{money(totals.income)}</strong><small className="positive"><ArrowUpRight size={14}/> receitas</small></article>
      <article><span>Saídas</span><strong>{money(totals.expense)}</strong><small><ArrowDownRight size={14}/> despesas</small></article>
    </section>

    <section className="dashboard-main-grid">
      <div className="stack">
        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Distribuição</span><h2>Movimentação por categoria</h2></div></div>
          <div className="category-bars">{topCategories.length?topCategories.map(([category,value])=><div className="category-row" key={category}><div><strong>{category}</strong><span>{money(value)}</span></div><div className="category-track"><i style={{width:`${(value/maxCategory)*100}%`}}/></div></div>):<div className="empty compact">Sem dados suficientes.</div>}</div>
        </section>

        <section className="panel" id="lancamentos">
          <div className="section-title"><div><span className="section-eyebrow">Histórico</span><h2>Últimos lançamentos</h2></div></div>
          {error?<p className="alert">{error.message}</p>:data?.length?<div className="finance-list">{data.map(item=><div className="finance-entry" key={item.id}><span className={'finance-entry-icon '+item.direction}>{item.direction==='income'?<ArrowUpRight size={16}/>:<ArrowDownRight size={16}/>}</span><div><strong>{item.category}</strong><span>{item.description||'Sem descrição'} • {new Date(item.occurred_at+'T12:00:00').toLocaleDateString('pt-BR')}</span></div><strong className={item.direction==='income'?'positive':''}>{item.direction==='income'?'+ ':'- '}{money(Number(item.amount))}</strong></div>)}</div>:<div className="empty">Nenhum lançamento.</div>}
        </section>
      </div>

      <aside className="panel sticky-panel" id="novo-lancamento">
        <div className="section-title"><div><span className="section-eyebrow">Novo</span><h2>Lançamento financeiro</h2></div><span className="panel-icon"><WalletCards size={18}/></span></div>
        <form action={createTransaction} className="form">
          <div className="field"><label>Tipo</label><select name="direction" defaultValue="income"><option value="income">Entrada</option><option value="expense">Saída</option></select></div>
          <div className="field"><label>Categoria</label><input name="category" placeholder="Dízimo, oferta, aluguel..." required/></div>
          <div className="field"><label>Valor</label><input name="amount" type="number" min="0.01" step="0.01" required/></div>
          <div className="field"><label>Data</label><input name="occurredAt" type="date" required/></div>
          <div className="field"><label>Descrição</label><textarea name="description" rows={3}/></div>
          <button className="primary-submit" type="submit"><CircleDollarSign size={16}/> Salvar lançamento</button>
        </form>
      </aside>
    </section>
  </>;
}
