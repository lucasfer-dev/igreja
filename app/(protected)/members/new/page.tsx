import { createMember } from '../actions';

export default async function NewMember({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <>
      <header className="topbar"><div className="title"><h1>Novo membro</h1><p>Cadastre os dados essenciais.</p></div></header>
      <section className="card" style={{ maxWidth: 760 }}>
        {params.error && <p className="alert">{params.error}</p>}
        <form action={createMember} className="form">
          <div className="field"><label htmlFor="full_name">Nome completo</label><input id="full_name" name="full_name" required /></div>
          <div className="form-row">
            <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" /></div>
            <div className="field"><label htmlFor="phone">Telefone</label><input id="phone" name="phone" /></div>
          </div>
          <div className="form-row">
            <div className="field"><label htmlFor="birth_date">Nascimento</label><input id="birth_date" name="birth_date" type="date" /></div>
            <div className="field"><label htmlFor="status">Situação</label><select id="status" name="status" defaultValue="member"><option value="visitor">Visitante</option><option value="attendee">Frequentador</option><option value="member">Membro</option><option value="leader">Líder</option><option value="volunteer">Voluntário</option><option value="inactive">Inativo</option></select></div>
          </div>
          <button className="btn" type="submit">Salvar membro</button>
        </form>
      </section>
    </>
  );
}
