import Link from 'next/link';
import { ArrowLeft, UsersRound } from 'lucide-react';
import { createCell } from '../actions';

const days=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

export default async function NewCell({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  return <div className="creation-page">
    <Link className="creation-back" href="/cells"><ArrowLeft size={15}/> Voltar para células</Link>
    <div className="creation-layout">
      <section className="creation-intro"><span className="creation-icon"><UsersRound size={23}/></span><span className="module-kicker">Nova célula</span><h1>Crie um pequeno grupo</h1><p>Defina a rotina básica agora. Liderança e participantes podem ser configurados depois no workspace da célula.</p><div className="creation-tips"><span>1. Dados do encontro</span><span>2. Liderança</span><span>3. Participantes</span><span>4. Presença</span></div></section>
      <section className="creation-form-panel">
        {params.error&&<p className="alert">{params.error}</p>}
        <form action={createCell} className="form">
          <div className="field"><label>Nome da célula</label><input name="name" placeholder="Ex.: Esperança" required/></div>
          <div className="form-row"><div className="field"><label>Dia</label><select name="weekday" defaultValue={2}>{days.map((day,i)=><option value={i} key={day}>{day}</option>)}</select></div><div className="field"><label>Horário</label><input name="startsAt" type="time"/></div></div>
          <div className="field"><label>Local do encontro</label><input name="address" placeholder="Endereço ou referência"/></div>
          <div className="field"><label>Capacidade</label><input name="capacity" type="number" min="1" placeholder="Ex.: 15"/></div>
          <div className="creation-actions"><Link href="/cells">Cancelar</Link><button className="primary-submit" type="submit">Criar célula</button></div>
        </form>
      </section>
    </div>
  </div>;
}
