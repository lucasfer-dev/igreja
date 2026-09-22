import { Church, HeartHandshake, MapPin, MessageCircle, UsersRound } from 'lucide-react';
import { submitConnection } from './actions';

const interests = [
  ['small_group','Quero conhecer um pequeno grupo','Encontre pessoas e caminhe em comunidade.'],
  ['baptism','Gostaria de saber mais sobre o batismo','Receba orientação sobre os próximos passos.'],
  ['pastoral_visit','Desejo uma conversa ou visita pastoral','Nossa liderança pode entrar em contato com você.'],
  ['ministry','Tenho interesse em servir em um ministério','Conheça oportunidades para servir.'],
  ['just_visiting','Quero apenas frequentar por enquanto','Sem pressão. É muito bom ter você por aqui.'],
] as const;

export const metadata = {
  title: 'Conectar | PIBJG',
  description: 'Cartão de conexão da Primeira Igreja Batista em Jardim Gláucia',
};

export default async function ConnectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="connection-page">
      <section className="connection-shell">
        <header className="connection-hero">
          <div className="connection-brand"><span><Church size={22}/></span><div><strong>PIBJG</strong><small>Primeira Igreja Batista em Jardim Gláucia</small></div></div>
          <span className="connection-kicker">Que bom ter você com a gente</span>
          <h1>Vamos nos conhecer melhor?</h1>
          <p>Preencha seu cartão de conexão. É rápido e ajuda nossa equipe a acolher você do jeito certo.</p>
          <div className="connection-points">
            <span><UsersRound size={15}/> Comunidade</span>
            <span><HeartHandshake size={15}/> Cuidado</span>
            <span><MessageCircle size={15}/> Proximidade</span>
          </div>
        </header>

        <form action={submitConnection} className="connection-form">
          {params.error && <p className="alert" role="alert">{params.error}</p>}

          <section className="connection-section">
            <div className="connection-section-head"><span>01</span><div><h2>Sobre você</h2><p>Comece com seus dados básicos.</p></div></div>
            <div className="connection-fields">
              <label className="field field-full"><span>Nome completo</span><input name="full_name" autoComplete="name" required placeholder="Como podemos chamar você?" /></label>
              <label className="field"><span>Data de nascimento</span><input name="birth_date" type="date" autoComplete="bday" /></label>
              <label className="field"><span>WhatsApp</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="(21) 99999-9999" /></label>
            </div>
          </section>

          <section className="connection-section">
            <div className="connection-section-head"><span>02</span><div><h2>Sua visita</h2><p>Conte um pouquinho sobre como chegou até aqui.</p></div></div>
            <fieldset className="connection-choice-group">
              <legend>Você já esteve conosco?</legend>
              <label className="connection-choice"><input type="radio" name="visit_status" value="first_time" required/><span><strong>É minha primeira vez</strong><small>Seja muito bem-vindo(a) à PIBJG.</small></span></label>
              <label className="connection-choice"><input type="radio" name="visit_status" value="returning" required/><span><strong>Já estive aqui e retornei</strong><small>Que alegria receber você novamente.</small></span></label>
            </fieldset>
            <fieldset className="connection-choice-group">
              <legend>Você mora por perto?</legend>
              <label className="connection-choice"><input type="radio" name="location_status" value="local" required/><span><strong>Moro na região</strong><small><MapPin size={13}/> Jardim Gláucia e proximidades.</small></span></label>
              <label className="connection-choice"><input type="radio" name="location_status" value="other_city" required/><span><strong>Sou de outra cidade/região</strong><small>Também é muito bom ter você conosco.</small></span></label>
            </fieldset>
          </section>

          <section className="connection-section">
            <div className="connection-section-head"><span>03</span><div><h2>Próximos passos</h2><p>Marque tudo o que fizer sentido para você.</p></div></div>
            <div className="connection-interest-grid">
              {interests.map(([value,title,copy])=><label className="connection-interest" key={value}><input type="checkbox" name="interests" value={value}/><span><strong>{title}</strong><small>{copy}</small></span></label>)}
            </div>
          </section>

          <section className="connection-section connection-prayer-section">
            <div className="connection-section-head"><span>04</span><div><h2>Podemos orar por você?</h2><p>Se quiser, compartilhe um motivo de oração.</p></div></div>
            <label className="field"><span>Como podemos orar por você e sua família esta semana?</span><textarea name="prayer_request" rows={5} maxLength={2000} placeholder="Escreva somente o que se sentir confortável em compartilhar."/></label>
            <p className="connection-privacy-note"><HeartHandshake size={14}/> Pedidos enviados aqui são tratados como confidenciais pela equipe autorizada.</p>
          </section>

          <section className="connection-consent">
            <label><input type="checkbox" name="lgpd_consent" required/><span>Autorizo que a PIBJG utilize estes dados exclusivamente para acolhimento, comunicação e acompanhamento ministerial.</span></label>
            <label><input type="checkbox" name="whatsapp_opt_in"/><span>Também autorizo receber mensagens de acolhimento e acompanhamento da PIBJG pelo WhatsApp.</span></label>
          </section>

          <div className="connection-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
          <button className="connection-submit" type="submit">Enviar cartão de conexão <HeartHandshake size={18}/></button>
          <p className="connection-footnote">Seus dados não aparecem em páginas públicas e ficam restritos às equipes autorizadas.</p>
        </form>
      </section>
    </main>
  );
}
