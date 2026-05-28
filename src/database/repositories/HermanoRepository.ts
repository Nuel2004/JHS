import type { Hermano, SessionHermano, Genero } from '../../interfaces/Hermano';

export type { Genero };

export interface RegistroDatos {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  genero: Genero;
  direccion: string;
  fecha_nacimiento: string;
  telefono: string;
  bautizado: boolean;
  foto_bautismo?: File | null;
  quiere_ser_hermano: boolean;
}

export interface EditarHermanoDatos {
  nombre?: string;
  apellidos?: string;
  genero?: Genero;
  direccion?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  bautizado?: boolean;
  estado?: import('../../interfaces/Hermano').EstadoHermano;
  notas_admin?: string | null;
}

export interface HermanoRepository {
  /** Registra en Auth + tabla hermanos */
  registrar(datos: RegistroDatos): Promise<{ success: boolean; error?: string }>;

  /** Login: devuelve sesión completa con datos del hermano */
  login(email: string, password: string): Promise<{ data?: SessionHermano; error?: string }>;

  /** Cierra sesión */
  logout(): Promise<{ error?: string }>;

  /** Obtiene el hermano por su auth_id */
  obtenerPorAuthId(authId: string): Promise<{ data?: Hermano; error?: string }>;

  /** Lista todos los hermanos — solo admin */
  obtenerTodos(): Promise<{ data?: Hermano[]; error?: string }>;

  /** Actualiza preferencia de puesto en procesión */
  actualizarPreferencia(hermanoId: number, preferencia: string): Promise<{ error?: string }>;

  /** Marca pago presencial — solo admin */
  marcarPagoPresencial(hermanoId: number): Promise<{ error?: string }>;

  /** Activa un hermano como cofrade — solo admin */
  activarCofrade(hermanoId: number): Promise<{ error?: string }>;

  /** Edita los datos de un hermano — solo admin */
  editarHermano(hermanoId: number, datos: EditarHermanoDatos): Promise<{ error?: string }>;

  /** Cambia el estado a 'baja' — solo admin */
  darDeBaja(hermanoId: number): Promise<{ error?: string }>;

  /** Cambia el rol de un hermano — solo superadmin */
  cambiarRol(hermanoId: number, rol: import('../../interfaces/Hermano').RolUsuario): Promise<{ error?: string }>;

  /** Envía email de recuperación de contraseña */
  recuperarPassword(email: string): Promise<{ error?: string }>;

  /** Actualiza la contraseña del usuario con sesión de recuperación activa */
  actualizarPassword(password: string): Promise<{ error?: string }>;
}