import Link from 'next/link';
import { CalendarDays, Clock3, ListOrdered, Plus, Radio, UsersRound } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createServiceOrder } from './actions';

export default async function ServiceOrderPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId}=await requirePermission('service_order.read');
  const now=new Date().toISOString();

  const [{data:orders},{data:events}]=await Promise.all([
    supabase.from('service_orders').select('id,title,scheduled_at,status,events(id,title)').eq('church_id',churchId).order('scheduled_at',{ascending:false}).limit(40),
    supabase.from('events').select('id,title,starts_at').eq('church_id',churchId).gte('starts_at',now).order('starts_at').limit(40),
  ]);

  const upcoming=(orders||[]).filter(o=>o.scheduled_at&&new Date(o.scheduled_at)>=new Date()).sort((a,b)=>new Date(a.scheduled_at!).getTime()-new Date(b.scheduled_at!).getTime());
  const next=upcoming[0];

  return <>
    <header className="module-heading">
      <div><span className="module-kicker">Cultos & operação</span><h1>Ordem do culto</h1><p>Escolha um culto e monte, em ordem, tudo o que vai acontecer nele.</p></div>
      <a href="#new-order" className="module-primary"><Plus size={16}/> Nova ordem</a>
    </header>

    {qs.error&&<p className="alert">{qs.error}</p>}

    <section className="module-summary-row">
      <div><ListOrdered size={18}/><strong>{orders?.length||0}</strong><span>Ordens cadastradas</span></div>
      <div><CalendarDays size={18}/><strong>{upcoming.length}</strong><span>Próximos cultos</span></div>
      <div><Radio size={18}/><strong>{orders?.filter(o=>o.status==='live').length||0}</strong><span>Em andamento</span></div>
      <div><Clock3 size={18}/><strong>{next?.scheduled_at?new Date(next.scheduled_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'—'}</strong><span>Próxima ordem</span></div>
    </section>

    <section className="workspace-grid">
      <div className="panel">
        <div className="section-title"><div><span className="section-eyebrow">Escolha o culto</span><h2>Programações</h2></div></div>
        {orders?.length?<div className="service-order-list">{orders.map(order=>{
          const eventTitle=Array.isArray(order.events)?order.events[0]?.title:(order.events as {title?:string}|null)?.title;
          return <Link href={'/service-order/'+order.id} key={order.id}>
            <span className="service-order-icon"><ListOrdered size={17}/></span>
            <div><strong>{order.title}</strong><span>{eventTitle||'Sem evento vinculado'}{order.scheduled_at?' • '+new Date(order.scheduled_at).toLocaleString('pt-BR'):''}</span></div>
            <span className={'module-status '+(order.status==='ready'||order.status==='live'?'active':'inactive')}>{order.status}</span>
          </Link>;
        })}</div>:<div className="empty">Nenhum culto preparado ainda. Crie uma programação para começar a montar a ordem.</div>}
      </div>

      <aside id="new-order" className="panel">
        <div className="section-title"><div><span className="section-eyebrow">Novo culto</span><h2>Começar uma programação</h2></div><UsersRound size={18}/></div>
        <form action={createServiceOrder} className="form">
          <div className="field"><label>Nome do culto</label><input name="title" placeholder="Ex.: Culto de Domingo — Noite" required/></div>
          <div className="field"><label>Evento</label><select name="event_id"><option value="">Sem evento vinculado</option>{events?.map(e=><option value={e.id} key={e.id}>{e.title} — {new Date(e.starts_at).toLocaleString('pt-BR')}</option>)}</select></div>
          <div className="field"><label>Data e hora</label><input type="datetime-local" name="scheduled_at"/></div>
          <div className="field"><label>Observações gerais</label><textarea name="notes" rows={4} placeholder="Orientações gerais, chegada da equipe, detalhes especiais..."/></div>
          <button className="primary-submit" type="submit"><Plus size={15}/> Montar ordem do culto</button>
        </form>
      </aside>
    </section>
  </>;
}
