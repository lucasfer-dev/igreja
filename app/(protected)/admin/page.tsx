import Link from 'next/link';
import { CalendarPlus, CircleDollarSign, Sparkles, UserPlus, UsersRound } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

export default async function AdminDashboard() {
  const { supabase, churchId, churchName } = await requireChurch();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const [members, visitors, cells, events, transactions, recentMembers, recentVisitors] = await Promise.all([
    supabase.from('church_members').select('*', { count: 'exact', head: true }).eq('church_id', churchId).neq('status', 'inactive'),
    supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('church_id', churchId),
    supabase.from('cells').select('*', { count: 'exact', head: true }).eq('church_id', churchId).eq('active', true),
    supabase.from('events').select('id,title,starts_at,status').eq('church_id', churchId).gte('starts_at', now.toISOString()).order('starts_at').limit(5),
    supabase.from('transactions').select('direction,amount,occurred_at').eq('church_id', churchId).gte('occurred_at', monthStart),
    supabase.from('church_members').select('id,full_name,status,created_at').eq('church_id', churchId).order('created_at', { ascending: false }).limit(5),
    supabase.from('visitors').select('id,full_name,stage,created_at').eq('church_id', churchId).order('created_at', { ascending: false }).limit(5),
  ]);

  const finance = (transactions.data || []).reduce((acc, row) => {
    const value = Number(row.amount);
    if (row.direction === 'income') acc.income += value;
    else acc.expense += value;
    return acc;
  }, { income: 0, expense: 0 });

  return (
    <>
      <header className="topbar">
        <div className="title"><span className="eyebrow">Administração</span><h1>{churchName}</h1><p>Uma visão clara da saúde e da operação da sua igreja.</p></div>
        <div className="actions"><Link className="btn secondary" href="/communications">Publicar aviso</Link><Link className="btn" href="/members/new"><UserPlus size={17} /> Novo membro</Link></div>
      </header>

      <section className="grid kpis">
        <div className="card kpi"><span className="metric-icon"><UsersRound size={20} /></span><span className="muted">Membros ativos</span><strong>{members.count || 0}</strong><small>base atual da igreja</small></div>
        <div className="card kpi"><span className="metric-icon"><Sparkles size={20} /></span><span className="muted">Visitantes</span><strong>{visitors.count || 0}</strong><small>acompanhamento de integração</small></div>
        <div className="card kpi"><span className="metric-icon"><UsersRound size={20} /></span><span className="muted">Células ativas</span><strong>{cells.count || 0}</strong><small>grupos em funcionamento</small></div>
        <div className="card kpi"><span className="metric-icon"><CircleDollarSign size={20} /></span><span className="muted">Saldo do mês</span><strong>{(finance.income - finance.expense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong><small>{finance.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em entradas</small></div>
      </section>

      <section className="content-grid admin-grid">
        <div className="stack">
          <section className="card">
            <div className="section-head"><div><span className="eyebrow">Agenda</span><h2>Próximos eventos</h2></div><Link href="/events"><CalendarPlus size={16} /> Gerenciar</Link></div>
            {events.data?.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Evento</th><th>Data</th><th>Status</th></tr></thead><tbody>{events.data.map((event) => <tr key={event.id}><td><strong>{event.title}</strong></td><td>{new Date(event.starts_at).toLocaleString('pt-BR')}</td><td><span className="badge">{event.status}</span></td></tr>)}</tbody></table></div> : <div className="empty">Nenhum evento futuro cadastrado.</div>}
          </section>

          <section className="card">
            <div className="section-head"><h2>Entradas recentes</h2><Link href="/members">Ver membros</Link></div>
            <div className="split-list">
              <div><h3 className="subhead">Novos membros</h3>{recentMembers.data?.length ? recentMembers.data.map((item) => <div className="person-row" key={item.id}><span className="avatar mini">{item.full_name.slice(0, 1)}</span><div><strong>{item.full_name}</strong><span>{String(item.status)}</span></div></div>) : <div className="empty compact">Sem cadastros recentes.</div>}</div>
              <div><h3 className="subhead">Visitantes recentes</h3>{recentVisitors.data?.length ? recentVisitors.data.map((item) => <div className="person-row" key={item.id}><span className="avatar mini">{item.full_name.slice(0, 1)}</span><div><strong>{item.full_name}</strong><span>{String(item.stage)}</span></div></div>) : <div className="empty compact">Sem visitantes recentes.</div>}</div>
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <span className="eyebrow">Ações rápidas</span>
            <h2>O que precisa ser feito?</h2>
            <div className="action-list">
              <Link href="/members/new">Cadastrar membro <span>→</span></Link>
              <Link href="/visitors/new">Registrar visitante <span>→</span></Link>
              <Link href="/communications">Publicar comunicado <span>→</span></Link>
              <Link href="/finance">Lançar financeiro <span>→</span></Link>
              <Link href="/kids">Abrir Kids <span>→</span></Link>
            </div>
          </section>
          <section className="card finance-card"><span className="eyebrow">Financeiro do mês</span><div className="finance-row"><span>Entradas</span><strong className="positive">{finance.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div><div className="finance-row"><span>Saídas</span><strong>{finance.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div><div className="finance-row total"><span>Saldo</span><strong>{(finance.income - finance.expense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div></section>
        </aside>
      </section>
    </>
  );
}
