alter table public.event_partners
  add column if not exists unit_price numeric(12,2),
  add column if not exists currency text not null default 'PLN',
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists low_stock_threshold integer not null default 0,
  add column if not exists storage_location text,
  add column if not exists supplier_name text,
  add column if not exists expiry_date date;

create index if not exists event_partners_stock_quantity_idx
  on public.event_partners(stock_quantity);

create index if not exists event_partners_expiry_date_idx
  on public.event_partners(expiry_date);
