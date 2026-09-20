import Link from 'next/link';
import {
  CalendarDays, Church, CircleDollarSign, HandHeart, Home, LayoutDashboard,
  Megaphone, Settings, ShieldCheck, Sparkles, Users, UsersRound, Baby, ClipboardList,
  Bell, BookOpen, Newspaper, Search,
} from 'lucide-react';
import { signOut } from '@/app/actions';

type Props = { children: React.ReactNode; churchName: string; profileName: string; roleName: string; roleKey: string; };

const memberLinks = [
  { href: '/dashboard', label: 'Meu início', icon: Home },
  { href: '/feed', label: 'Mural', icon: Newspaper },
  { href: '/events', label: 'Eventos', icon: CalendarDays },
  { href: '/calendar', label: 'Agenda', icon: CalendarDays },
  { href: '/content', label: 'Conteúdos', icon: BookOpen },
  { href: '/notifications', label: 'Notificações', icon: Bell },
  { href: '/profile', label: 'Meu perfil', icon: Users },
] as const;

const adminLinks = [
  { href: '/admin', label: 'Visão administrativa', icon: LayoutDashboard },
  { href: '/members', label: 'Membros', icon: Users },
  { href: '/visitors', label: 'Visitantes', icon: Sparkles },
  { href: '/cells', label: 'Células', icon: UsersRound },
  { href: '/ministries', label: 'Ministérios', icon: Church },
  { href: '/volunteers', label: 'Voluntários', icon: HandHeart },
  { href: '/kids', label: 'Kids', icon: Baby },
  { href: '/finance', label: 'Financeiro', icon: CircleDollarSign },
  { href: '/communications', label: 'Comunicação', icon: Megaphone },
  { href: '/reports', label: 'Relatórios', icon: ClipboardList },
  { href: '/search', label: 'Busca global', icon: Search },
  { href: '/settings', label: 'Configurações', icon: Settings },
] as const;

export function AppShell({ children, churchName, profileName, roleName, roleKey }: Props) {
  const isStaff = roleKey !== 'member';
  return <div className="shell"><aside className="sidebar"><div className="brand-lockup"><span className="brand-mark"><Church size={20}/></span><div><strong>{churchName}</strong><span>ChurchOS</span></div></div>
    <div className="nav-label">Minha igreja</div><nav className="nav">{memberLinks.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={18}/><span>{label}</span></Link>)}</nav>
    {isStaff&&<><div className="nav-label nav-label-spaced">Administração</div><nav className="nav">{adminLinks.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={18}/><span>{label}</span></Link>)}</nav></>}
    <div className="sidebar-user"><div className="avatar">{profileName.slice(0,1).toUpperCase()}</div><div className="sidebar-user-copy"><strong>{profileName}</strong><span>{roleName}</span></div><form action={signOut}><button className="icon-button" title="Sair" type="submit"><ShieldCheck size={17}/></button></form></div>
  </aside><main className="main">{children}</main><nav className="mobile-nav"><Link href="/dashboard"><Home size={19}/><span>Início</span></Link><Link href="/feed"><Newspaper size={19}/><span>Mural</span></Link><Link href="/events"><CalendarDays size={19}/><span>Eventos</span></Link>{isStaff&&<Link href="/admin"><LayoutDashboard size={19}/><span>Admin</span></Link>}<Link href="/profile"><Users size={19}/><span>Perfil</span></Link></nav></div>;
}
