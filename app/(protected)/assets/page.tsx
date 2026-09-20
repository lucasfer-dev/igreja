import Link from 'next/link';
import { Boxes, CircleDollarSign, MapPin, Plus, Search, Wrench } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

function money(value:number){
  return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

export default async function Assets({searchParams}:{searchParams:Promise<{q?:string;status?:string;category?:string}>}){
  const params=await searchParams;
  const {supabase,churchId}=await requireChurch();
  const {data,error}=await supabase.from('assets').select('*').eq('church_id',churchId).order('name');

  const all=data||[];
  const categories=[...new Set(all.map(x=>x.category).filter(Boolean) as string[])].sort();
  const filtered=all.filter(item=>{
    const q=(params.q||'').toLowerCase();
    const matchesQ=!q||item.name.toLowerCase().includes(q)||String(item.serial_number||'').toLowerCase().includes(q)||String(item.location||'').toLowerCase().includes(q);
    const matchesStatus=!params.status||item.status===params.status;
    const matchesCategory=!params.category||item.category===params.category;
    return matchesQ&&matchesStatus&&matchesCategory;
  });

  const totalValue=all.reduce((a,x)=>a+Number(x.purchase_value||0),0);
  const active=all.filter(x=>x.status==='active').length;
  const maintenance=all.filter(x=>x.status==='maintenance').length;
  const locations=new Set(all.map(x=>x.location).filter(Boolean)).size;

  return <>
    <header className="module-heading">
      <div><span className="module-kicker">Patrimônio</span><h1>Inventário da igreja</h1><p>Controle equipamentos, instrumentos, móveis e ativos por local, categoria e situação.</p></div>
      <Link className="module-primary" href="/assets/new"><Plus size={16}/> Novo bem</Link>
    </header>

    <section className="asset-summary">
      <div><Boxes size={20}/><div><strong>{all.length}</strong><span>Itens cadastrados</span></div></div>
      <div><CircleDollarSign size={20}/><div><strong>{money(totalValue)}</strong><span>Valor registrado</span></div></div>
      <div><Wrench size={20}/><div><strong>{maintenance}</strong><span>Em manutenção</span></div></div>
      <div><MapPin size={20}/><div><strong>{locations}</strong><span>Locais com patrimônio</span></div></div>
    </section>

    <section className="module-toolbar asset-toolbar">
      <form>
        <div className="module-search"><Search size={16}/><input name="q" placeholder="Buscar por nome, tombo ou local..." defaultValue={params.q||''}/></div>
        <select name="category" defaultValue={params.category||''}><option value="">Todas as categorias</option>{categories.map(category=><option value={category} key={category}>{category}</option>)}</select>
        <select name="status" defaultValue={params.status||''}><option value="">Todos os status</option><option value="active">Ativo</option><option value="maintenance">Manutenção</option><option value="retired">Baixado</option></select>
        <button type="submit">Filtrar</button>
      </form>
    </section>

    {error?<p className="alert">{error.message}</p>:filtered.length?
      <section className="asset-inventory">
        <div className="asset-table-head"><span>Bem</span><span>Categoria</span><span>Local</span><span>Status</span><span>Valor</span></div>
        {filtered.map(item=><article className="asset-row" key={item.id}>
          <div className="asset-primary"><span className="asset-icon"><Boxes size={17}/></span><div><strong>{item.name}</strong><small>{item.serial_number?'Tombo / série: '+item.serial_number:'Sem número de tombo'}</small></div></div>
          <span>{item.category||'Sem categoria'}</span>
          <span>{item.location||'Não informado'}</span>
          <span><i className={'asset-status '+item.status}>{item.status==='active'?'Ativo':item.status==='maintenance'?'Manutenção':'Baixado'}</i></span>
          <strong>{item.purchase_value?money(Number(item.purchase_value)):'—'}</strong>
        </article>)}
      </section>
      :<section className="module-empty-state"><Boxes size={36}/><h2>Nenhum patrimônio encontrado</h2><p>{all.length?'Ajuste os filtros para encontrar outros itens.':'Cadastre equipamentos, móveis e instrumentos para montar o inventário.'}</p>{!all.length&&<Link href="/assets/new">Cadastrar primeiro bem</Link>}</section>}

    {all.length>0&&<div className="asset-footer-note"><span>{active} ativo(s)</span><span>{maintenance} em manutenção</span><span>{filtered.length} exibido(s)</span></div>}
  </>;
}
