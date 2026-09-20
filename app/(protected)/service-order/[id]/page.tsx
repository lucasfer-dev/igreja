import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowUp, Clock3, ListOrdered, Plus, Trash2, UserRoundCheck } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth';
import { addServiceOrderItem, moveServiceOrderItem, removeServiceOrderItem, updateServiceOrderItem, updateServiceOrderStatus } from '../actions';

const typeLabels:Record<string,string>={
  opening:'Abertura',welcome:'Boas-vindas',prayer:'Oração',worship:'Louvor',offering:'Oferta',
  announcement:'Avisos',sermon:'Palavra',communion:'Ceia',video:'Vídeo',transition:'Transição',
  closing:'Encerramento',custom:'Outro',
};

export default async function ServiceOrderDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
  const {id}=await params; const qs=await searchParams;
  const {supabase,churchId}=await requirePermission('service_order.read');

  const [{data:order},{data:items},{data:members},{data:songs}]=await Promise.all([
    supabase.from('service_orders').select('id,title,scheduled_at,status,notes,events(id,title,starts_at)').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('service_order_items').select('id,position,item_type,title,description,planned_minutes,responsible_member_id,song_id').eq('church_id',churchId).eq('order_id',id).order('position'),
    supabase.from('church_members').select('id,full_name').eq('church_id',churchId).neq('status','inactive').order('full_name').limit(300),
    supabase.from('songs').select('id,title,artist').eq('church_id',churchId).eq('active',true).order('title').limit(300),
  ]);
  if(!order)notFound();

  const memberNames=new Map((members||[]).map(m=>[m.id,m.full_name]));
  const songNames=new Map((songs||[]).map(s=>[s.id,s.title]));
  const totalMinutes=(items||[]).reduce((sum,item)=>sum+Number(item.planned_minutes||0),0);
  const statusAction=updateServiceOrderStatus.bind(null,id);

  return <>
    <Link className="creation-back" href="/service-order"><ArrowLeft size={15}/> Ordens de culto</Link>

    <header className="worship-set-heading">
      <div>
        <span className={'module-status '+(order.status==='ready'||order.status==='live'?'active':'inactive')}>{order.status}</span>
        <h1>{order.title}</h1>
        <div className="workspace-meta">
          <span><Clock3 size={14}/>{order.scheduled_at?new Date(order.scheduled_at).toLocaleString('pt-BR'):'Sem horário definido'}</span>
          <span><ListOrdered size={14}/>{items?.length||0} momentos</span>
          <span><UserRoundCheck size={14}/>{totalMinutes?totalMinutes+' min previstos':'Sem duração prevista'}</span>
        </div>
      </div>
      <form action={statusAction}><select name="status" defaultValue={order.status}><option value="draft">Rascunho</option><option value="ready">Pronto</option><option value="live">Ao vivo</option><option value="completed">Concluído</option></select><button type="submit">Atualizar</button></form>
    </header>

    {qs.error&&<p className="alert">{qs.error}</p>}

    <section className="service-order-grid">
      <div className="panel">
        <div className="section-title"><div><span className="section-eyebrow">Sequência</span><h2>Roteiro completo do culto</h2></div><span className="section-count">{items?.length||0}</span></div>

        {items?.length?<div className="service-order-timeline">{items.map((item,index)=>{
          const up=moveServiceOrderItem.bind(null,id,item.id,'up');
          const down=moveServiceOrderItem.bind(null,id,item.id,'down');
          const remove=removeServiceOrderItem.bind(null,id,item.id);
          const update=updateServiceOrderItem.bind(null,id,item.id);
          return <article className="service-order-item" key={item.id}>
            <div className="service-order-position"><strong>{String(item.position).padStart(2,'0')}</strong><span>{item.planned_minutes?item.planned_minutes+' min':'—'}</span></div>
            <div className="service-order-main">
              <div className="service-order-title"><span className="soft-status">{typeLabels[item.item_type]||item.item_type}</span><strong>{item.title}</strong></div>
              <p>{item.description||'Sem observações.'}</p>
              <div className="service-order-meta">{item.responsible_member_id&&<span>Responsável: {memberNames.get(item.responsible_member_id)||'Membro'}</span>}{item.song_id&&<span>Música: {songNames.get(item.song_id)||'Música'}</span>}</div>
              <details className="service-order-edit"><summary>Editar momento</summary><form action={update} className="form">
                <div className="field"><label>Tipo</label><select name="item_type" defaultValue={item.item_type}>{Object.entries(typeLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></div>
                <div className="field"><label>Título</label><input name="title" defaultValue={item.title} required/></div>
                <div className="field"><label>Descrição</label><textarea name="description" rows={3} defaultValue={item.description||''}/></div>
                <div className="field"><label>Duração (min)</label><input type="number" min="0" max="480" name="planned_minutes" defaultValue={item.planned_minutes||''}/></div>
                <div className="field"><label>Responsável</label><select name="responsible_member_id" defaultValue={item.responsible_member_id||''}><option value="">Sem responsável</option>{members?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div>
                <div className="field"><label>Música relacionada</label><select name="song_id" defaultValue={item.song_id||''}><option value="">Sem música</option>{songs?.map(s=><option value={s.id} key={s.id}>{s.title}{s.artist?' — '+s.artist:''}</option>)}</select></div>
                <button className="primary-submit" type="submit">Salvar alterações</button>
              </form></details>
            </div>
            <div className="service-order-controls">
              <form action={up}><button type="submit" title="Mover para cima" disabled={index===0}><ArrowUp size={15}/></button></form>
              <form action={down}><button type="submit" title="Mover para baixo" disabled={index===(items.length-1)}><ArrowDown size={15}/></button></form>
              <form action={remove}><button className="danger" type="submit" title="Remover"><Trash2 size={15}/></button></form>
            </div>
          </article>;
        })}</div>:<div className="module-empty-state"><ListOrdered size={34}/><h2>Monte a sequência do culto</h2><p>Adicione abertura, louvor, oração, oferta, palavra, avisos e qualquer outro momento.</p></div>}
      </div>

      <aside className="stack">
        <section className="panel service-order-add">
          <div className="section-title"><div><span className="section-eyebrow">Adicionar</span><h2>Novo momento</h2></div><Plus size={18}/></div>
          <form action={addServiceOrderItem.bind(null,id)} className="form">
            <div className="field"><label>Tipo</label><select name="item_type" defaultValue="custom">{Object.entries(typeLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></div>
            <div className="field"><label>Título</label><input name="title" placeholder="Ex.: Boas-vindas e oração inicial" required/></div>
            <div className="field"><label>Descrição</label><textarea name="description" rows={3} placeholder="O que acontece neste momento?"/></div>
            <div className="field"><label>Duração prevista</label><input type="number" min="0" max="480" name="planned_minutes" placeholder="Minutos"/></div>
            <div className="field"><label>Responsável</label><select name="responsible_member_id"><option value="">Sem responsável</option>{members?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div>
            <div className="field"><label>Música relacionada</label><select name="song_id"><option value="">Sem música</option>{songs?.map(s=><option value={s.id} key={s.id}>{s.title}{s.artist?' — '+s.artist:''}</option>)}</select></div>
            <button className="primary-submit" type="submit"><Plus size={15}/> Adicionar à ordem</button>
          </form>
        </section>
        {order.notes&&<section className="panel"><div className="section-title"><div><span className="section-eyebrow">Observações</span><h2>Orientações gerais</h2></div></div><p className="worship-plan-notes">{order.notes}</p></section>}
      </aside>
    </section>
  </>;
}
