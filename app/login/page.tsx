import Link from 'next/link';
import { ArrowRight, Church, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import { login } from './actions';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="auth-logo"><span><Church size={18}/></span><strong>ChurchOS</strong></div>
          <div className="auth-aside-content">
            <span className="auth-kicker">Gestão integrada para igrejas</span>
            <h1>Menos planilhas. Mais clareza no cuidado com pessoas.</h1>
            <p>Centralize pessoas, visitas, eventos, escalas, Kids e financeiro em um único ambiente.</p>
            <div className="auth-feature-list">
              <div><span><UsersRound size={17}/></span><div><strong>Pessoas e acompanhamento</strong><small>Histórico, vínculos e follow-up em um só lugar.</small></div></div>
              <div><span><ShieldCheck size={17}/></span><div><strong>Permissões por função</strong><small>Cada equipe vê apenas o que precisa.</small></div></div>
              <div><span><LockKeyhole size={17}/></span><div><strong>Dados isolados por igreja</strong><small>Arquitetura multi-tenant com controle de acesso.</small></div></div>
            </div>
          </div>
          <span className="auth-aside-foot">ChurchOS • Gestão simples para igrejas</span>
        </aside>

        <section className="auth-main">
          <div className="auth-card-new">
            <div className="auth-card-head">
              <span className="auth-mobile-logo"><Church size={18}/> ChurchOS</span>
              <span className="auth-kicker">Acesso ao sistema</span>
              <h2>Bem-vindo de volta</h2>
              <p>Entre com seu e-mail e senha para continuar.</p>
            </div>

            {params.error && <p className="alert">{params.error}</p>}
            {params.message && <p className="success-alert">{params.message}</p>}

            <form action={login} className="auth-form">
              <label>
                <span>E-mail</span>
                <input name="email" type="email" autoComplete="email" placeholder="voce@igreja.com" required />
              </label>
              <label>
                <span>Senha</span>
                <input name="password" type="password" autoComplete="current-password" placeholder="Sua senha" required />
              </label>
              <button type="submit">Entrar <ArrowRight size={16}/></button>
            </form>

            <div className="auth-divider"><span>novo por aqui?</span></div>
            <Link className="auth-secondary-action" href="/signup">Criar uma conta</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
