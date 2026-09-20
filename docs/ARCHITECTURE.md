# Arquitetura

## Princípios

- Um banco PostgreSQL compartilhado, isolado por church_id.
- RLS obrigatória nas tabelas expostas.
- RBAC por igreja.
- Autorização também no servidor; nunca confiar apenas na UI.
- Usuário autenticado e membro da igreja são conceitos diferentes.
- Unidades/campus são escopos subordinados à organização.

## Superfícies

- /dashboard: painel administrativo.
- /member: portal do membro, a ser implementado.
- /super-admin: operação SaaS, a ser implementada.

## Segurança

Helpers de autorização devem ficar em schema privado, com EXECUTE explicitamente concedido. Service role nunca deve ir ao cliente.
