import type { Noticia, NoticiaCreate } from '../../interfaces/Noticia';

export interface NoticiaRepository {
  /** Obtiene todas las noticias publicadas */
  obtenerPublicadas(): Promise<{ data?: Noticia[]; error?: string }>;

  /** Obtiene una noticia por ID */
  obtenerPorId(id: number): Promise<{ data?: Noticia; error?: string }>;

  /** Crea una noticia — solo admin */
  crear(noticia: NoticiaCreate, autorId: number): Promise<{ data?: Noticia; error?: string }>;

  /** Edita una noticia — solo admin */
  editar(id: number, cambios: Partial<NoticiaCreate>): Promise<{ error?: string }>;

  /** Elimina una noticia — solo admin */
  eliminar(id: number): Promise<{ error?: string }>;

  /** Obtiene todas (incluye no publicadas) — solo admin */
  obtenerTodas(): Promise<{ data?: Noticia[]; error?: string }>;
}
