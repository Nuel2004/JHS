import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, bucket = 'noticias' } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL requerida' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      return new Response(JSON.stringify({ error: 'No se pudo descargar la imagen' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.split('/')[1]?.split(';')[0]?.split('+')[0] ?? 'jpg';
    const arrayBuffer = await imageRes.arrayBuffer();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const path = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, { contentType, upsert: false });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return new Response(JSON.stringify({ url: data.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
