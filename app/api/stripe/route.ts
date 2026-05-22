import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body; 

    if (!email) {
      return NextResponse.json({ error: 'Brak adresu e-mail użytkownika' }, { status: 400 });
    }

    // 1. Wyszukujemy klienta po e-mailu
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        error: 'Nie znaleziono Twojego konta w systemie płatności. Upewnij się, że użyłeś tego samego e-maila przy zakupie.' 
      }, { status: 404 });
    }

    const stripeCustomerId = customers.data[0].id;

    // 2. Generujemy sesję portalu
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/b2b/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Błąd Stripe Portal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}