# ClinicOps - przygotowanie demo dla komisji

## Link dla komisji

Docelowo komisji podajemy jeden link:

```text
https://TWOJA-DOMENA.vercel.app/pl/demo
```

Ta strona pokazuje, że aplikacja jest demonstratorem systemu ClinicOps i prowadzi do:

- panelu managera kliniki,
- portalu pacjenta,
- opcjonalnego widoku recepcji,
- opcjonalnego widoku lekarza.

Wszystkie dane w demo powinny być fikcyjne.

## Wymagane zmienne w Vercel

W ustawieniach projektu Vercel dodaj:

```text
NEXT_PUBLIC_DEMO_EVENT_ID=ID_KLINIKI_DEMO
NEXT_PUBLIC_DEMO_PORTAL_SLUG=integracja
```

Opcjonalnie, jeśli chcesz mieć osobne przyciski dla personelu:

```text
NEXT_PUBLIC_DEMO_RECEPTION_TOKEN=TOKEN_STAFF_PASS_RECEPCJI
NEXT_PUBLIC_DEMO_DOCTOR_TOKEN=TOKEN_STAFF_PASS_LEKARZA
```

Po dodaniu zmiennych trzeba zrobić ponowny deploy.

## Skąd wziąć ID kliniki demo

ID kliniki demo to `id` rekordu w tabeli:

```text
public.b2b_events
```

Najprościej:

1. Wejdź w swoją aplikację.
2. Utwórz lub wybierz klinikę/oddział demonstracyjny.
3. Skopiuj ID z URL:

```text
/pl/b2b/events/TUTAJ_JEST_ID
```

4. Wklej to ID do `NEXT_PUBLIC_DEMO_EVENT_ID`.

## Dane, które warto mieć w demo

Dla komisji najlepiej przygotować:

- 20-30 fikcyjnych pacjentów,
- kilka wizyt i zabiegów z cenami,
- kilku lekarzy i personel,
- szablony zgód i wywiadów,
- dokumenty pacjentów ze statusami `pending` i `signed`,
- pytania pacjentów z portalu,
- odpowiedzi recepcji,
- zadania follow-up,
- płatności i koszty,
- preparaty i partnerów medycznych,
- dane do analityki AI.

## Jak prezentować demo

Krótki scenariusz:

1. Otwórz `/pl/demo`.
2. Kliknij `Wejdź do demo managera`.
3. Pokaż rejestrację pacjenta.
4. Pokaż wizytę i zabieg z ceną.
5. Pokaż zgody i dokumenty.
6. Pokaż portal pacjenta.
7. Pokaż analizę rozmów i follow-up.
8. Pokaż Patient Experience Manager.
9. Pokaż AI analitykę i finanse.

## Uwaga

Tryb demo wpuszcza publicznie tylko do jednego panelu, którego ID podasz w `NEXT_PUBLIC_DEMO_EVENT_ID`, i tylko gdy link ma parametr:

```text
?demo=1
```

Normalne ścieżki aplikacji nadal wymagają logowania.
