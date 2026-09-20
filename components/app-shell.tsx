import Link from 'next/link';
import {
  Bell, BookOpen, Boxes, CalendarDays, ChevronRight, Church, CircleDollarSign,
  Gift, HandHeart, Heart, Home, LayoutDashboard, Megaphone, MonitorPlay, Music2,
  Newspaper, Search, Settings, ShieldCheck, Sparkles, Users, UsersRound, Baby,
  ClipboardList, ContactRound, UserRoundCheck, WalletCards
} from 'lucide-react';
import { signOut } from '@/app/actions';

type Props={
  children:React.ReactNode;
  churchName:string;
  profileName:string;
  roleName:string;
  roleKey:string;
};

const memberLinks=[
  {href:'/dashboard',label:'Início',icon:Home},
  {href:'/feed',label:'Mural',icon:Newspaper},
  {href:'/events',label:'Eventos',icon:CalendarDays},
  {href:'/calendar',label:'Agenda',icon:CalendarDays},
  {href:'/content',label:'Conteúdos',icon:BookOpen},
  {href:'/donations',label:'Contribuir',icon:Heart},
  {href:'/notifications',label:'Notificações',icon:Bell},
  {href:'/profile',label:'Meu perfil',icon:Users},
] as const;

const people=[
  {href:'/members',label:'Pessoas',icon:ContactRound},
  {href:'/visitors',label:'Visitantes',icon:Sparkles},
  {href:'/cells',label:'Células',icon:UsersRound},
  {href:'/ministries',label:'Ministérios',icon:Church},
  {href:'/youth',label:'Jovens',icon:UsersRound},
  {href:'/kids',label:'Kids',icon:Baby},
] as const;

const sunday=[
  {href:'/events',label:'Eventos',icon:CalendarDays},
  {href:'/volunteers',label:'Escalas',icon:UserRoundCheck},
  {href:'/worship',label:'Louvor',icon:Music2},
  {href:'/projection',label:'Projeção',icon:MonitorPlay},
] as const;

const management=[
  {href:'/finance',label:'Financeiro',icon:WalletCards},
  {href:'/donations',label:'Dízimos & ofertas',icon:Gift},
  {href:'/communications',label:'Comunicação',icon:Megaphone},
  {href:'/assets',label:'Patrimônio',icon:Boxes},
  {href:'/reports',label:'Relatórios',icon:ClipboardList},
] as const;

function NavBlock({title,links}:{title:string;links:readonly any[]}){
  return <section className="side-section">
    <div className="side-section-title">{title}</div>
    <nav className="side-nav">
      {links.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={17}/><span>{label}</span><ChevronRight className="side-chevron" size={14}/></Link>)}
    </nav>
  </section>;
}

export function AppShell({children,churchName,profileName,roleName,roleKey}:Props){
  const isStaff=roleKey!=='member';

  return <div className="shell">
    <aside className="sidebar">
      <div className="workspace">
        <span className="workspace-logo"><Church size={21}/></span>
        <div className="workspace-copy"><strong>{churchName}</strong><span>Gestão da igreja</span></div>
      </div>

      {isStaff ? <>
        <nav className="side-nav side-home">
          <Link href="/admin"><LayoutDashboard size={17}/><span>Visão geral</span><ChevronRight className="side-chevron" size={14}/></Link>
          <Link href="/calendar"><CalendarDays size={17}/><span>Agenda</span><ChevronRight className="side-chevron" size={14}/></Link>
        </nav>
        <NavBlock title="Pessoas" links={people}/>
        <NavBlock title="Cultos & operação" links={sunday}/>
        <NavBlock title="Gestão" links={management}/>
      </> : <NavBlock title="Minha igreja" links={memberLinks}/>}

      <div className="sidebar-spacer"/>
      {isStaff&&<Link className="side-search" href="/search"><Search size={16}/><span>Buscar em tudo</span><kbd>⌘ K</kbd></Link>}
      <Link className="side-settings" href="/settings"><Settings size={16}/><span>Configurações</span></Link>

      <div className="sidebar-user">
        <div className="avatar">{profileName.slice(0,1).toUpperCase()}</div>
        <div className="sidebar-user-copy"><strong>{profileName}</strong><span>{roleName}</span></div>
        <form action={signOut}><button className="icon-button" title="Sair" type="submit"><ShieldCheck size={17}/></button></form>
      </div>
    </aside>

    <main className="main">
      <div className="app-topline">
        <div className="topline-left">
          <span className="topline-church">{churchName}</span>
          <span className="topline-separator">/</span>
          <span className="topline-context">{isStaff?'Administração':'Minha igreja'}</span>
        </div>
        <div className="topline-actions">
          <Link href="/search" aria-label="Buscar"><Search size={17}/></Link>
          <Link href="/notifications" aria-label="Notificações"><Bell size={17}/></Link>
        </div>
      </div>
      {children}
    </main>

    <nav className="mobile-nav">
      <Link href={isStaff?'/admin':'/dashboard'}><Home size={19}/><span>Início</span></Link>
      <Link href="/events"><CalendarDays size={19}/><span>Agenda</span></Link>
      {isStaff&&<Link href="/members"><Users size={19}/><span>Pessoas</span></Link>}
      <Link href="/notifications"><Bell size={19}/><span>Avisos</span></Link>
      <Link href="/profile"><Users size={19}/><span>Perfil</span></Link>
    </nav>
  </div>;
}
