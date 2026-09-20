import { Church, CheckCircle2, Palette, UsersRound } from 'lucide-react';
import { createChurch } from './actions';
import { requireUser } from '@/lib/auth';

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { user } = await requireUser();
  const params = await searchParams;

  return (
    <main className="onboarding-wrap">
      <section className="onboarding-copy">
        <div className="brand-pill"><Church size={18} /> ChurchOS</div>
        <span className="eyebrow">Configuração inicial</span>
        <h1>Sua igreja organizada desde o primeiro acesso.</h1>
        <p>Crie o ambiente principal agora. Depois você poderá cadastrar membros, células, equipes, eventos, financeiro, Kids e comunicação.</p>
        <div className="benefit-list">
          <div><CheckCircle2 size={18} /><span><strong>Ambiente seguro e separado</strong><small>Os dados ficam isolados por igreja.</small></span></div>
          <div><UsersRound size={18} /><span><strong>Equipe com permissões</strong><small>Admin, liderança, secretaria, financeiro e membros.</small></span></div>
          <div><Palette size={18} /><span><strong>Identidade própria</strong><small>Nome, cores e experiência da sua comunidade.</small></span></div>
        </div>
      </section>

      <section className="onboarding-card">
        <div className="step-indicator"><span className="active">1</span><i></i><span>2</span><i></i><span>3</span></div>
        <div><span className="eyebrow">Passo 1 de 3</span><h2>Configure sua igreja</h2><p className="muted">Essas informações criam sua organização e a unidade principal.</p></div>
        {params.error && <p className="alert">{params.error}</p>}
        <form action={createChurch} className="form">
          <div className="field"><label htmlFor="churchName">Nome da igreja</label><input id="churchName" name="churchName" placeholder="Ex.: Igreja Comunidade da Graça" required /></div>
          <div className="form-row">
            <div className="field"><label htmlFor="unitName">Unidade principal</label><input id="unitName" name="unitName" placeholder="Sede" defaultValue="Sede" required /></div>
            <div className="field"><label htmlFor="phone">Telefone / WhatsApp</label><input id="phone" name="phone" placeholder="(21) 99999-9999" /></div>
          </div>
          <div className="field"><label htmlFor="adminName">Seu nome</label><input id="adminName" name="adminName" placeholder="Nome do administrador" required /></div>
          <div className="field"><label htmlFor="email">E-mail administrativo</label><input id="email" name="email" type="email" defaultValue={user.email || ''} required /></div>
          <button className="btn large" type="submit">Criar minha igreja</button>
        </form>
        <p className="form-note">Você poderá completar logo, cores, endereço e módulos depois em Configurações.</p>
      </section>
    </main>
  );
}
