import Stripe from 'npm:stripe@17';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, hermano_id } = body;
    const origin = body.origin ?? req.headers.get('origin') ?? 'http://localhost:5173';

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    let success_url: string;
    let cancel_url: string;
    const metadata: Record<string, string> = { type, hermano_id: String(hermano_id) };

    if (type === 'cuota') {
      line_items = [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Cuota anual · Cofradía JHS Montijo' },
          unit_amount: 1000,
        },
        quantity: 1,
      }];
      success_url = `${origin}/mi/cuotas?pagado=1`;
      cancel_url  = `${origin}/mi/cuotas`;
    } else if (type === 'carrito') {
      const items = body.items as Array<{
        pedido_id: number;
        nombre: string;
        precio: number;
        cantidad: number;
      }>;
      if (!Array.isArray(items) || items.length === 0) {
        return new Response(JSON.stringify({ error: 'items must be a non-empty array' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      line_items = items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.nombre },
          unit_amount: Math.round(item.precio * 100),
        },
        quantity: item.cantidad,
      }));
      metadata.pedido_ids = JSON.stringify(items.map((i) => i.pedido_id));
      success_url = `${origin}/mi/pedidos?pagado=1`;
      cancel_url  = `${origin}/mi/tienda`;
    } else {
      // Caso legacy: type === 'pedido' (un solo producto)
      const { pedido_id, total, nombre } = body;
      line_items = [{
        price_data: {
          currency: 'eur',
          product_data: { name: nombre ?? 'Pedido · Cofradía JHS Montijo' },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      }];
      metadata.pedido_id = String(pedido_id);
      success_url = `${origin}/mi/pedidos?pagado=1`;
      cancel_url  = `${origin}/mi/tienda`;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url,
      cancel_url,
      automatic_payment_methods: { enabled: true },
      locale: 'es',
      metadata,
    });

    if (!session.url) {
      return new Response(JSON.stringify({ error: 'Stripe did not return a checkout URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
