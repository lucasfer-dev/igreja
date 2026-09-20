import Link from 'next/link';
import { Bell, CalendarDays, Church, Home, LogOut, MessageCircle, Newspaper, UserRound } from 'lucide-react';
import { signOut } from '@/app/actions';
import styles from './member-shell.module.css';

type Props = {
  children: React.ReactNode;
  churchName: string;
  profileName: string;
  unreadCount: number;
};

const links = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/events', label: 'Eventos', icon: CalendarDays },
  { href: '/chats', label: 'Comunidade', icon: MessageCircle },
  { href: '/feed', label: 'Avisos', icon: Newspaper },
  { href: '/profile', label: 'Perfil', icon: UserRound },
] as const;

export function MemberShell({ children, churchName, profileName, unreadCount }: Props) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}>
          <span><Church size={18} /></span>
          <div><strong>{churchName}</strong><small>Comunidade</small></div>
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegação do membro">
          {links.slice(0, 4).map(({ href, label, icon: Icon }) => (
            <Link href={href} key={href}><Icon size={16} /><span>{label}</span></Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            href="/notifications"
            className={styles.notification}
            aria-label={unreadCount ? `Notificações, ${unreadCount} não lidas` : 'Notificações'}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span>{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </Link>
          <Link href="/profile" className={styles.avatar} aria-label="Abrir perfil">
            {profileName.slice(0, 1).toUpperCase()}
          </Link>
          <form action={signOut} className={styles.signout}>
            <button type="submit" aria-label="Sair"><LogOut size={17} /></button>
          </form>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav} aria-label="Navegação principal">
        {links.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href}><Icon size={20} /><span>{label}</span></Link>
        ))}
      </nav>
    </div>
  );
}
