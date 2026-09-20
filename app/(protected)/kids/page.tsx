import { Baby, CheckCircle2, Clock3, Search, ShieldCheck, UserPlus } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { addGuardian, checkInChild, checkOutChild, createChild } from './actions';

export default async function KidsPage({searchParams}:{searchParams:Promise<{error?:string;code?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId}=await requireChurch();

  const [{data:children},{data:checkins},{data:guardians}]=await Promise.all([
    supabase.from('kids_children').select('*').eq('church_id',churchId).eq('active',true).order('full_name'),
    supabase.from('kids_checkins').select('id,child_id,security_code,room,teacher_name,checked_in_at,checked_out_at,kids_children(full_name)').eq('church_id',churchId).order('checked_in_at',{ascending:false}).limit(50),
    supabase.from('kids_guardians').select('*').eq('church_id',churchId).order('full_name'),
  ]);

  const active=(checkins||[]).filter(c=>!c.checked_out_at);

  return <>
    <header className="page-heading">
      <div><span className="page-kicker">Operação de domingo</span><h1>Kids check-in</h1><p>Entrada e retirada segura das crianças em tempo real.</p></div>
      <span className="live-chip"><i/> {active.length} criança(s) dentro agora</span>
    </header>

    {qs.error&&<p className="alert">{qs.error}</p>}
    {qs.code&&<div className="security-code-banner"><ShieldCheck size={20}/><div><span>Check-in realizado</span><strong>Código de retirada: {qs.code}</strong></div></div>}

    <section className="kids-terminal">
      <div className="kids-main">
        <div className="terminal-search"><Search size={18}/><input placeholder="Buscar criança ou responsável..."/></div>

        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Agora</span><h2>Crianças em atendimento</h2></div><span className="section-count">{active.length}</span></div>
          {active.length?<div className="active-kids-grid">{active.map((item:any)=>{
            const checkout=checkOutChild.bind(null,item.id);
            const childGuardians=(guardians||[]).filter(g=>g.child_id===item.child_id&&g.can_pickup);
            return <article className="active-kid-card" key={item.id}>
              <div className="active-kid-head"><span className="kid-avatar">{item.kids_children?.full_name?.slice(0,1)||'K'}</span><div><strong>{item.kids_children?.full_name||'Criança'}</strong><span><Clock3 size={13}/> entrou {new Date(item.checked_in_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div></div>
              <div className="kid-meta"><span>Sala <strong>{item.room||'—'}</strong></span><span>Professor <strong>{item.teacher_name||'—'}</strong></span></div>
              <form action={checkout} className="checkout-terminal"><select name="guardian_id" required><option value="">Responsável autorizado</option>{childGuardians.map(g=><option value={g.id} key={g.id}>{g.full_name}</option>)}</select><input name="security_code" inputMode="numeric" placeholder="Código de retirada" required/><button type="submit"><CheckCircle2 size={15}/> Fazer checkout</button></form>
            </article>
          })}</div>:<div className="terminal-empty"><Baby size={28}/><strong>Nenhuma criança em atendimento</strong><span>Os próximos check-ins aparecerão aqui.</span></div>}
        </section>

        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Cadastro</span><h2>Crianças</h2></div><span className="section-count">{children?.length||0}</span></div>
          <div className="kids-directory">{children?.length?children.map(child=>{
            const checkin=checkInChild.bind(null,child.id);
            return <article className="kid-directory-row" key={child.id}>
              <div className="person-primary"><span className="kid-avatar small">{child.full_name.slice(0,1)}</span><div><strong>{child.full_name}</strong><small>{child.guardian_name} • {child.guardian_phone||'sem telefone'}</small></div></div>
              <div className="kid-alerts">{child.allergies&&<span>Alergia: {child.allergies}</span>}{child.restrictions&&<span>Restrição: {child.restrictions}</span>}</div>
              <form action={checkin} className="kid-checkin-form"><input name="room" placeholder="Sala"/><input name="teacher_name" placeholder="Professor"/><button type="submit">Check-in</button></form>
            </article>
          }):<div className="empty">Nenhuma criança cadastrada.</div>}</div>
        </section>
      </div>

      <aside className="stack">
        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Novo cadastro</span><h2>Adicionar criança</h2></div><span className="panel-icon"><UserPlus size={17}/></span></div>
          <form action={createChild} className="form">
            <div className="field"><label>Nome</label><input name="fullName" required/></div>
            <div className="field"><label>Nascimento</label><input name="birthDate" type="date"/></div>
            <div className="field"><label>Responsável principal</label><input name="guardianName" required/></div>
            <div className="field"><label>Telefone</label><input name="guardianPhone"/></div>
            <div className="field"><label>Alergias</label><textarea name="allergies" rows={2}/></div>
            <div className="field"><label>Medicamentos</label><textarea name="medications" rows={2}/></div>
            <div className="field"><label>Restrições</label><textarea name="restrictions" rows={2}/></div>
            <button className="primary-submit" type="submit">Cadastrar criança</button>
          </form>
        </section>

        <section className="panel">
          <div className="section-title"><div><span className="section-eyebrow">Segurança</span><h2>Responsáveis autorizados</h2></div></div>
          {children?.slice(0,8).map(child=>{
            const add=addGuardian.bind(null,child.id);
            const gs=(guardians||[]).filter(g=>g.child_id===child.id);
            return <div className="guardian-block compact" key={child.id}>
              <strong>{child.full_name}</strong>
              <div className="guardian-list">{gs.map(g=><span className="soft-status" key={g.id}>{g.full_name}</span>)}</div>
              <form action={add} className="guardian-add"><input name="full_name" placeholder="Novo responsável" required/><input name="phone" placeholder="Telefone"/><input name="relationship" placeholder="Parentesco"/><label><input name="can_pickup" type="checkbox" defaultChecked/> Pode retirar</label><button type="submit">Adicionar</button></form>
            </div>
          })}
        </section>
      </aside>
    </section>
  </>;
}
