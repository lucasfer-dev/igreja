import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  Baby, Bell, Boxes, CalendarDays, Church, ContactRound, HeartHandshake, Home,
  LayoutDashboard, ListOrdered, Megaphone, MonitorPlay, Music2, Search,
  Settings, ShieldCheck, Sparkles, UserRoundCheck, UsersRound, ClipboardList
} from 'lucide-react';
import { signOut } from '@/app/actions';
import { MemberShell } from '@/components/member-shell';

type Props={
  children:React.ReactNode;
  churchName:string;
  churchShortName:string;
  churchLogo?:string|null;
  churchColor:string;
  churchSecondaryColor:string;
  churchAccentColor:string;
  churchBackgroundColor:string;
  profileName:string;
  roleName:string;
  roleKey:string;
  unreadCount:number;
  churchRadioUrl?:string|null;
  churchRadioName:string;
  permissions:string[];
};

const people=[
  {href:'/members',label:'Pessoas',icon:ContactRound,permission:'members.read'},
  {href:'/visitors',label:'Visitantes & follow-up',icon:Sparkles,permission:'visitors.read'},
  {href:'/care',label:'Cuidado',icon:HeartHandshake,permission:'care.read'},
  {href:'/cells',label:'Pequenos grupos',icon:UsersRound,permission:'cells.read'},
  {href:'/ministries',label:'Ministérios',icon:Church,permission:'ministries.read'},
  {href:'/youth',label:'Jovens',icon:UsersRound,permission:'members.read'},
  {href:'/kids',label:'Kids',icon:Baby,permission:'kids.read'},
] as const;

const operations=[
  {href:'/events',label:'Eventos',icon:CalendarDays,permission:'events.read'},
  {href:'/service-order',label:'Ordem do culto',icon:ListOrdered,permission:'service_order.read'},
  {href:'/volunteers',label:'Escalas',icon:UserRoundCheck,permission:'ministries.read'},
  {href:'/worship',label:'Louvor',icon:Music2,permission:'worship.read'},
  {href:'/projection',label:'Projeção',icon:MonitorPlay,permission:'worship.read'},
] as const;

const management=[
  {href:'/communications',label:'Comunicação',icon:Megaphone,permission:'communications.manage'},
  {href:'/assets',label:'Patrimônio',icon:Boxes,permission:'assets.read'},
  {href:'/reports',label:'Relatórios',icon:ClipboardList,permission:'reports.read'},
] as const;

function NavBlock({title,links,permissions}:{title:string;links:readonly any[];permissions:Set<string>}){
  const visible=links.filter(link=>!link.permission||permissions.has(link.permission));
  if(!visible.length) return null;
  return <section className="ref-side-section">
    <div className="ref-side-title">{title}</div>
    <nav className="ref-side-nav">
      {visible.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={14}/><span>{label}</span></Link>)}
    </nav>
  </section>;
}

export function AppShell(props:Props){
  const {
    children,churchName,churchShortName,churchLogo,churchColor,churchSecondaryColor,
    churchAccentColor,churchBackgroundColor,profileName,roleName,roleKey,unreadCount,
    churchRadioUrl,churchRadioName,permissions
  }=props;

  const permissionSet=new Set(permissions);
  const canSearch=['members.read','visitors.read','cells.read','ministries.read','communications.manage','church.manage'].some(p=>permissionSet.has(p));
  const canUseCalendar=['events.manage','members.read','cells.read','ministries.read'].some(p=>permissionSet.has(p));

  const themeStyle={
    '--brand':churchColor,
    '--brand-dark':churchSecondaryColor,
    '--brand-accent':churchAccentColor,
    '--church-background':churchBackgroundColor,
  } as CSSProperties;

  if(roleKey==='member'){
    return <MemberShell
      churchName={churchName}
      churchShortName={churchShortName}
      churchLogo={churchLogo}
      churchColor={churchColor}
      churchSecondaryColor={churchSecondaryColor}
      churchAccentColor={churchAccentColor}
      churchBackgroundColor={churchBackgroundColor}
      profileName={profileName}
      unreadCount={unreadCount}
      radioUrl={churchRadioUrl}
      radioName={churchRadioName}
    >{children}</MemberShell>;
  }

  return <div className="ref-shell pibjg-shell" style={themeStyle}>
    <aside className="ref-sidebar">
      <div className="ref-brand">
        <span>{churchLogo?<img src={churchLogo} alt={churchShortName}/>:<Church size={17}/>}</span>
        <div><strong>{churchShortName} Gestão</strong><small>{churchName}</small></div>
      </div>
      <nav className="ref-side-nav ref-side-home">
        {permissionSet.has('church.manage')&&<Link href="/admin"><LayoutDashboard size={14}/><span>Central da igreja</span></Link>}
        {canUseCalendar&&<Link href="/calendar"><CalendarDays size={14}/><span>Agenda PIBJG</span></Link>}
      </nav>
      <NavBlock title="Pessoas & cuidado" links={people} permissions={permissionSet}/>
      <NavBlock title="Cultos & operação" links={operations} permissions={permissionSet}/>
      <NavBlock title="Comunicação & gestão" links={management} permissions={permissionSet}/>
      <NavBlock title="Sistema" permissions={permissionSet} links={[
        ...(canSearch?[{href:'/search',label:'Busca global',icon:Search}]:[]),
        {href:'/settings',label:'Configurações',icon:Settings,permission:'church.manage'},
      ]}/>
      <div className="ref-sidebar-user">
        <span className="ref-user-avatar">{profileName.slice(0,1).toUpperCase()}</span>
        <div><strong>{profileName}</strong><span>{roleName}</span></div>
        <form action={signOut}><button title="Sair" type="submit"><ShieldCheck size={14}/></button></form>
      </div>
    </aside>

    <main className="ref-main">
      <header className="ref-topbar">
        {canSearch?<form action="/search" className="ref-global-search"><Search size={13}/><input name="q" placeholder="Buscar na igreja" aria-label="Buscar na igreja"/></form>:<span/>}
        <div className="ref-top-actions">
          {canUseCalendar&&<Link href="/calendar" aria-label="Abrir agenda"><CalendarDays size={14}/></Link>}
          <Link href="/notifications" aria-label={unreadCount?`Notificações, ${unreadCount} não lidas`:'Notificações'}><Bell size={14}/>{unreadCount>0&&<i/>}</Link>
          <span className="ref-top-avatar" aria-label={profileName}>{profileName.slice(0,1).toUpperCase()}</span>
        </div>
      </header>
      <div className="ref-page">{children}</div>
    </main>

    <nav className="mobile-nav" aria-label="Navegação da gestão">
      {permissionSet.has('church.manage')&&<Link href="/admin"><Home size={19}/><span>Início</span></Link>}
      {permissionSet.has('visitors.read')&&<Link href="/visitors"><Sparkles size={19}/><span>Visitantes</span></Link>}
      {permissionSet.has('events.read')&&<Link href="/events"><CalendarDays size={19}/><span>Agenda</span></Link>}
      {permissionSet.has('communications.manage')&&<Link href="/communications"><Megaphone size={19}/><span>Comunicar</span></Link>}
      <Link href="/notifications"><Bell size={19}/><span>Avisos</span></Link>
    </nav>
  </div>;
}
