import { NextResponse } from 'next/server'

const GUS_API_URL = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc'

const extract = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'))
  return match?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() || ''
}

const stripXml = (value: string) =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')

const soap = (body: string) => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>${body}</soap:Body>
</soap:Envelope>`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const nip = (searchParams.get('nip') || '').replace(/\D/g, '')
  const apiKey = process.env.GUS_API_KEY

  if (nip.length !== 10) {
    return NextResponse.json({ message: 'Podaj poprawny 10-cyfrowy NIP' }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json(
      { message: 'Brak GUS_API_KEY w .env.local. Dodaj klucz GUS, aby pobierać dane automatycznie.' },
      { status: 501 }
    )
  }

  try {
    const loginRes = await fetch(GUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        SOAPAction: 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj'
      },
      body: soap(`<Zaloguj xmlns="http://CIS/BIR/PUBL/2014/07"><pKluczUzytkownika>${apiKey}</pKluczUzytkownika></Zaloguj>`)
    })

    const loginXml = await loginRes.text()
    const sid = extract(loginXml, 'ZalogujResult')

    if (!sid) {
      return NextResponse.json({ message: 'Nie udało się zalogować do GUS REGON API' }, { status: 502 })
    }

    const searchRes = await fetch(GUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        SOAPAction: 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty',
        sid
      },
      body: soap(`
        <DaneSzukajPodmioty xmlns="http://CIS/BIR/PUBL/2014/07">
          <pParametryWyszukiwania xmlns:d4p1="http://CIS/BIR/PUBL/2014/07/DataContract">
            <d4p1:Nip>${nip}</d4p1:Nip>
          </pParametryWyszukiwania>
        </DaneSzukajPodmioty>
      `)
    })

    const searchXml = await searchRes.text()
    const resultXml = stripXml(extract(searchXml, 'DaneSzukajPodmiotyResult'))

    if (!resultXml) {
      return NextResponse.json({ message: 'Nie znaleziono firmy dla podanego NIP' }, { status: 404 })
    }

    const street = [extract(resultXml, 'Ulica'), extract(resultXml, 'NrNieruchomosci'), extract(resultXml, 'NrLokalu')].filter(Boolean).join(' ')
    const city = [extract(resultXml, 'KodPocztowy'), extract(resultXml, 'Miejscowosc')].filter(Boolean).join(' ')
    const address = [street, city].filter(Boolean).join(', ')

    return NextResponse.json({
      name: extract(resultXml, 'Nazwa'),
      nip,
      regon: extract(resultXml, 'Regon'),
      krs: extract(resultXml, 'Krs'),
      address
    })
  } catch (error) {
    return NextResponse.json({ message: 'GUS REGON API jest chwilowo niedostępne' }, { status: 502 })
  }
}