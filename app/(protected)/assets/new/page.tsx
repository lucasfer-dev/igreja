import Link from 'next/link';
import { ArrowLeft, Boxes, CircleDollarSign, MapPin, Tag } from 'lucide-react';
import { createAsset } from '../actions';

export default async function NewAsset({searchParams}:{searchParams:Promise<{error?:string}>}){
  const params=await searchParams;

  return <div className="creation-page">
    <Link className="creation-back" href="/assets"><ArrowLeft size={15}/> Voltar para patrimônio</Link>

    <div className="creation-layout asset-creation-layout">
      <section className="creation-intro">
        <span className="creation-icon"><Boxes size={23}/></span>
        <span className="module-kicker">Novo patrimônio</span>
        <h1>Cadastre um bem</h1>
        <p>Registre informações suficientes para localizar, identificar e acompanhar a situação do patrimônio da igreja.</p>
        <div className="creation-tips asset-tips">
          <span><Tag size={14}/> Use categoria para organizar instrumentos, áudio, móveis e TI.</span>
          <span><MapPin size={14}/> Informe onde o item fica normalmente.</span>
          <span><CircleDollarSign size={14}/> Valor e data ajudam no controle patrimonial.</span>
        </div>
      </section>

      <section className="creation-form-panel">
        {params.error&&<p className="alert">{params.error}</p>}
        <form action={createAsset} className="form asset-form">
          <div className="field"><label>Nome do bem</label><input name="name" placeholder="Ex.: Mesa de som Yamaha" required/></div>
          <div className="form-row"><div className="field"><label>Categoria</label><input name="category" placeholder="Áudio, instrumento, móvel..."/></div><div className="field"><label>Nº série / tombo</label><input name="serial_number" placeholder="PAT-0001"/></div></div>
          <div className="field"><label>Local atual</label><input name="location" placeholder="Auditório, sala de mídia..."/></div>
          <div className="form-row"><div className="field"><label>Data da compra</label><input name="purchase_date" type="date"/></div><div className="field"><label>Valor de compra</label><input name="purchase_value" type="number" min="0" step="0.01" placeholder="0,00"/></div></div>
          <div className="field"><label>Situação</label><select name="status" defaultValue="active"><option value="active">Ativo</option><option value="maintenance">Em manutenção</option><option value="retired">Baixado</option></select></div>
          <div className="field"><label>Observações</label><textarea name="notes" rows={4} placeholder="Estado de conservação, acessórios, garantia..."/></div>
          <div className="creation-actions"><Link href="/assets">Cancelar</Link><button className="primary-submit" type="submit">Cadastrar patrimônio</button></div>
        </form>
      </section>
    </div>
  </div>;
}
