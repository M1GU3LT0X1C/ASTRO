# Mensagens ASTRO — estrutura sem banco

- Páginas: `/dashboard/mensagens` (ONG) e `/dashboard-explorador/mensagens` (Explorador).
- UI compartilhada: `src/components/mensagens/Mensagens.tsx` e CSS.
- Contrato de dados: `src/lib/mensagens/repository.ts`.
- Sem dados fictícios, sem persistência e sem envio enquanto não houver integração.
- Busca retorna lista vazia até conectar backend. Envio fica desabilitado.
- Link futuro a partir de perfis: `/dashboard/mensagens?destinatario=ID` ou `/dashboard-explorador/mensagens?destinatario=ID`. O ID deve vir do banco; por ora a rota apenas registra a intenção.

## Próximas etapas
1. Implementar repositório Supabase/API com identidade autenticada e filtros por participante.
2. Implementar `iniciarConversa` idempotente, busca de destinatários e carregamento de histórico.
3. Habilitar envio, arquivamento e notificações somente após operações reais.
4. Adicionar RLS no banco e assinaturas de atualizações em tempo real.
5. Adicionar botões `Enviar mensagem` nos perfis quando houver IDs reais de destinatários.
