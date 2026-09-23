# Auditoria de Produto — PIBJG

Data: 23/09/2026  
Escopo: transformar o projeto existente em um produto apresentável para a liderança, preservando funcionalidades e priorizando P0/P1.

## Auditoria inicial

O projeto já tinha uma base funcional relevante: Next.js 15/React 19, Supabase Auth/Postgres/RLS, painel de gestão, área do membro, membros, visitantes e follow-up, células, ministérios, eventos, comunicação, notícias, chats, cuidado, Kids, louvor, projeção, escalas, ordem do culto, relatórios e configurações de identidade.

Os principais gaps encontrados nesta rodada foram:

- algumas rotas administrativas dependiam mais do menu/RLS do que de um guard explícito de página;
- ações de escala e check-in usavam apenas contexto de igreja em vez de permissão específica;
- a política de leitura de inscrições de eventos permitia leitura operacional por `events.read`, ampla demais para uma experiência de membro;
- escalas eram legíveis para qualquer usuário ativo da igreja;
- componentes decidiam capacidade administrativa por `roleKey !== 'member'`, em vez de permissão;
- a tela de eventos era a mesma experiência para membro e gestão;
- a rádio existia na Home, mas o player reiniciava ao navegar;
- WhatsApp estava acoplado diretamente à implementação Cloud API;
- havia navegação redundante para notícias no painel;
- faltava um estado de erro de rota protegido e uma camada adicional de foco/acessibilidade.

## Benchmark

Referências revisadas em 22–23/09/2026:

- inChurch: painel integrado, gestão de membresia, grupos, timeline, banners, eventos, comunicação segmentada e cuidado com pessoas;
- Atos6: membresia, células/PGs, aplicativo e foco em acompanhamento/relacionamento;
- Planning Center / Church Center: separação clara entre ferramentas operacionais e experiência da congregação; módulos de People, Groups, Registrations, Services e Church Center;
- NossaIgreja.app: módulos de membros, eventos, Kids, louvor, projeção, células, voluntários, patrimônio, relatórios, WhatsApp e níveis de acesso;
- GoChurch: usado como referência de posicionamento de aplicativo/plataforma para igreja.

Conceitos adotados: separar operação da experiência congregacional, priorizar jornada de pessoas, expor eventos como conteúdo para o membro, manter ações administrativas permissionadas e transformar rádio/comunicação em elementos naturais do app.

Não foi copiada nenhuma interface.

## Matriz de produto

| Funcionalidade | Estado após esta rodada | Gap restante | Prioridade |
| --- | --- | --- | --- |
| Área do membro | Home, notícias, eventos, comunidade, perfil e rádio persistente | evolução editorial do carrossel | P2 |
| Membros | diretório + guard explícito + ação por permissão | exportação/LGPD dedicada | P2 |
| Visitantes/follow-up | pipeline e automações existentes | métricas de conversão mais profundas | P2 |
| Eventos | experiência membro separada, publicação rica, inscrições/check-in | recorrência avançada | P2 |
| Ordem do culto | CRUD + reordenação existente | templates mais sofisticados | P3 |
| Comunicação/Notícias | gestão e feed existentes | agendamento editorial avançado | P2 |
| WhatsApp | link, templates, Cloud API e provider abstrato | provider secundário opcional | P3 |
| Rádio | player persistente no shell do membro | metadados Now Playing dependem do stream/provider | P3 |
| RBAC | guards, RLS e navegação por permissão | cadastrar novos papéis no produto quando a igreja definir responsabilidades | P2 |
| Segurança | hardening de inscrições/escalas + ações protegidas | ativar Leaked Password Protection no painel Supabase | P1 operacional |
| Financeiro | fora da navegação e do foco do produto | manter apenas legado compatível enquanto dados existirem | futuro |

## UX/UI

- Eventos do membro deixaram de exibir contadores e controles operacionais.
- A lista de eventos do membro ganhou cards editoriais com banner, categoria, data, hora e local.
- O detalhe do evento do membro agora prioriza conteúdo, compartilhamento e inscrição.
- A criação de evento passou a aceitar categoria, banner e descrição.
- O shell do membro centraliza seus tokens visuais e mantém alvos de toque adequados.
- Estados de foco foram reforçados nos controles globais.
- Foi adicionado um error boundary para evitar tela branca em falhas de rotas protegidas.
- A navegação administrativa passou a respeitar permissões e removeu o atalho redundante de Notícias; edição continua em Comunicação e consumo permanece na área de Notícias.

## Alterações técnicas

Principais áreas modificadas:

- `lib/auth.ts`: helpers reutilizáveis de autorização;
- `lib/whatsapp.ts`: abstração `MessagingProvider`;
- `components/app-shell.tsx`: navegação por RBAC;
- `components/member-shell.tsx` e CSS: shell do membro e rádio persistente;
- `components/member-radio-player.tsx`: novo player persistente;
- `app/(protected)/events/*`: separação membro/gestão e publicação rica;
- `app/(protected)/members/*`, `cells/*`, `calendar`, `search`, `projection`, `content`, `volunteers/*`: guards explícitos;
- `app/(protected)/error.tsx`: estado de falha recuperável;
- `app/globals.css`: acessibilidade e superfícies de eventos;
- `supabase/migrations/0018_participant_privacy.sql`: hardening de inscrições e escalas.

## Segurança

Correções desta rodada:

- check-in agora exige `events.manage`;
- criação/edição de escalas exige `ministries.manage`;
- página de nova célula exige `cells.manage`;
- página de novo membro exige `members.create`;
- diretório de membros exige `members.read`;
- busca global e calendário exigem permissões administrativas compatíveis;
- formulários de gestão são mostrados por permissão real, não por heurística de role;
- leitura de inscrições passa a ser gerente ou o próprio membro;
- leitura de escala passa a ser gerente ou o próprio membro;
- inserts de inscrição validam pessoa e evento dentro da mesma igreja;
- mutations de escala validam evento, membro e ministério no mesmo tenant;
- remoção do update amplo de escala pelo próprio membro.

## Performance

- inscrições e escalas completas deixam de ser consultadas no detalhe de evento do membro;
- listagem de eventos só consulta inscrições quando o usuário realmente pode operar o evento;
- player de rádio fica no layout persistente e não é recriado em toda troca de página;
- alterações foram incrementais; nenhuma biblioteca nova foi adicionada.

## Testes e validação

A validação automatizada do PR executa:

1. TypeScript;
2. ESLint;
3. build de produção.

A migration deve ser validada no projeto Supabase e seguida pelos Advisors.

Fluxos prioritários para smoke test após deploy: login admin, dashboard, membros, visitantes, eventos, inscrição, check-in, comunicação, ordem do culto, configurações, logout; login membro, Home, notícias, eventos, rádio, perfil e logout.

## Pendências

- ativar Leaked Password Protection no Supabase Auth (advisor de segurança atual);
- criar papéis adicionais somente quando a igreja definir responsabilidades reais; o banco atual possui apenas Administrador;
- testes E2E automatizados de navegador podem ser adicionados em uma etapa futura sem bloquear esta entrega;
- metadados dinâmicos da rádio dependem do provider de streaming.

## Segunda auditoria

A rodada final verificou os caminhos de maior risco encontrados: eventos, inscrições, escalas, membros, células, busca global, calendário, projeção, conteúdo, navegação RBAC e rádio. Nenhuma funcionalidade existente foi removida para simplificar a implementação; as mudanças preservam a stack e os dados atuais.
