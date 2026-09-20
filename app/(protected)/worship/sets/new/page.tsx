import Link from 'next/link';
import { ArrowLeft, ListMusic } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { createSet } from '../../actions';

export default async function NewSet({searchParams}:{searchParams:Promise<{error?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId}=await requireChurch();
  const [{data:events},{data:members}]=await Promise.all([
    supabase.from('events').select('id,title,starts_at').eq('church_id',churchId).gte('starts_at',new Date().toISOString()).order('starts_at').limit(40),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name'),
  ]);
  return <div className="creation-page"><Link className="creation-back" href="/worship"><ArrowLeft size={15}/> Voltar para louvor</Link><div className="creation-layout"><section className="creation-intro"><span className="creation-icon"><ListMusic size={23}/></span><span className="module-kicker">Planejamento</span><h1>Novo plano de louvor</h1><p>Vincule o plano a um culto quando possível. Isso permite enxergar repertório e equipe escalada no mesmo lugar.</p></section><section className="creation-form-panel">{qs.error&&<p className="alert">{qs.error}</p>}<form action={createSet} className="form"><div className="field"><label>Nome do plano</label><input name="title" placeholder="Culto de domingo — noite" required/></div><div className="field"><label>Evento / culto</label><select name="event_id"><option value="">Sem evento vinculado</option>{events?.map(e=><option key={e.id} value={e.id}>{e.title} — {new Date(e.starts_at).toLocaleString('pt-BR')}</option>)}</select></div><div className="field"><label>Líder de louvor</label><select name="leader_member_id"><option value="">Não definido</option>{members?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div><div className="form-row"><div className="field"><label>Data do culto</label><input name="scheduled_at" type="datetime-local"/></div><div className="field"><label>Ensaio</label><input name="rehearsal_at" type="datetime-local"/></div></div><div className="field"><label>Status</label><select name="status" defaultValue="draft"><option value="draft">Rascunho</option><option value="ready">Pronto</option><option value="completed">Concluído</option></select></div><div className="field"><label>Observações para a equipe</label><textarea name="notes" rows={4}/></div><div className="creation-actions"><Link href="/worship">Cancelar</Link><button className="primary-submit" type="submit">Criar plano</button></div></form></section></div></div>;
}
