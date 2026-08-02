do $$
begin
  update public.profiles
  set plano = 'dono'
  where id = (
    select id
    from auth.users
    where lower(email) = lower('mahafinance2026@gmail.com')
  );

  if not exists (
    select 1
    from public.profiles as perfil
    join auth.users as usuario on usuario.id = perfil.id
    where lower(usuario.email) = lower('mahafinance2026@gmail.com')
      and perfil.plano = 'dono'
  ) then
    raise exception
      'A conta mahafinance2026@gmail.com não foi encontrada ou não possui perfil.';
  end if;
end
$$;
