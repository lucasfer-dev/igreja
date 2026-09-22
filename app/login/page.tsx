import Link from 'next/link';
import { ArrowRight, CalendarDays, Church, HeartHandshake, MessageCircle, Newspaper } from 'lucide-react';
import { login } from './actions';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="auth-logo"><span><Church size={18}/></span><strong>PIBJG</strong></div>
          <div className="auth-aside-content">
            <span className="auth-kicker">Primeira Igreja Batista em Jardim Gláucia</span>
            <h1>Sua igreja, sua comunidade, onde você estiver.</h1>
            <p>Acompanhe a vida da PIBJG, participe da comunidade e mantenha perto tudo o que importa na sua caminhada.</p>
            <div className="auth-feature-list">
              <div><span><CalendarDays size={17}/></span><div><strong>Agenda da PIBJG</strong><small>Cultos, encontros e próximos eventos.</small></div></div>
              <div><span><Newspaper size={17}/></span><div><strong>Notícias e avisos</strong><small>Fique por dentro do que está acontecendo.</small></div></div>
              <div><span><MessageCircle size={17}/></span><div><strong>Comunidade conectada</strong><small>Grupos, conversas e cuidado em um só lugar.</small></div></div>
            </div>
          </div>
          <span className="auth-aside-foot">PIBJG • Uma comunidade para caminhar junto</span>
        </aside>

        <section className="auth-main">
          <div className="auth-card-new">
            <div className="auth-card-head">
              <span className="auth-mobile-logo"><Church size={18}/> PIBJG</span>
              <span className="auth-kicker">Área do membro e da liderança</span>
              <h2>Bem-vindo à PIBJG</h2>
              <p>Entre com seu e-mail e senha para continuar.</p>
            </div>

            {params.error && <p className="alert" role="alert">{params.error}</p>}
            {params.message && <p className="success-alert">{params.message}</p>}

            <form action={login} className="auth-form">
              <label>
                <span>E-mail</span>
                <input name="email" type="email" autoComplete="email" placeholder="seuemail@exemplo.com" required />
              </label>
              <label>
                <span>Senha</span>
                <input name="password" type="password" autoComplete="current-password" placeholder="Sua senha" required />
              </label>
              <button type="submit">Entrar <ArrowRight size={16}/></button>
            </form>

            <div className="auth-divider"><span>visitando a PIBJG?</span></div>
            <Link className="auth-secondary-action" href="/conectar"><HeartHandshake size={16}/> Preencher cartão de conexão</Link>
            <p className="auth-access-note">Precisa de acesso ao portal? Procure a secretaria ou liderança da igreja.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
