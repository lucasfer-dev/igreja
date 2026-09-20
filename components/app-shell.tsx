import Link from 'next/link';
import {
  Bell, BookOpen, Boxes, CalendarDays, Church, CircleDollarSign, Gift, HandHeart,
  Heart, Home, LayoutDashboard, Megaphone, MonitorPlay, Music2, Newspaper, Search,
  Settings, ShieldCheck, Sparkles, Users, UsersRound, Baby, ClipboardList
} from 'lucide-react';
import { signOut } from '@/app/actions';

type Props={children:React.ReactNode;churchName:string;profileName:string;roleName:string;roleKey:string};

const memberLinks=[
 {href:'/dashboard',label:'Início',icon:Home},
 {href:'/feed',label:'Mural',icon:Newspaper},
 {href:'/events',label:'Eventos',icon:CalendarDays},
 {href:'/calendar',label:'Agenda',icon:CalendarDays},
 {href:'/content',label:'Conteúdos',icon:BookOpen},
 {href:'/donations',label:'Contribuir',icon:Heart},
 {href:'/notifications',label:'Notificações',icon:Bell},
 {href:'/profile',label:'Perfil',icon:Users},
] as const;

const people=[
 {href:'/members',label:'Membros',icon:Users},
 {href:'/visitors',label:'Visitantes',icon:Sparkles},
 {href:'/cells',label:'Células',icon:UsersRound},
 {href:'/ministries',label:'Ministérios',icon:Church},
 {href:'/youth',label:'Jovens',icon:UsersRound},
 {href:'/kids',label:'Kids',icon:Baby},
] as const;

const operations=[
 {href:'/events',label:'Eventos',icon:CalendarDays},
 {href:'/volunteers',label:'Voluntários',icon:HandHeart},
 {href:'/worship',label:'Louvor',icon:Music2},
 {href:'/projection',label:'Projeção',icon:MonitorPlay},
 {href:'/assets',label:'Patrimônio',icon:Boxes},
] as const;

const management=[
 {href:'/finance',label:'Financeiro',icon:CircleDollarSign},
 {href:'/donations',label:'Ofertas',icon:Gift},
 {href:'/communications',label:'Comunicação',icon:Megaphone},
 {href:'/reports',label:'Relatórios',icon:ClipboardList},
 {href:'/search',label:'Busca global',icon:Search},
 {href:'/settings',label:'Configurações',icon:Settings},
] as const;

function NavBlock({title,links}:{title:string;links:readonly any[]}){return <><div className="nav-label nav-label-spaced">{title}</div><nav className="nav">{links.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={17}/><span>{label}</span></Link>)}</nav></>}

export function AppShell({children,churchName,profileName,roleName,roleKey}:Props){
 const isStaff=roleKey!=='member';
 return <div className="shell">
  <aside className="sidebar">
   <div className="brand-lockup"><span className="brand-mark"><Church size={20}/></span><div><strong>{churchName}</strong><span>Gestão da Igreja</span></div></div>
   <nav className="nav main-nav"><Link href="/dashboard"><Home size={17}/><span>Visão geral</span></Link>{isStaff&&<Link href="/admin"><LayoutDashboard size={17}/><span>Dashboard</span></Link>}</nav>
   {!isStaff&&<NavBlock title="Minha igreja" links={memberLinks}/>}
   {isStaff&&<><NavBlock title="Pessoas" links={people}/><NavBlock title="Operação" links={operations}/><NavBlock title="Gestão" links={management}/></>}
   <div className="sidebar-user"><div className="avatar">{profileName.slice(0,1).toUpperCase()}</div><div className="sidebar-user-copy"><strong>{profileName}</strong><span>{roleName}</span></div><form action={signOut}><button className="icon-button" title="Sair" type="submit"><ShieldCheck size={17}/></button></form></div>
  </aside>
  <main className="main"><div className="app-topline"><div><span className="workspace-chip">{churchName}</span></div><div className="topline-actions"><Link href="/search"><Search size={17}/></Link><Link href="/notifications"><Bell size={17}/></Link></div></div>{children}</main>
  <nav className="mobile-nav"><Link href="/dashboard"><Home size={19}/><span>Início</span></Link><Link href="/events"><CalendarDays size={19}/><span>Eventos</span></Link>{isStaff&&<Link href="/admin"><LayoutDashboard size={19}/><span>Admin</span></Link>}<Link href="/notifications"><Bell size={19}/><span>Avisos</span></Link><Link href="/profile"><Users size={19}/><span>Perfil</span></Link></nav>
 </div>;
}
