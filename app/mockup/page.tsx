'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  Church,
  CircleDollarSign,
  ClipboardList,
  HandHeart,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  Users,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import styles from './mockup.module.css';

type Section =
  | 'dashboard'
  | 'members'
  | 'services'
  | 'calendar'
  | 'ministries'
  | 'finance'
  | 'communications';

const menuItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'members', label: 'Membros', icon: Users },
  { id: 'services', label: 'Ordem do culto', icon: ClipboardList },
  { id: 'calendar', label: 'Agenda', icon: CalendarDays },
  { id: 'ministries', label: 'Ministérios', icon: UsersRound },
  { id: 'finance', label: 'Financeiro', icon: WalletCards },
  { id: 'communications', label: 'Comunicação', icon: MessageSquareText },
];

const members = [
  { name: 'Ana Beatriz', group: 'Louvor', status: 'Ativo', since: '2024' },
  { name: 'Carlos Henrique', group: 'Mídia', status: 'Ativo', since: '2023' },
  { name: 'Juliana Costa', group: 'Kids', status: 'Ativo', since: '2025' },
  { name: 'Rafael Souza', group: 'Jovens', status: 'Novo', since: '2026' },
  { name: 'Mariana Alves', group: 'Intercessão', status: 'Ativo', since: '2022' },
];

const serviceItems = [
  { time: '19:00', title: 'Abertura e boas-vindas', owner: 'Pr. Daniel' },
  { time: '19:10', title: 'Louvor', owner: 'Equipe de Louvor' },
  { time: '19:40', title: 'Avisos da semana', owner: 'Comunicação' },
  { time: '19:50', title: 'Ofertas e contribuições', owner: 'Diaconato' },
  { time: '20:00', title: 'Mensagem', owner: 'Pr. Daniel' },
  { time: '20:45', title: 'Oração e encerramento', owner: 'Liderança' },
];

const events = [
  { day: '22', month: 'SET', title: 'Culto de Celebração', meta: '19:00 · Templo principal' },
  { day: '24', month: 'SET', title: 'Encontro de Jovens', meta: '19:30 · Auditório' },
  { day: '26', month: 'SET', title: 'Reunião de Líderes', meta: '20:00 · Sala 2' },
  { day: '27', month: 'SET', title: 'Ação Social', meta: '09:00 · Comunidade' },
];

const ministries = [
  { name: 'Louvor', members: 18, leader: 'Gabriel Martins', next: 'Escala domingo' },
  { name: 'Kids', members: 24, leader: 'Larissa Silva', next: 'Treinamento sábado' },
  { name: 'Jovens', members: 31, leader: 'João Pedro', next: 'Encontro quarta' },
  { name: 'Mídia', members: 9, leader: 'Carlos Henrique', next: 'Culto domingo' },
];

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className={styles.statCard}>
      <div className={styles.statIcon}><Icon size={20} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}

export default function MockupPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredMembers = useMemo(
    () => members.filter((member) => member.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const currentTitle = menuItems.find((item) => item.id === section)?.label ?? 'Visão geral';

  function navigate(next: Section) {
    setSection(next);
    setMobileOpen(false);
  }

  return (
    <main className={styles.app}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <div className={styles.logo}><Church size={22} /></div>
          <div>
            <strong>Igreja One</strong>
            <span>Gestão integrada</span>
          </div>
          <button className={styles.closeMenu} onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navLabel}>GESTÃO</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={section === item.id ? styles.navActive : ''}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button><Settings size={18} /> Configurações</button>
          <div className={styles.profile}>
            <div className={styles.avatar}>LF</div>
            <div>
              <strong>Lucas Fernandes</strong>
              <span>Administrador</span>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className={styles.overlay} onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />}

      <section className={styles.content}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>

          <div>
            <span className={styles.eyebrow}>Igreja Batista Central</span>
            <h1>{currentTitle}</h1>
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconButton} aria-label="Notificações">
              <Bell size={19} />
              <span className={styles.notificationDot} />
            </button>
            <div className={styles.userChip}>
              <div className={styles.avatarSmall}>LF</div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className={styles.page}>
          {section === 'dashboard' && (
            <>
              <div className={styles.hero}>
                <div>
                  <span className={styles.heroBadge}>Segunda-feira, 21 de setembro</span>
                  <h2>Boa noite, Lucas 👋</h2>
                  <p>Acompanhe o que está acontecendo na igreja e organize a próxima semana em um só lugar.</p>
                </div>
                <button onClick={() => navigate('services')}>Montar próximo culto <ChevronRight size={18} /></button>
              </div>

              <div className={styles.statsGrid}>
                <StatCard icon={Users} label="Membros ativos" value="428" hint="+12 este mês" />
                <StatCard icon={UsersRound} label="Visitantes" value="37" hint="8 novos esta semana" />
                <StatCard icon={CalendarDays} label="Próximos eventos" value="6" hint="Nos próximos 14 dias" />
                <StatCard icon={CircleDollarSign} label="Entradas no mês" value="R$ 18,4 mil" hint="+7,8% vs. agosto" />
              </div>

              <div className={styles.twoColumns}>
                <article className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <span>PRÓXIMOS COMPROMISSOS</span>
                      <h3>Agenda da semana</h3>
                    </div>
                    <button onClick={() => navigate('calendar')}>Ver agenda</button>
                  </div>
                  <div className={styles.eventsList}>
                    {events.slice(0, 3).map((event) => (
                      <div className={styles.eventRow} key={event.title}>
                        <div className={styles.dateBadge}>
                          <strong>{event.day}</strong>
                          <span>{event.month}</span>
                        </div>
                        <div>
                          <strong>{event.title}</strong>
                          <span>{event.meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <span>ENGAJAMENTO</span>
                      <h3>Resumo da comunidade</h3>
                    </div>
                    <BarChart3 size={21} />
                  </div>
                  <div className={styles.progressGroup}>
                    <div>
                      <div className={styles.progressLabel}><span>Presença nos cultos</span><strong>82%</strong></div>
                      <div className={styles.progress}><span style={{ width: '82%' }} /></div>
                    </div>
                    <div>
                      <div className={styles.progressLabel}><span>Participação em ministérios</span><strong>64%</strong></div>
                      <div className={styles.progress}><span style={{ width: '64%' }} /></div>
                    </div>
                    <div>
                      <div className={styles.progressLabel}><span>Cadastro atualizado</span><strong>91%</strong></div>
                      <div className={styles.progress}><span style={{ width: '91%' }} /></div>
                    </div>
                  </div>
                </article>
              </div>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>PRÓXIMO CULTO</span>
                    <h3>Domingo · 19:00</h3>
                  </div>
                  <button onClick={() => navigate('services')}>Abrir ordem do culto</button>
                </div>
                <div className={styles.servicePreview}>
                  {serviceItems.slice(0, 5).map((item, index) => (
                    <div key={item.title}>
                      <span className={styles.stepNumber}>{index + 1}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.time} · {item.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}

          {section === 'members' && (
            <article className={styles.panel}>
              <div className={styles.panelHeaderResponsive}>
                <div>
                  <span>PESSOAS</span>
                  <h3>Cadastro de membros</h3>
                  <p>Visualize e acompanhe quem faz parte da comunidade.</p>
                </div>
                <button className={styles.primaryButton}>+ Novo membro</button>
              </div>

              <div className={styles.searchBox}>
                <Search size={18} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar membro..." />
              </div>

              <div className={styles.table}>
                <div className={`${styles.tableRow} ${styles.tableHead}`}>
                  <span>Nome</span><span>Ministério</span><span>Status</span><span>Desde</span>
                </div>
                {filteredMembers.map((member) => (
                  <div className={styles.tableRow} key={member.name}>
                    <strong>{member.name}</strong>
                    <span>{member.group}</span>
                    <span><b className={member.status === 'Novo' ? styles.statusNew : styles.statusActive}>{member.status}</b></span>
                    <span>{member.since}</span>
                  </div>
                ))}
              </div>
            </article>
          )}

          {section === 'services' && (
            <div className={styles.twoColumnsWide}>
              <article className={styles.panel}>
                <div className={styles.panelHeaderResponsive}>
                  <div>
                    <span>DOMINGO · 19:00</span>
                    <h3>Ordem do Culto</h3>
                    <p>Monte a sequência do culto e deixe toda a equipe alinhada.</p>
                  </div>
                  <button className={styles.primaryButton}>+ Adicionar momento</button>
                </div>

                <div className={styles.orderList}>
                  {serviceItems.map((item, index) => (
                    <div className={styles.orderItem} key={item.title}>
                      <div className={styles.orderIndex}>{index + 1}</div>
                      <div className={styles.orderInfo}>
                        <strong>{item.title}</strong>
                        <span>{item.owner}</span>
                      </div>
                      <time>{item.time}</time>
                    </div>
                  ))}
                </div>
              </article>

              <aside className={styles.panel}>
                <span className={styles.sectionLabel}>INFORMAÇÕES DO CULTO</span>
                <div className={styles.infoList}>
                  <div><span>Data</span><strong>27/09/2026</strong></div>
                  <div><span>Horário</span><strong>19:00</strong></div>
                  <div><span>Responsável</span><strong>Pr. Daniel</strong></div>
                  <div><span>Duração estimada</span><strong>1h55</strong></div>
                </div>
                <div className={styles.noteBox}>
                  <HandHeart size={20} />
                  <div>
                    <strong>Equipe alinhada</strong>
                    <span>Todos os responsáveis conseguem visualizar a sequência antes do culto.</span>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {section === 'calendar' && (
            <article className={styles.panel}>
              <div className={styles.panelHeaderResponsive}>
                <div>
                  <span>SETEMBRO 2026</span>
                  <h3>Agenda da igreja</h3>
                  <p>Cultos, reuniões, encontros e ações em um único calendário.</p>
                </div>
                <button className={styles.primaryButton}>+ Novo evento</button>
              </div>
              <div className={styles.calendarGrid}>
                {events.map((event) => (
                  <div className={styles.calendarCard} key={event.title}>
                    <div className={styles.dateBadgeLarge}><strong>{event.day}</strong><span>{event.month}</span></div>
                    <div><strong>{event.title}</strong><span>{event.meta}</span></div>
                  </div>
                ))}
              </div>
            </article>
          )}

          {section === 'ministries' && (
            <div className={styles.cardsGrid}>
              {ministries.map((ministry) => (
                <article className={styles.ministryCard} key={ministry.name}>
                  <div className={styles.ministryIcon}><UsersRound size={22} /></div>
                  <span>MINISTÉRIO</span>
                  <h3>{ministry.name}</h3>
                  <div className={styles.ministryMeta}>
                    <div><span>Membros</span><strong>{ministry.members}</strong></div>
                    <div><span>Liderança</span><strong>{ministry.leader}</strong></div>
                    <div><span>Próxima atividade</span><strong>{ministry.next}</strong></div>
                  </div>
                  <button>Ver detalhes <ChevronRight size={17} /></button>
                </article>
              ))}
            </div>
          )}

          {section === 'finance' && (
            <>
              <div className={styles.statsGrid}>
                <StatCard icon={WalletCards} label="Entradas" value="R$ 18.420" hint="Setembro" />
                <StatCard icon={CircleDollarSign} label="Saídas" value="R$ 11.760" hint="Setembro" />
                <StatCard icon={BarChart3} label="Saldo do mês" value="R$ 6.660" hint="Resultado parcial" />
                <StatCard icon={HandHeart} label="Campanhas" value="3" hint="2 ativas" />
              </div>
              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div><span>FINANCEIRO</span><h3>Movimentações recentes</h3></div>
                  <button>Ver relatório</button>
                </div>
                <div className={styles.transactions}>
                  {[
                    ['Dízimos e ofertas', '+ R$ 8.450,00', 'Entrada'],
                    ['Conta de energia', '- R$ 1.280,00', 'Saída'],
                    ['Campanha missionária', '+ R$ 2.730,00', 'Entrada'],
                    ['Material Kids', '- R$ 640,00', 'Saída'],
                  ].map(([name, value, type]) => (
                    <div key={name}>
                      <div><strong>{name}</strong><span>20/09/2026 · {type}</span></div>
                      <strong className={type === 'Entrada' ? styles.positive : styles.negative}>{value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}

          {section === 'communications' && (
            <div className={styles.twoColumns}>
              <article className={styles.panel}>
                <div className={styles.panelHeaderResponsive}>
                  <div>
                    <span>COMUNICAÇÃO</span>
                    <h3>Últimos comunicados</h3>
                    <p>Mensagens para toda a igreja ou públicos específicos.</p>
                  </div>
                  <button className={styles.primaryButton}>+ Novo comunicado</button>
                </div>
                <div className={styles.messageList}>
                  {[
                    ['Culto especial neste domingo', 'Toda a igreja', 'Hoje, 18:30'],
                    ['Reunião de voluntários', 'Voluntários', 'Ontem, 20:10'],
                    ['Escala de louvor atualizada', 'Louvor', '19/09, 14:22'],
                  ].map(([title, audience, date]) => (
                    <div key={title}>
                      <div className={styles.messageIcon}><MessageSquareText size={18} /></div>
                      <div><strong>{title}</strong><span>{audience} · {date}</span></div>
                    </div>
                  ))}
                </div>
              </article>

              <article className={styles.panel}>
                <span className={styles.sectionLabel}>ALCANCE</span>
                <h3>Comunicação centralizada</h3>
                <p className={styles.bodyText}>Evite que avisos importantes se percam em vários grupos. Organize mensagens por público e mantenha o histórico dentro da plataforma.</p>
                <div className={styles.communicationNumbers}>
                  <div><strong>421</strong><span>Pessoas alcançadas</span></div>
                  <div><strong>92%</strong><span>Taxa de leitura</span></div>
                </div>
              </article>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
