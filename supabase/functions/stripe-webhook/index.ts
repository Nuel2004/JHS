import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch {
    return new Response('Firma inválida', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const { type, hermano_id, pedido_id, pedido_ids } = session.metadata ?? {};

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (type === 'cuota' && hermano_id) {
      await supabase
        .from('hermanos')
        .update({ estado: 'activo' })
        .eq('id', hermano_id);
    } else if (type === 'carrito' && pedido_ids) {
      let ids: number[];
      try {
        ids = JSON.parse(pedido_ids) as number[];
      } catch {
        console.error('pedido_ids no es JSON válido:', pedido_ids);
        return new Response('pedido_ids inválido', { status: 400 });
      }
      const paymentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : null;
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'pagado', pago_id: paymentId })
        .in('id', ids);
      if (error) {
        console.error('Error al actualizar pedidos carrito:', error.message);
        return new Response('Error en pedidos', { status: 500 });
      }
    } else if (type === 'pedido' && pedido_id) {
      await supabase
        .from('pedidos')
        .update({ estado: 'pagado', pago_id: session.payment_intent as string })
        .eq('id', pedido_id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
