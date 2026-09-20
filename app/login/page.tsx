import Link from 'next/link';
import { Church } from 'lucide-react';
import { login } from './actions';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <div className="brand-pill"><Church size={18} /> ChurchOS</div>
        <h1>Gestão simples para uma igreja mais próxima das pessoas.</h1>
        <p>Centralize membros, visitantes, células, eventos, equipes, Kids, financeiro e comunicação sem perder o cuidado humano.</p>
        <div className="auth-points"><span>✓ Multiunidade</span><span>✓ Permissões por função</span><span>✓ Área do membro</span></div>
      </section>
      <section className="login-card auth-card">
        <span className="eyebrow">Bem-vindo de volta</span>
        <h2>Entrar na sua igreja</h2>
        <p className="muted">Use seu e-mail e senha para continuar.</p>
        {params.error && <p className="alert">{params.error}</p>}
        {params.message && <p className="success-alert">{params.message}</p>}
        <form action={login} className="form">
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <button className="btn large" type="submit">Entrar</button>
        </form>
        <p className="auth-switch">Ainda não tem conta? <Link href="/signup">Criar conta</Link></p>
      </section>
    </main>
  );
}
