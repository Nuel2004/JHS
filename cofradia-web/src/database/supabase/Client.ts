// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

// Creamos un cliente con nuestra URL y nuestra contraseña!
// Lo tenemos en una variable llamada supabase
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
);