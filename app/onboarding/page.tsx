import { ArrowRight, CheckCircle2, Church, Palette, ShieldCheck, UsersRound } from 'lucide-react';
import { createChurch } from './actions';
import { requireUser } from '@/lib/auth';

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { user } = await requireUser();
  const params = await searchParams;

  return (
    <main className="onboard-page">
      <div className="onboard-shell">
        <aside className="onboard-aside">
          <div className="auth-logo"><span><Church size={18}/></span><strong>ChurchOS</strong></div>
          <div>
            <span className="auth-kicker">Configuração inicial</span>
            <h1>Vamos preparar o ambiente da sua igreja.</h1>
            <p>Essa etapa cria a organização principal, sua primeira unidade e o acesso administrativo.</p>
          </div>
          <div className="onboard-benefits">
            <div><span><ShieldCheck size={17}/></span><div><strong>Ambiente separado</strong><small>Os dados ficam isolados por igreja.</small></div></div>
            <div><span><UsersRound size={17}/></span><div><strong>Equipe com permissões</strong><small>Admin, secretaria, financeiro e lideranças.</small></div></div>
            <div><span><Palette size={17}/></span><div><strong>Identidade própria</strong><small>Depois você ajusta cores, logo e informações públicas.</small></div></div>
          </div>
        </aside>

        <section className="onboard-main">
          <div className="onboard-card-new">
            <div className="onboard-progress">
              <div className="active"><span>1</span><small>Organização</small></div>
              <i/>
              <div><span>2</span><small>Equipe</small></div>
              <i/>
              <div><span>3</span><small>Concluir</small></div>
            </div>

            <div className="auth-card-head">
              <span className="auth-kicker">Passo 1 de 3</span>
              <h2>Dados da igreja</h2>
              <p>Comece pelas informações básicas da organização.</p>
            </div>

            {params.error && <p className="alert">{params.error}</p>}

            <form action={createChurch} className="auth-form onboarding-form">
              <label><span>Nome da igreja</span><input name="churchName" placeholder="Ex.: Igreja Comunidade da Graça" required /></label>
              <div className="onboard-row">
                <label><span>Unidade principal</span><input name="unitName" defaultValue="Sede" required /></label>
                <label><span>Telefone / WhatsApp</span><input name="phone" placeholder="(21) 99999-9999" /></label>
              </div>
              <label><span>Seu nome</span><input name="adminName" placeholder="Nome do administrador" required /></label>
              <label><span>E-mail administrativo</span><input name="email" type="email" defaultValue={user.email || ''} required /></label>
              <button type="submit">Criar minha igreja <ArrowRight size={16}/></button>
            </form>

            <div className="onboard-note"><CheckCircle2 size={14}/> Você poderá alterar essas informações depois.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
