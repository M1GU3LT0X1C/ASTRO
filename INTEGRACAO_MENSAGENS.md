# Mensagens ASTRO

- Páginas: `/dashboard/mensagens` (ONG) e `/dashboard-explorador/mensagens` (Explorador).
- UI compartilhada: `src/components/mensagens/Mensagens.tsx` e CSS.
- Dados: `src/lib/mensagens/repository.ts`, ligado a `/api/conversas` no back-end (tabelas `conversas` e `mensagens`, script `sql/004_integracao_front.sql`).
- A lista e a conversa aberta se atualizam a cada 5 segundos enquanto a aba está visível.
- Busca de contatos: o Explorador encontra ONGs pelo nome; a ONG encontra outras ONGs e os Exploradores que pediram adoção de algum pet dela.
- Link a partir de perfis: `/dashboard/mensagens?destinatario=ID` ou `/dashboard-explorador/mensagens?destinatario=ID`, em que ID é o id da conta (auth.users). A conversa é criada (ou reaberta) automaticamente.
- Já usado em: página pública do pet, página pública da ONG, "Minhas adoções" e "Solicitações de adoção" da ONG.

## Próximas etapas
1. Anexos e emojis (botões já existem na UI, desabilitados).
2. Trocar a atualização periódica por Supabase Realtime, se necessário.
