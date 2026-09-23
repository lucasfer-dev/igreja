import { requirePermission } from '@/lib/auth';
import { createMember } from '../actions';

export default async function NewMember({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requirePermission('members.create');
  const params = await searchParams;
  return <><header className="topbar"><div className="title"><span className="eyebrow">Pessoas</span><h1>Novo membro</h1><p>Crie um cadastro completo para acompanhamento da pessoa.</p></div></header><section className="card form-card">{params.error&&<p className="alert">{params.error}</p>}<form action={createMember} className="form">
    <div className="field"><label htmlFor="full_name">Nome completo</label><input id="full_name" name="full_name" required/></div>
    <div className="form-row"><div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email"/></div><div className="field"><label htmlFor="phone">Telefone</label><input id="phone" name="phone"/></div></div>
    <div className="form-row"><div className="field"><label htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp"/></div><div className="field"><label htmlFor="birth_date">Nascimento</label><input id="birth_date" name="birth_date" type="date"/></div></div>
    <div className="form-row"><div className="field"><label htmlFor="cpf">CPF</label><input id="cpf" name="cpf" inputMode="numeric"/></div><div className="field"><label htmlFor="status">Situação</label><select id="status" name="status" defaultValue="member"><option value="visitor">Visitante</option><option value="attendee">Frequentador</option><option value="member">Membro</option><option value="leader">Líder</option><option value="volunteer">Voluntário</option><option value="inactive">Inativo</option></select></div></div>
    <div className="field"><label htmlFor="address">Endereço</label><input id="address" name="address"/></div>
    <div className="form-row"><div className="field"><label htmlFor="marital_status">Estado civil</label><input id="marital_status" name="marital_status"/></div><div className="field"><label htmlFor="profession">Profissão</label><input id="profession" name="profession"/></div></div>
    <div className="form-row"><div className="field"><label htmlFor="gender">Sexo</label><select id="gender" name="gender" defaultValue=""><option value="">Não informar</option><option value="female">Feminino</option><option value="male">Masculino</option></select></div><div className="field"><label htmlFor="joined_at">Entrada na igreja</label><input id="joined_at" name="joined_at" type="date"/></div></div>
    <div className="form-row"><div className="field"><label htmlFor="conversion_date">Conversão</label><input id="conversion_date" name="conversion_date" type="date"/></div><div className="field"><label htmlFor="baptism_date">Batismo</label><input id="baptism_date" name="baptism_date" type="date"/></div></div>
    <div className="form-row"><div className="field"><label htmlFor="emergency_contact_name">Contato de emergência</label><input id="emergency_contact_name" name="emergency_contact_name"/></div><div className="field"><label htmlFor="emergency_contact_phone">Telefone emergência</label><input id="emergency_contact_phone" name="emergency_contact_phone"/></div></div>
    <div className="field"><label htmlFor="notes">Observações</label><textarea id="notes" name="notes" rows={4}/></div>
    <button className="btn" type="submit">Salvar membro</button>
  </form></section></>;
}
