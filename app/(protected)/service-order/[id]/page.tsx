import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowUp, Clock3, GripVertical, ListOrdered, Plus, Trash2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth';
import { addServiceOrderItem, moveServiceOrderItem, removeServiceOrderItem, updateServiceOrderItem, updateServiceOrderStatus } from '../actions';

const typeLabels:Record<string,string>={
  opening:'Abertura',
  welcome:'Boas-vindas',
  prayer:'Oração',
  worship:'Louvor',
  offering:'Momento especial',
  announcement:'Avisos',
  sermon:'Palavra',
  communion:'Ceia',
  video:'Vídeo',
  transition:'Transição',
  closing:'Encerramento',
  custom:'Momento personalizado',
};

const quickMoments=[
  ['opening','Abertura'],
  ['worship','Louvor'],
  ['prayer','Momento de oração'],
  ['announcement','Avisos'],
  ['sermon','Palavra'],
  ['communion','Ceia'],
  ['closing','Encerramento'],
] as const;

export default async function ServiceOrderDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
  const {id}=await params;
  const qs=await searchParams;
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

  return <div className="service-builder">
    <Link className="creation-back" href="/service-order"><ArrowLeft size={15}/> Voltar para cultos</Link>

    <header className="service-builder-head">
      <div>
        <span className="module-kicker">Ordem do culto</span>
        <h1>{order.title}</h1>
        <p>{order.scheduled_at?new Date(order.scheduled_at).toLocaleString('pt-BR',{dateStyle:'long',timeStyle:'short'}):'Sem data definida'} • {items?.length||0} momentos{totalMinutes?' • '+totalMinutes+' min previstos':''}</p>
      </div>
      <form action={statusAction} className="service-builder-status">
        <select name="status" defaultValue={order.status}>
          <option value="draft">Rascunho</option>
          <option value="ready">Pronto</option>
          <option value="live">Ao vivo</option>
          <option value="completed">Concluído</option>
        </select>
        <button type="submit">Salvar status</button>
      </form>
    </header>

    {qs.error&&<p className="alert">{qs.error}</p>}

    <section className="service-builder-layout">
      <main className="service-builder-main">
        <div className="service-builder-intro">
          <div>
            <span className="section-eyebrow">Programação</span>
            <h2>O que vai acontecer neste culto?</h2>
            <p>Monte a sequência de cima para baixo. Cada bloco representa um momento do culto.</p>
          </div>
          <span className="service-builder-duration"><Clock3 size={15}/>{totalMinutes||0} min</span>
        </div>

        <div className="service-quick-add">
          {quickMoments.map(([type,title])=><form action={addServiceOrderItem.bind(null,id)} key={type}>
            <input type="hidden" name="item_type" value={type}/>
            <input type="hidden" name="title" value={title}/>
            <button type="submit"><Plus size={14}/>{title}</button>
          </form>)}
        </div>

        {items?.length?<div className="service-builder-list">{items.map((item,index)=>{
          const up=moveServiceOrderItem.bind(null,id,item.id,'up');
          const down=moveServiceOrderItem.bind(null,id,item.id,'down');
          const remove=removeServiceOrderItem.bind(null,id,item.id);
          const update=updateServiceOrderItem.bind(null,id,item.id);

          return <article className="service-builder-card" key={item.id}>
            <div className="service-builder-handle"><GripVertical size={17}/><span>{index+1}</span></div>

            <div className="service-builder-card-main">
              <div className="service-builder-card-top">
                <div>
                  <span className="soft-status">{typeLabels[item.item_type]||item.item_type}</span>
                  <h3>{item.title}</h3>
                </div>
                <div className="service-builder-card-actions">
                  <form action={up}><button type="submit" title="Subir" disabled={index===0}><ArrowUp size={15}/></button></form>
                  <form action={down}><button type="submit" title="Descer" disabled={index===items.length-1}><ArrowDown size={15}/></button></form>
                  <form action={remove}><button className="danger" type="submit" title="Remover"><Trash2 size={15}/></button></form>
                </div>
              </div>

              {(item.description||item.responsible_member_id||item.song_id||item.planned_minutes)?<div className="service-builder-summary">
                {item.description&&<p>{item.description}</p>}
                <div>
                  {item.planned_minutes&&<span>{item.planned_minutes} min</span>}
                  {item.responsible_member_id&&<span>{memberNames.get(item.responsible_member_id)||'Responsável definido'}</span>}
                  {item.song_id&&<span>{songNames.get(item.song_id)||'Música vinculada'}</span>}
                </div>
              </div>:null}

              <details className="service-builder-details">
                <summary>Editar detalhes</summary>
                <form action={update} className="service-builder-edit-form">
                  <div className="field"><label>Tipo</label><select name="item_type" defaultValue={item.item_type}>{Object.entries(typeLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></div>
                  <div className="field"><label>Nome do momento</label><input name="title" defaultValue={item.title} required/></div>
                  <div className="field field-full"><label>O que acontece aqui?</label><textarea name="description" rows={3} defaultValue={item.description||''} placeholder="Ex.: Pastor faz a oração e chama a equipe de louvor."/></div>
                  <div className="field"><label>Duração aproximada</label><input type="number" min="0" max="480" name="planned_minutes" defaultValue={item.planned_minutes||''} placeholder="Minutos"/></div>
                  <div className="field"><label>Responsável</label><select name="responsible_member_id" defaultValue={item.responsible_member_id||''}><option value="">Não definido</option>{members?.map(m=><option value={m.id} key={m.id}>{m.full_name}</option>)}</select></div>
                  <div className="field"><label>Música</label><select name="song_id" defaultValue={item.song_id||''}><option value="">Nenhuma</option>{songs?.map(s=><option value={s.id} key={s.id}>{s.title}{s.artist?' — '+s.artist:''}</option>)}</select></div>
                  <button className="primary-submit field-full" type="submit">Salvar detalhes</button>
                </form>
              </details>
            </div>
          </article>;
        })}</div>:<div className="service-builder-empty">
          <ListOrdered size={34}/>
          <h3>Comece montando a ordem do culto</h3>
          <p>Use os botões acima para adicionar Abertura, Louvor, Oração, Palavra e outros momentos.</p>
        </div>}

        <section className="service-builder-custom">
          <div><span className="section-eyebrow">Adicionar outro momento</span><h3>Momento personalizado</h3><p>Para qualquer coisa que não esteja nos atalhos acima.</p></div>
          <form action={addServiceOrderItem.bind(null,id)} className="service-builder-custom-form">
            <input type="hidden" name="item_type" value="custom"/>
            <input name="title" placeholder="Ex.: Homenagem, testemunho, apresentação..." required/>
            <button type="submit"><Plus size={15}/> Adicionar</button>
          </form>
        </section>
      </main>

      <aside className="service-builder-side">
        <div className="panel">
          <span className="section-eyebrow">Resumo do culto</span>
          <div className="service-builder-side-stat"><strong>{items?.length||0}</strong><span>momentos</span></div>
          <div className="service-builder-side-stat"><strong>{totalMinutes||0}</strong><span>minutos previstos</span></div>
          <div className="service-builder-side-stat"><strong>{order.status==='draft'?'Rascunho':order.status==='ready'?'Pronto':order.status==='live'?'Ao vivo':'Concluído'}</strong><span>status</span></div>
        </div>
        {order.notes&&<div className="panel"><span className="section-eyebrow">Observações gerais</span><p className="worship-plan-notes">{order.notes}</p></div>}
      </aside>
    </section>
  </div>;
}
