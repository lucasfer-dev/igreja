import { requireChurch } from '@/lib/auth';

export default async function VolunteersPage() {
  const { supabase, churchId } = await requireChurch();
  const { data } = await supabase.from('volunteer_schedules').select('id,function_name,starts_at,status,church_members(full_name),ministries(name),events(title)').eq('church_id', churchId).order('starts_at').limit(50);

  return <><header className="topbar"><div className="title"><span className="eyebrow">Equipes</span><h1>Voluntários e escalas</h1><p>Veja quem está escalado, em qual ministério e para qual evento.</p></div></header><section className="card">{data?.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Voluntário</th><th>Função</th><th>Ministério</th><th>Evento</th><th>Horário</th><th>Status</th></tr></thead><tbody>{data.map((row: any) => <tr key={row.id}><td>{row.church_members?.full_name || '—'}</td><td>{row.function_name}</td><td>{row.ministries?.name || '—'}</td><td>{row.events?.title || '—'}</td><td>{new Date(row.starts_at).toLocaleString('pt-BR')}</td><td><span className="badge">{row.status}</span></td></tr>)}</tbody></table></div> : <div className="empty">Nenhuma escala cadastrada ainda.</div>}</section></>;
}
