# ChurchOS

Plataforma SaaS multi-tenant de gestão para igrejas, construída com Next.js, TypeScript, Supabase e PostgreSQL.

## Referências de produto

Este projeto usa como referências de produto, funcionalidades, UX e modelo de negócio — sem copiar visual ou código:

- https://inchurch.com.br/
- https://nossaigreja.app/
- https://gochurchapp.com.br/

## Objetivo

Oferecer duas experiências principais:

1. Painel administrativo da igreja.
2. Portal/app mobile-first para membros e visitantes.

A arquitetura nasce multi-tenant, com isolamento por igreja, RBAC, RLS, auditoria e suporte futuro a multiunidades.

## Stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth
- PostgreSQL / Supabase
- Supabase Storage
- Vercel

## Estado

Fundação inicial em desenvolvimento. O projeto não deve ser tratado como concluído até os fluxos principais estarem integrados ao banco, protegidos por autorização server-side, testados e validados em produção.
