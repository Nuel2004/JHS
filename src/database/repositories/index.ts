import { SupabaseHermanoRepository } from '../supabase/SupabaseHermanoRepository';
import { SupabaseNoticiaRepository } from '../supabase/SupabaseNoticiaRepository';
import { SupabaseProductoRepository } from '../supabase/SupabaseProductoRepository';
import { SupabaseProcesionRepository } from '../supabase/SupabaseProcesionRepository';
import { SupabasePasoRepository } from '../supabase/SupabasePasoRepository';

// Instancias únicas — patrón Vesto
export const hermanoRepository = new SupabaseHermanoRepository();
export const noticiaRepository = new SupabaseNoticiaRepository();
export const productoRepository = new SupabaseProductoRepository();
export const procesionRepository = new SupabaseProcesionRepository();
export const pasoRepository = new SupabasePasoRepository();

// Re-exportamos tipos
export type { RegistroDatos, Genero } from './HermanoRepository';
