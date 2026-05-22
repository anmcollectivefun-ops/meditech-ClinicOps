import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { to_email, to_name, subject, html_content } = await request.json()

    if (!to_email || !html_content) {
      return NextResponse.json({ message: 'Brak wymaganych danych' }, { status: 400 })
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.SENDER_NAME || 'Planer Weselny',
          email: process.env.SENDER_EMAIL!,
        },
        to: [{ email: to_email, name: to_name || to_email }],
        subject,
        htmlContent: html_content,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ message: data?.message || 'Błąd Brevo API' }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Błąd serwera' }, { status: 500 })
  }
}
