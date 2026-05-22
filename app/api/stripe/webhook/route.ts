import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
});

// Podłączenie do bazy z uprawnieniami Administratora (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Błąd weryfikacji Webhooka:', err.message);
    return NextResponse.json({ error: `Błąd Webhooka: ${err.message}` }, { status: 400 });
  }

  // 1. ZDARZENIE: Zakończono zakup (Checkout Completed)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const eventId = session.metadata?.eventId;

    if (eventId && session.subscription) {
      console.log(`Pobieram dane subskrypcji dla eventu: ${eventId}`);
      
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
      
      // BEZPIECZNE OBLICZANIE DATY
      let currentPeriodEnd = null;
      if (subscription && subscription.current_period_end) {
        // Jeśli Stripe podał datę, formatujemy ją normalnie
        currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      } else {
        // AWARYJNIE: Jeśli daty brakuje, dodajemy po prostu 30 dni od teraz
        const fallbackDate = new Date();
        fallbackDate.setDate(fallbackDate.getDate() + 30);
        currentPeriodEnd = fallbackDate.toISOString();
      }

      console.log(`Zapisuję pełne dane PRO do bazy dla eventu: ${eventId}`);

      const { error } = await supabase
        .from('events')
        .update({ 
          tier: 'pro',
          // Używamy ID z sesji jako zabezpieczenia, gdyby obiekt subscription był pusty
          stripe_subscription_id: subscription?.id || session.subscription,
          stripe_customer_id: session.customer as string,
          subscription_end_date: currentPeriodEnd
        })
        .eq('id', eventId);

      if (error) {
        console.error('Błąd aktualizacji bazy:', error);
        return NextResponse.json({ error: 'Błąd zapisu w bazie' }, { status: 500 });
      }
    }
  }

  // 2. ZDARZENIE: Anulowano subskrypcję
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as any;
    console.log(`Subskrypcja anulowana: ${subscription.id}`);

    const { error } = await supabase
      .from('events')
      .update({ tier: 'free', subscription_end_date: null })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Błąd cofania statusu PRO:', error);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}