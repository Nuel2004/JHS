/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Cliente principal — recibe la sesión del usuario tras el login
export const supabaseClient = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Cliente admin — instancia separada, nunca recibe setSession,
// siempre opera con service_role y bypasea RLS
export const supabaseAdmin = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
);