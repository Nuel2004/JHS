/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Creamos un cliente con nuestra URL y nuestra contraseña
// Lo exportamos como supabaseClient para que coincida con el Repositorio
export const supabaseClient = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);