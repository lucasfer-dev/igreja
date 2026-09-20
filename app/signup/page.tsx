import Link from 'next/link';
import { Church } from 'lucide-react';
import { signUp } from './actions';

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="auth-layout"><section className="auth-brand"><div className="brand-pill"><Church size={18} /> ChurchOS</div><h1>Uma plataforma para cuidar de pessoas e organizar a igreja.</h1><p>Membros, visitantes, células, eventos, equipes, Kids, financeiro e comunicação em um só ambiente.</p></section><section className="login-card auth-card"><span className="eyebrow">Primeiro acesso</span><h2>Criar conta</h2><p className="muted">Comece criando seu usuário administrador.</p>{params.error && <p className="alert">{params.error}</p>}<form action={signUp} className="form"><div className="field"><label htmlFor="fullName">Nome completo</label><input id="fullName" name="fullName" required /></div><div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required /></div><div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" minLength={8} required /></div><button className="btn large" type="submit">Criar minha conta</button></form><p className="auth-switch">Já tem acesso? <Link href="/login">Entrar</Link></p></section></main>;
}
