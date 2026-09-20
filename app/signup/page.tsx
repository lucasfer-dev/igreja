import Link from 'next/link';
import { ArrowRight, Church, ShieldCheck, UsersRound, Workflow } from 'lucide-react';
import { signUp } from './actions';

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="auth-logo"><span><Church size={18}/></span><strong>ChurchOS</strong></div>
          <div className="auth-aside-content">
            <span className="auth-kicker">Comece sua estrutura digital</span>
            <h1>Organize a igreja sem transformar pessoas em números.</h1>
            <p>Crie seu ambiente administrativo e configure a operação da sua igreja em poucos passos.</p>
            <div className="auth-feature-list">
              <div><span><Workflow size={17}/></span><div><strong>Fluxos organizados</strong><small>Visitantes, escalas, Kids, eventos e financeiro.</small></div></div>
              <div><span><UsersRound size={17}/></span><div><strong>Equipe integrada</strong><small>Administração, secretaria e lideranças conectadas.</small></div></div>
              <div><span><ShieldCheck size={17}/></span><div><strong>Controle de acesso</strong><small>Permissões por função desde o primeiro acesso.</small></div></div>
            </div>
          </div>
          <span className="auth-aside-foot">Seu ambiente fica separado das demais igrejas.</span>
        </aside>

        <section className="auth-main">
          <div className="auth-card-new">
            <div className="auth-card-head">
              <span className="auth-mobile-logo"><Church size={18}/> ChurchOS</span>
              <span className="auth-kicker">Criar conta</span>
              <h2>Comece agora</h2>
              <p>Crie o usuário administrador da sua igreja.</p>
            </div>

            {params.error && <p className="alert">{params.error}</p>}

            <form action={signUp} className="auth-form">
              <label><span>Nome completo</span><input name="fullName" placeholder="Seu nome" required /></label>
              <label><span>E-mail</span><input name="email" type="email" placeholder="voce@igreja.com" required /></label>
              <label><span>Senha</span><input name="password" type="password" minLength={8} placeholder="Mínimo de 8 caracteres" required /></label>
              <button type="submit">Criar conta <ArrowRight size={16}/></button>
            </form>

            <div className="auth-divider"><span>já possui conta?</span></div>
            <Link className="auth-secondary-action" href="/login">Entrar</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
