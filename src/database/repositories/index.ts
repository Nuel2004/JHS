import { SupabaseHermanoRepository } from '../supabase/SupabaseHermanoRepository';
import { SupabaseNoticiaRepository } from '../supabase/SupabaseNoticiaRepository';
import { SupabaseProductoRepository } from '../supabase/SupabaseProductoRepository';
import { SupabaseProcesionRepository } from '../supabase/SupabaseProcesionRepository';

// Instancias únicas — patrón Vesto
export const hermanoRepository = new SupabaseHermanoRepository();
export const noticiaRepository = new SupabaseNoticiaRepository();
export const productoRepository = new SupabaseProductoRepository();
export const procesionRepository = new SupabaseProcesionRepository();

// Re-exportamos tipos
export type { RegistroDatos, Genero } from './HermanoRepository';
