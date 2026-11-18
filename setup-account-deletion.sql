create or replace function public.delete_user_account()
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return json_build_object('success', false, 'error', 'No active session');
  end if;

  delete from public.products where vendor_id = uid::text;
  delete from public.profiles where id = uid::text;
  delete from auth.users where id = uid;

  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

grant execute on function public.delete_user_account() to authenticated;
