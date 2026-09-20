import { requireChurch } from '@/lib/auth';

export default async function KidsPage() {
  const { supabase, churchId } = await requireChurch();
  const [{ data: children }, { data: checkins }] = await Promise.all([
    supabase.from('kids_children').select('id,full_name,birth_date,guardian_name,guardian_phone,allergies').eq('church_id', churchId).eq('active', true).order('full_name'),
    supabase.from('kids_checkins').select('id,security_code,checked_in_at,checked_out_at,kids_children(full_name)').eq('church_id', churchId).order('checked_in_at', { ascending: false }).limit(20),
  ]);

  return <><header className="topbar"><div className="title"><span className="eyebrow">Segurança infantil</span><h1>Kids</h1><p>Crianças cadastradas e histórico recente de entrada e saída.</p></div></header><section className="content-grid admin-grid"><div className="card"><div className="section-head"><h2>Crianças</h2><span className="badge">{children?.length || 0} ativas</span></div>{children?.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Nome</th><th>Responsável</th><th>Telefone</th><th>Alergias</th></tr></thead><tbody>{children.map((child) => <tr key={child.id}><td><strong>{child.full_name}</strong></td><td>{child.guardian_name}</td><td>{child.guardian_phone || '—'}</td><td>{child.allergies || '—'}</td></tr>)}</tbody></table></div> : <div className="empty">Nenhuma criança cadastrada ainda.</div>}</div><aside className="card"><h2>Check-ins recentes</h2><div className="mini-list">{checkins?.length ? checkins.map((item: any) => <div className="mini-item" key={item.id}><strong>{item.kids_children?.full_name || 'Criança'}</strong><span>Código {item.security_code} • {new Date(item.checked_in_at).toLocaleString('pt-BR')}</span></div>) : <div className="empty compact">Nenhum check-in recente.</div>}</div></aside></section></>;
}
