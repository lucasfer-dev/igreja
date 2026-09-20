import { createVisitor } from '../actions';

export default async function NewVisitor({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <>
      <header className="topbar"><div className="title"><h1>Novo visitante</h1><p>Cadastro rápido para acompanhamento.</p></div></header>
      <section className="card" style={{ maxWidth: 760 }}>
        {params.error && <p className="alert">{params.error}</p>}
        <form action={createVisitor} className="form">
          <div className="field"><label htmlFor="full_name">Nome completo</label><input id="full_name" name="full_name" required /></div>
          <div className="form-row"><div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" /></div><div className="field"><label htmlFor="phone">Telefone</label><input id="phone" name="phone" /></div></div>
          <div className="field"><label htmlFor="source">Como conheceu a igreja?</label><input id="source" name="source" /></div>
          <button className="btn" type="submit">Salvar visitante</button>
        </form>
      </section>
    </>
  );
}
