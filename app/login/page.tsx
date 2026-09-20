import { login } from './actions';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="login-wrap">
      <section className="login-card">
        <h1>Entrar no ChurchOS</h1>
        <p className="muted">Acesse o ambiente administrativo da sua igreja.</p>
        {params.error && <p className="alert">{params.error}</p>}
        <form action={login} className="form">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button className="btn" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
