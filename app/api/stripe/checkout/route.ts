import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: Request) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Brak ID wydarzenia' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Wymuszamy płatność kartą (najbezpieczniejsze dla subskrypcji)
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: 'Pakiet PRO - Subskrypcja Miesięczna',
              description: 'Odblokowanie pełnych modułów: import od gości, RSVP, muzyka i galeria.',
            },
            unit_amount: 5900,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Ustawiony twardy adres powrotny na Twoją domenę
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/b2b/events/${eventId}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/b2b/events/${eventId}?payment=canceled`,
      metadata: {
        eventId: eventId, 
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Błąd Stripe:', err);
    // Zwracamy frontendowi DOKŁADNY komunikat błędu od Stripe'a
    return NextResponse.json({ error: err.message || 'Nieznany błąd Stripe' }, { status: 500 });
  }
}