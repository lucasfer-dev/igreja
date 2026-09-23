import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Bell, CalendarDays, Church, Home, LogOut, MessageCircle, Newspaper, UserRound } from 'lucide-react';
import { signOut } from '@/app/actions';
import { MemberRadioPlayer } from '@/components/member-radio-player';
import styles from './member-shell.module.css';

type Props = {
  children: React.ReactNode;
  churchName: string;
  churchShortName: string;
  churchLogo?: string | null;
  churchColor: string;
  churchSecondaryColor: string;
  churchAccentColor: string;
  churchBackgroundColor: string;
  profileName: string;
  unreadCount: number;
  radioUrl?: string | null;
  radioName: string;
};

const links = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/events', label: 'Eventos', icon: CalendarDays },
  { href: '/news', label: 'Notícias', icon: Newspaper },
  { href: '/chats', label: 'Comunidade', icon: MessageCircle },
  { href: '/profile', label: 'Perfil', icon: UserRound },
] as const;

export function MemberShell({
  children,churchName,churchShortName,churchLogo,churchColor,churchSecondaryColor,
  churchAccentColor,churchBackgroundColor,profileName,unreadCount,radioUrl,radioName
}: Props) {
  const themeStyle={
    '--brand':churchColor,
    '--brand-dark':churchSecondaryColor,
    '--brand-accent':churchAccentColor,
    '--church-background':churchBackgroundColor,
  } as CSSProperties;

  return (
    <div className={styles.shell} style={themeStyle}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}>
          <span>{churchLogo?<img src={churchLogo} alt={churchShortName}/>:<Church size={18} />}</span>
          <div><strong>{churchShortName}</strong><small>{churchName}</small></div>
        </Link>
        <nav className={styles.desktopNav} aria-label="Navegação do membro">
          {links.slice(0, 4).map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={16} /><span>{label}</span></Link>)}
        </nav>
        <div className={styles.actions}>
          <Link href="/notifications" className={styles.notification} aria-label={unreadCount ? `Notificações, ${unreadCount} não lidas` : 'Notificações'}>
            <Bell size={18} />{unreadCount > 0 && <span>{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </Link>
          <Link href="/profile" className={styles.avatar} aria-label="Abrir perfil">{profileName.slice(0, 1).toUpperCase()}</Link>
          <form action={signOut} className={styles.signout}><button type="submit" aria-label="Sair"><LogOut size={17} /></button></form>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      {radioUrl&&<MemberRadioPlayer src={radioUrl} name={radioName}/>} 
      <nav className={styles.bottomNav} aria-label="Navegação principal">
        {links.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={20} /><span>{label}</span></Link>)}
      </nav>
    </div>
  );
}
