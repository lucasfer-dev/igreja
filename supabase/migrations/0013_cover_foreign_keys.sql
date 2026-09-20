-- Cover foreign-key columns that still lack a usable leading index.
-- Generated dynamically from PostgreSQL catalog so existing equivalent indexes are skipped.
do $$
declare
  fk record;
  idx_name text;
  cols text;
begin
  for fk in
    select c.oid, c.conrelid, c.conname, c.conkey, n.nspname as schema_name, t.relname as table_name
    from pg_constraint c
    join pg_class t on t.oid=c.conrelid
    join pg_namespace n on n.oid=t.relnamespace
    where c.contype='f' and n.nspname='public'
      and not exists (
        select 1
        from pg_index i
        where i.indrelid=c.conrelid
          and (i.indkey::smallint[])[0:array_length(c.conkey,1)-1]=c.conkey
      )
  loop
    select string_agg(quote_ident(a.attname), ', ' order by u.ord)
      into cols
    from unnest(fk.conkey) with ordinality u(attnum,ord)
    join pg_attribute a on a.attrelid=fk.conrelid and a.attnum=u.attnum;

    idx_name := left('fk_' || fk.table_name || '_' || replace(fk.conname,'_fkey','') || '_idx', 60);
    execute format('create index if not exists %I on %I.%I (%s)', idx_name, fk.schema_name, fk.table_name, cols);
  end loop;
end
$$;
