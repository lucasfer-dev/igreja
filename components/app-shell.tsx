import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  Baby, Bell, Boxes, CalendarDays, Church, ContactRound, HeartHandshake, Home,
  LayoutDashboard, ListOrdered, Megaphone, MonitorPlay, Music2, Newspaper, Search,
  Settings, ShieldCheck, Sparkles, UserRoundCheck, Users, UsersRound, ClipboardList
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
};

const people=[
  {href:'/members',label:'Pessoas',icon:ContactRound},
  {href:'/visitors',label:'Visitantes & follow-up',icon:Sparkles},
  {href:'/care',label:'Cuidado',icon:HeartHandshake},
  {href:'/cells',label:'Pequenos grupos',icon:UsersRound},
  {href:'/ministries',label:'Ministérios',icon:Church},
  {href:'/youth',label:'Jovens',icon:UsersRound},
  {href:'/kids',label:'Kids',icon:Baby},
] as const;

const operations=[
  {href:'/events',label:'Eventos',icon:CalendarDays},
  {href:'/service-order',label:'Ordem do culto',icon:ListOrdered},
  {href:'/volunteers',label:'Escalas',icon:UserRoundCheck},
  {href:'/worship',label:'Louvor',icon:Music2},
  {href:'/projection',label:'Projeção',icon:MonitorPlay},
] as const;

const management=[
  {href:'/communications',label:'Comunicação',icon:Megaphone},
  {href:'/news',label:'Notícias',icon:Newspaper},
  {href:'/assets',label:'Patrimônio',icon:Boxes},
  {href:'/reports',label:'Relatórios',icon:ClipboardList},
] as const;

function NavBlock({title,links}:{title:string;links:readonly any[]}){
  return <section className="ref-side-section">
    <div className="ref-side-title">{title}</div>
    <nav className="ref-side-nav">
      {links.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={14}/><span>{label}</span></Link>)}
    </nav>
  </section>;
}

export function AppShell(props:Props){
  const {
    children,churchName,churchShortName,churchLogo,churchColor,churchSecondaryColor,
    churchAccentColor,churchBackgroundColor,profileName,roleName,roleKey,unreadCount,
    churchRadioUrl,churchRadioName
  }=props;

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
        <Link href="/admin"><LayoutDashboard size={14}/><span>Central da igreja</span></Link>
        <Link href="/calendar"><CalendarDays size={14}/><span>Agenda PIBJG</span></Link>
      </nav>
      <NavBlock title="Pessoas & cuidado" links={people}/>
      <NavBlock title="Cultos & operação" links={operations}/>
      <NavBlock title="Comunicação & gestão" links={management}/>
      <NavBlock title="Sistema" links={[
        {href:'/search',label:'Busca global',icon:Search},
        {href:'/settings',label:'Configurações',icon:Settings},
      ]}/>
      <div className="ref-sidebar-user">
        <span className="ref-user-avatar">{profileName.slice(0,1).toUpperCase()}</span>
        <div><strong>{profileName}</strong><span>{roleName}</span></div>
        <form action={signOut}><button title="Sair" type="submit"><ShieldCheck size={14}/></button></form>
      </div>
    </aside>

    <main className="ref-main">
      <header className="ref-topbar">
        <form action="/search" className="ref-global-search"><Search size={13}/><input name="q" placeholder="Buscar na igreja" aria-label="Buscar na igreja"/></form>
        <div className="ref-top-actions">
          <Link href="/calendar" aria-label="Abrir agenda"><CalendarDays size={14}/></Link>
          <Link href="/notifications" aria-label={unreadCount?`Notificações, ${unreadCount} não lidas`:'Notificações'}><Bell size={14}/>{unreadCount>0&&<i/>}</Link>
          <span className="ref-top-avatar" aria-label={profileName}>{profileName.slice(0,1).toUpperCase()}</span>
        </div>
      </header>
      <div className="ref-page">{children}</div>
    </main>

    <nav className="mobile-nav" aria-label="Navegação da gestão">
      <Link href="/admin"><Home size={19}/><span>Início</span></Link>
      <Link href="/visitors"><Sparkles size={19}/><span>Visitantes</span></Link>
      <Link href="/events"><CalendarDays size={19}/><span>Agenda</span></Link>
      <Link href="/communications"><Megaphone size={19}/><span>Comunicar</span></Link>
      <Link href="/notifications"><Bell size={19}/><span>Avisos</span></Link>
    </nav>
  </div>;
}
