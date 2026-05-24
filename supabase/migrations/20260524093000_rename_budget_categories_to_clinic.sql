update public.event_budget_categories
set name = case
  when lower(coalesce(slug, '')) = 'gadgets' or lower(name) in ('gadżety', 'gadzety')
    then 'Preparaty i materiały'
  when lower(coalesce(slug, '')) = 'contractors' or lower(name) = 'podwykonawcy'
    then 'Usługi zewnętrzne'
  when lower(coalesce(slug, '')) in ('venue', 'venue_hotel', 'location') or lower(name) in ('obiekt / lokalizacja', 'obiekt/lokalizacja')
    then 'Czynsz, gabinety i lokalizacja'
  when lower(coalesce(slug, '')) in ('decor', 'decorations') or lower(name) = 'dekoracje'
    then 'Wyposażenie i estetyka gabinetów'
  when lower(coalesce(slug, '')) in ('technical', 'av') or lower(name) = 'technika'
    then 'Sprzęt i serwis'
  when lower(coalesce(slug, '')) in ('income', 'tickets') or lower(name) = 'przychody'
    then 'Przychody z wizyt'
  when lower(coalesce(slug, '')) = 'facility' and lower(name) = 'czynsz i media'
    then 'Czynsz, gabinety i lokalizacja'
  else name
end
where lower(coalesce(slug, '')) in (
  'gadgets',
  'contractors',
  'venue',
  'venue_hotel',
  'location',
  'decor',
  'decorations',
  'technical',
  'av',
  'income',
  'tickets',
  'facility'
)
or lower(name) in (
  'gadżety',
  'gadzety',
  'podwykonawcy',
  'obiekt / lokalizacja',
  'obiekt/lokalizacja',
  'dekoracje',
  'technika',
  'przychody',
  'czynsz i media'
);
