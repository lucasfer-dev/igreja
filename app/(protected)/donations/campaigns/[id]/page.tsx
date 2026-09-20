import Link from 'next/link';
import { ArrowLeft, CalendarDays, CircleDollarSign, Target, Users } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireChurch } from '@/lib/auth';

function money(value:number){return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}

export default async function CampaignDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const {supabase,churchId,roleKey}=await requireChurch();
  const [{data:campaign},{data:donations}]=await Promise.all([
    supabase.from('donation_campaigns').select('*').eq('church_id',churchId).eq('id',id).maybeSingle(),
    supabase.from('donations').select('id,amount,fund,method,anonymous,occurred_at,church_members(full_name)').eq('church_id',churchId).eq('campaign_id',id).order('occurred_at',{ascending:false}),
  ]);
  if(!campaign)notFound();

  const raised=(donations||[]).reduce((a,d)=>a+Number(d.amount),0);
  const goal=Number(campaign.goal_amount||0);
  const progress=goal?Math.min(100,Math.round(raised/goal*100)):0;

  return <>
    <Link className="creation-back" href="/donations"><ArrowLeft size={15}/> Dízimos & ofertas</Link>
    <header className="workspace-heading"><div><span className={'module-status '+(campaign.active?'active':'inactive')}>{campaign.active?'Ativa':'Encerrada'}</span><h1>{campaign.title}</h1><p>{campaign.description||'Campanha da igreja.'}</p></div></header>
    <nav className="workspace-tabs"><a className="active" href="#overview">Visão geral</a><a href="#contributions">Contribuições</a></nav>
    <section className="workspace-summary">
      <div><CircleDollarSign size={18}/><strong>{money(raised)}</strong><span>Arrecadado</span></div>
      <div><Target size={18}/><strong>{goal?money(goal):'—'}</strong><span>Meta</span></div>
      <div><Users size={18}/><strong>{donations?.length||0}</strong><span>Contribuições</span></div>
      <div><CalendarDays size={18}/><strong>{progress}%</strong><span>Progresso</span></div>
    </section>
    <section className="panel campaign-detail-progress"><div className="giving-progress large"><i style={{width:progress+'%'}}/></div><div><strong>{money(raised)}</strong><span>{goal?' de '+money(goal):' arrecadados'}</span></div></section>
    {roleKey!=='member'&&<section id="contributions" className="panel"><div className="section-title"><div><span className="section-eyebrow">Campanha</span><h2>Contribuições vinculadas</h2></div></div>{donations?.length?<div className="giving-transactions">{donations.map((d:any)=><div key={d.id}><span className="giving-method">{String(d.method).slice(0,3).toUpperCase()}</span><div><strong>{d.anonymous?'Anônimo':d.church_members?.full_name||'Contribuinte'}</strong><span>{d.fund||'Geral'} • {new Date(d.occurred_at).toLocaleDateString('pt-BR')}</span></div><strong>{money(Number(d.amount))}</strong></div>)}</div>:<div className="empty">Nenhuma contribuição vinculada.</div>}</section>}
  </>;
}
