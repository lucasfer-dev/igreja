import { createVisitor } from '../actions';

const interests=[
  ['small_group','Quero conhecer um pequeno grupo'],
  ['baptism','Gostaria de saber mais sobre o batismo'],
  ['pastoral_visit','Desejo uma conversa ou visita pastoral'],
  ['ministry','Tenho interesse em servir em um ministério'],
  ['just_visiting','Quero apenas frequentar/conhecer por enquanto'],
] as const;

export default async function NewVisitor({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <>
    <header className="page-heading">
      <div><span className="page-kicker">Acolhimento</span><h1>Novo visitante</h1><p>Registre o cartão de conexão com consentimento e próximos passos.</p></div>
    </header>
    <section className="panel visitor-form-panel">
      {params.error && <p className="alert" role="alert">{params.error}</p>}
      <form action={createVisitor} className="form">
        <div className="form-section-title"><strong>Dados pessoais</strong><span>Informações fornecidas pela própria pessoa.</span></div>
        <div className="field"><label htmlFor="full_name">Nome completo</label><input id="full_name" name="full_name" autoComplete="name" required /></div>
        <div className="form-row">
          <div className="field"><label htmlFor="birth_date">Data de nascimento</label><input id="birth_date" name="birth_date" type="date" autoComplete="bday"/></div>
          <div className="field"><label htmlFor="phone">WhatsApp / telefone</label><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(21) 99999-9999" /></div>
        </div>
        <div className="form-row">
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" /></div>
          <div className="field"><label htmlFor="source">Como conheceu a igreja?</label><input id="source" name="source" /></div>
        </div>

        <div className="form-section-title"><strong>Visita</strong><span>Contexto para um acolhimento mais humano.</span></div>
        <div className="form-row">
          <div className="field"><label htmlFor="visit_status">Status da visita</label><select id="visit_status" name="visit_status" defaultValue="first_time"><option value="first_time">Primeira vez</option><option value="returning">Já esteve aqui e retornou</option></select></div>
          <div className="field"><label htmlFor="location_status">Região</label><select id="location_status" name="location_status" defaultValue="local"><option value="local">Mora na região</option><option value="other_city">Outra cidade/região</option></select></div>
        </div>

        <fieldset className="visitor-interest-fieldset"><legend>Próximos passos de interesse</legend>
          {interests.map(([value,label])=><label key={value}><input type="checkbox" name="interests" value={value}/><span>{label}</span></label>)}
        </fieldset>

        <div className="field"><label htmlFor="prayer_request">Motivo de oração</label><textarea id="prayer_request" name="prayer_request" rows={4} maxLength={2000} placeholder="Como podemos orar por você e sua família esta semana?"/></div>

        <div className="visitor-consents">
          <label><input name="lgpd_consent" type="checkbox" required/> <span>A pessoa autorizou o uso destes dados exclusivamente para acolhimento, comunicação e acompanhamento ministerial.</span></label>
          <label><input name="whatsapp_opt_in" type="checkbox"/> <span>A pessoa autorizou receber mensagens e follow-ups da igreja pelo WhatsApp.</span></label>
        </div>
        <small className="field-help">Nunca marque consentimentos sem a autorização expressa da pessoa.</small>
        <button className="primary-submit" type="submit">Salvar visitante</button>
      </form>
    </section>
  </>;
}
