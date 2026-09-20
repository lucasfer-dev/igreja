import Link from 'next/link';
import { ArrowLeft, Gift, LockKeyhole } from 'lucide-react';
import { requireChurch } from '@/lib/auth';
import { registerDonation } from '../actions';

export default async function NewDonation({searchParams}:{searchParams:Promise<{error?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId,roleKey,user}=await requireChurch();
  const isStaff=roleKey!=='member';
  const [{data:campaigns},{data:members},{data:ownMember}]=await Promise.all([
    supabase.from('donation_campaigns').select('id,title').eq('church_id',churchId).eq('active',true).order('title'),
    isStaff?supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name'):Promise.resolve({data:[] as any[]}),
    supabase.from('church_members').select('id').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle(),
  ]);

  return <div className="creation-page">
    <Link className="creation-back" href="/donations"><ArrowLeft size={15}/> Voltar para dízimos & ofertas</Link>
    <div className="creation-layout">
      <section className="creation-intro"><span className="creation-icon"><Gift size={23}/></span><span className="module-kicker">{isStaff?'Novo registro':'Contribuição'}</span><h1>{isStaff?'Registrar contribuição':'Registrar minha contribuição'}</h1><p>{isStaff?'Cadastre uma entrada de doação sem misturá-la ao lançamento de despesas e receitas operacionais.':'Registre uma contribuição realizada à sua igreja.'}</p><div className="creation-tips"><span><LockKeyhole size={14}/> Contribuições ficam protegidas pelo acesso da igreja.</span><span>Campanha e fundo ajudam a classificar a finalidade.</span><span>O modo anônimo oculta seu nome nas telas administrativas comuns.</span></div></section>
      <section className="creation-form-panel">{qs.error&&<p className="alert">{qs.error}</p>}<form action={registerDonation} className="form">
        {isStaff?<div className="field"><label>Contribuinte</label><select name="member_id" required><option value="">Selecione uma pessoa</option>{members?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div>:<input type="hidden" name="member_id" value={ownMember?.id||''}/>}
        <div className="form-row"><div className="field"><label>Valor</label><input name="amount" type="number" min="0.01" step="0.01" required/></div><div className="field"><label>Data</label><input name="occurred_at" type="datetime-local"/></div></div>
        <div className="field"><label>Fundo / categoria</label><input name="fund" defaultValue="Geral" placeholder="Geral, Missões, Construção..."/></div>
        <div className="field"><label>Campanha</label><select name="campaign_id"><option value="">Sem campanha específica</option>{campaigns?.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select></div>
        <div className="field"><label>Método</label><select name="method"><option value="pix">PIX</option><option value="cash">Dinheiro</option><option value="card">Cartão</option><option value="transfer">Transferência</option><option value="other">Outro</option></select></div>
        <label className="check-row"><input name="anonymous" type="checkbox"/> Exibir como contribuição anônima</label>
        <div className="field"><label>Observações</label><textarea name="notes" rows={3}/></div>
        <div className="creation-actions"><Link href="/donations">Cancelar</Link><button className="primary-submit" type="submit">Salvar contribuição</button></div>
      </form></section>
    </div>
  </div>;
}
