# Ativação do Painel do Dono

Estes passos são executados uma única vez no projeto Supabase usado pelo
MahaFinance.

1. Aplique a migration `migrations/20260802000000_owner_admin.sql`.
2. Publique a função `functions/admin-usuarios` com o nome
   `admin-usuarios`.
3. No painel do Supabase, abra **Authentication > Hooks > Before User
   Created** e escolha a função Postgres `public.hook_controlar_cadastros`.
4. A migration já promove a conta principal autorizada:

   ```sql
   update public.profiles
   set plano = 'dono'
   where id = (
     select id
     from auth.users
     where lower(email) = lower('mahafinance2026@gmail.com')
   );
   ```

Depois disso, saia e entre novamente no aplicativo. A opção
**Administração** aparecerá apenas para a conta com plano `dono`.

Nunca coloque a chave `service_role` ou uma chave secreta do Supabase no
frontend ou em arquivos `.env` que comecem com `VITE_`. A função usa o segredo
interno disponibilizado pelo próprio Supabase.
