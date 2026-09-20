import Link from 'next/link';
import { ArrowLeft, Church } from 'lucide-react';
import { createMinistry } from '../actions';

export default async function NewMinistry({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;
  return <div className="creation-page"><Link className="creation-back" href="/ministries"><ArrowLeft size={15}/> Voltar para ministérios</Link><div className="creation-layout"><section className="creation-intro"><span className="creation-icon"><Church size={23}/></span><span className="module-kicker">Novo ministério</span><h1>Crie uma equipe ministerial</h1><p>Depois de criar, você poderá adicionar integrantes, definir funções e acompanhar escalas.</p></section><section className="creation-form-panel">{params.error&&<p className="alert">{params.error}</p>}<form action={createMinistry} className="form"><div className="field"><label>Nome do ministério</label><input name="name" placeholder="Ex.: Louvor" required/></div><div className="field"><label>Descrição</label><textarea name="description" rows={5} placeholder="Qual é a missão e responsabilidade desta equipe?"/></div><div className="creation-actions"><Link href="/ministries">Cancelar</Link><button className="primary-submit" type="submit">Criar ministério</button></div></form></section></div></div>;
}
