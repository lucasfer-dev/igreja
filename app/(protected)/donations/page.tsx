import Link from 'next/link';
import { ArrowUpRight, CircleDollarSign, Gift, Heart, Plus, Target, WalletCards } from 'lucide-react';
import { requireChurch } from '@/lib/auth';

function money(value:number){return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}

export default async function Donations({searchParams}:{searchParams:Promise<{message?:string}>}){
  const qs=await searchParams;
  const {supabase,churchId,roleKey,user}=await requireChurch();
  const isStaff=roleKey!=='member';
  const monthStart=new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

  const {data:ownMember}=await supabase.from('church_members').select('id').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle();

  const [campaignsResult, donationsResult]=await Promise.all([
    supabase.from('donation_campaigns').select('*').eq('church_id',churchId).order('created_at',{ascending:false}),
    isStaff
      ? supabase.from('donations').select('id,amount,fund,method,anonymous,status,occurred_at,notes,donation_campaigns(id,title),church_members(full_name)').eq('church_id',churchId).order('occurred_at',{ascending:false}).limit(150)
      : ownMember?.id
        ? supabase.from('donations').select('id,amount,fund,method,anonymous,status,occurred_at,donation_campaigns(id,title)').eq('church_id',churchId).eq('member_id',ownMember.id).order('occurred_at',{ascending:false}).limit(50)
        : Promise.resolve({data:[] as any[]}),
  ]);

  const campaigns=campaignsResult.data||[];
  const donations=donationsResult.data||[];
  const monthDonations=donations.filter((d:any)=>new Date(d.occurred_at)>=monthStart);
  const monthTotal=monthDonations.reduce((a:any,d:any)=>a+Number(d.amount),0);
  const allTotal=donations.reduce((a:any,d:any)=>a+Number(d.amount),0);
  const avg=donations.length?allTotal/donations.length:0;

  const byFund=Object.entries(donations.reduce<Record<string,number>>((acc:any,d:any)=>{const key=d.fund||'Geral';acc[key]=(acc[key]||0)+Number(d.amount);return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const byMethod=Object.entries(donations.reduce<Record<string,number>>((acc:any,d:any)=>{const key=d.method||'outro';acc[key]=(acc[key]||0)+Number(d.amount);return acc;},{})).sort((a,b)=>b[1]-a[1]);

  return <>
    <header className="module-heading">
      <div><span className="module-kicker">Generosidade</span><h1>Dízimos & ofertas</h1><p>{isStaff?'Acompanhe fundos, campanhas e contribuições sem misturar doações com o caixa operacional.':'Acompanhe seu histórico de contribuições e participe das campanhas da igreja.'}</p></div>
      <div className="giving-actions"><Link className="module-primary" href="/donations/new"><Plus size={16}/> {isStaff?'Registrar contribuição':'Contribuir'}</Link>{isStaff&&<Link className="module-secondary" href="/donations/campaigns/new"><Target size={16}/> Nova campanha</Link>}</div>
    </header>

    {qs.message&&<p className="success-alert">{qs.message}</p>}

    <section className="giving-summary">
      <article><span className="giving-summary-icon"><CircleDollarSign size={20}/></span><div><small>{isStaff?'Arrecadado no mês':'Você contribuiu no mês'}</small><strong>{money(monthTotal)}</strong></div></article>
      <article><span className="giving-summary-icon"><Gift size={20}/></span><div><small>{isStaff?'Contribuições registradas':'Seu histórico'}</small><strong>{donations.length}</strong></div></article>
      <article><span className="giving-summary-icon"><Target size={20}/></span><div><small>Campanhas ativas</small><strong>{campaigns.filter(c=>c.active).length}</strong></div></article>
      <article><span className="giving-summary-icon"><WalletCards size={20}/></span><div><small>{isStaff?'Média por contribuição':'Total contribuído'}</small><strong>{money(isStaff?avg:allTotal)}</strong></div></article>
    </section>

    <section className="giving-section">
      <div className="giving-section-head"><div><span>CAMPANHAS</span><h2>Propósitos em andamento</h2></div>{isStaff&&<Link href="/donations/campaigns/new">Criar campanha</Link>}</div>
      {campaigns.filter(c=>c.active).length?<div className="giving-campaign-grid">{campaigns.filter(c=>c.active).map(c=>{
        const raised=donations.filter((d:any)=>d.donation_campaigns?.id===c.id).reduce((a:any,d:any)=>a+Number(d.amount),0);
        const goal=Number(c.goal_amount||0);
        const progress=goal?Math.min(100,Math.round(raised/goal*100)):0;
        return <Link href={'/donations/campaigns/'+c.id} className="giving-campaign" key={c.id}>
          <div className="giving-campaign-top"><span className="giving-campaign-icon"><Heart size={18}/></span><span className="module-status active">Ativa</span></div>
          <h3>{c.title}</h3><p>{c.description||'Campanha da igreja.'}</p>
          <div className="giving-progress-copy"><strong>{money(raised)}</strong><span>{goal?'de '+money(goal):'sem meta definida'}</span></div>
          {goal>0&&<div className="giving-progress"><i style={{width:progress+'%'}}/></div>}
          <div className="giving-campaign-bottom"><span>{progress}% da meta</span><ArrowUpRight size={15}/></div>
        </Link>;
      })}</div>:<div className="module-empty-state"><Heart size={34}/><h2>Nenhuma campanha ativa</h2><p>As campanhas de contribuição aparecerão aqui.</p>{isStaff&&<Link href="/donations/campaigns/new">Criar campanha</Link>}</div>}
    </section>

    <section className="giving-main-grid">
      <div className="panel">
        <div className="section-title"><div><span className="section-eyebrow">{isStaff?'Movimentação':'Seu histórico'}</span><h2>Contribuições recentes</h2></div></div>
        {donations.length?<div className="giving-transactions">{donations.slice(0,12).map((d:any)=><div key={d.id}>
          <span className="giving-method">{String(d.method).slice(0,3).toUpperCase()}</span>
          <div><strong>{d.anonymous&&isStaff?'Contribuição anônima':isStaff?(d.church_members?.full_name||'Contribuinte'):(d.donation_campaigns?.title||d.fund||'Contribuição')}</strong><span>{d.fund||'Geral'}{d.donation_campaigns?.title?' • '+d.donation_campaigns.title:''} • {new Date(d.occurred_at).toLocaleDateString('pt-BR')}</span></div>
          <strong>{money(Number(d.amount))}</strong>
        </div>)}</div>:<div className="empty compact">Nenhuma contribuição registrada.</div>}
      </div>

      <aside className="stack">
        <section className="panel"><div className="section-title"><div><span className="section-eyebrow">Fundos</span><h2>Distribuição</h2></div></div>{byFund.length?<div className="giving-breakdown">{byFund.map(([fund,value])=><div key={fund}><div><strong>{fund}</strong><span>{money(value)}</span></div><div className="giving-breakdown-bar"><i style={{width:(value/(byFund[0]?.[1]||1)*100)+'%'}}/></div></div>)}</div>:<div className="empty compact">Sem dados ainda.</div>}</section>
        <section className="panel"><div className="section-title"><div><span className="section-eyebrow">Métodos</span><h2>Como chegam as contribuições</h2></div></div>{byMethod.length?<div className="giving-methods">{byMethod.map(([method,value])=><div key={method}><span>{method}</span><strong>{money(value)}</strong></div>)}</div>:<div className="empty compact">Sem dados ainda.</div>}</section>
      </aside>
    </section>
  </>;
}
