import { requireChurch } from '@/lib/auth';

export default async function ReportsPage() {
  const { supabase, churchId } = await requireChurch();
  const [members, visitors, events, cells, tx] = await Promise.all([
    supabase.from('church_members').select('*', { count: 'exact', head: true }).eq('church_id', churchId).neq('status', 'inactive'),
    supabase.from('visitors').select('*', { count: 'exact', head: true }).eq('church_id', churchId),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('church_id', churchId),
    supabase.from('cells').select('*', { count: 'exact', head: true }).eq('church_id', churchId).eq('active', true),
    supabase.from('transactions').select('direction,amount').eq('church_id', churchId),
  ]);
  const finance = (tx.data || []).reduce((a, r) => a + (r.direction === 'income' ? Number(r.amount) : -Number(r.amount)), 0);

  return <><header className="topbar"><div className="title"><span className="eyebrow">Inteligência</span><h1>Relatórios</h1><p>Resumo consolidado dos principais indicadores da igreja.</p></div></header><section className="grid kpis"><div className="card kpi"><span className="muted">Membros</span><strong>{members.count || 0}</strong></div><div className="card kpi"><span className="muted">Visitantes</span><strong>{visitors.count || 0}</strong></div><div className="card kpi"><span className="muted">Eventos</span><strong>{events.count || 0}</strong></div><div className="card kpi"><span className="muted">Células ativas</span><strong>{cells.count || 0}</strong></div></section><section className="card report-highlight"><span className="eyebrow">Financeiro acumulado</span><h2>{finance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2><p className="muted">Saldo considerando todos os lançamentos cadastrados.</p></section></>;
}
