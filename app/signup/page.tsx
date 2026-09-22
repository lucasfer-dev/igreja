import Link from 'next/link';
import { ArrowRight, Church, ShieldCheck, UsersRound, Workflow } from 'lucide-react';
import { signUp } from './actions';

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="auth-logo"><span><Church size={18}/></span><strong>Gestão para igrejas</strong></div>
          <div className="auth-aside-content">
            <span className="auth-kicker">Novo ambiente</span>
            <h1>Organize a igreja sem transformar pessoas em números.</h1>
            <p>Crie um ambiente separado para cuidar de pessoas, visitantes, eventos, escalas e comunicação.</p>
            <div className="auth-feature-list">
              <div><span><Workflow size={17}/></span><div><strong>Fluxos organizados</strong><small>Visitantes, escalas, Kids, eventos e comunicação.</small></div></div>
              <div><span><UsersRound size={17}/></span><div><strong>Equipe integrada</strong><small>Administração, secretaria e lideranças conectadas.</small></div></div>
              <div><span><ShieldCheck size={17}/></span><div><strong>Controle de acesso</strong><small>Permissões por função desde o primeiro acesso.</small></div></div>
            </div>
          </div>
          <span className="auth-aside-foot">Cada igreja mantém seu próprio ambiente e seus próprios dados.</span>
        </aside>

        <section className="auth-main">
          <div className="auth-card-new">
            <div className="auth-card-head">
              <span className="auth-mobile-logo"><Church size={18}/> Novo ambiente</span>
              <span className="auth-kicker">Criar conta administrativa</span>
              <h2>Configure sua igreja</h2>
              <p>Crie o usuário responsável pelo novo ambiente.</p>
            </div>

            {params.error && <p className="alert" role="alert">{params.error}</p>}

            <form action={signUp} className="auth-form">
              <label><span>Nome completo</span><input name="fullName" autoComplete="name" placeholder="Seu nome" required /></label>
              <label><span>E-mail</span><input name="email" type="email" autoComplete="email" placeholder="voce@igreja.com" required /></label>
              <label><span>Senha</span><input name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Mínimo de 8 caracteres" required /></label>
              <button type="submit">Criar ambiente <ArrowRight size={16}/></button>
            </form>

            <div className="auth-divider"><span>já possui acesso?</span></div>
            <Link className="auth-secondary-action" href="/login">Entrar</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
