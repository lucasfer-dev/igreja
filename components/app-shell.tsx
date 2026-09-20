const links = [
  ['/dashboard', 'Visão geral'],
  ['/members', 'Membros'],
  ['/visitors', 'Visitantes'],
  ['/cells', 'Células'],
  ['/ministries', 'Ministérios'],
  ['/events', 'Eventos'],
  ['/finance', 'Financeiro'],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">ChurchOS</div>
        <nav className="nav">
          {links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        </nav>
      </aside>

      <main className="main">{children}</main>

      <nav className="mobile-nav">
        <a href="/dashboard">Início</a>
        <a href="/members">Membros</a>
        <a href="/events">Eventos</a>
        <a href="/finance">Financeiro</a>
      </nav>
    </div>
  );
}
