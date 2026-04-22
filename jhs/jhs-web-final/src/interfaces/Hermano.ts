export type EstadoHermano = 'pendiente_pago' | 'activo' | 'baja';
export type RolUsuario = 'hermano' | 'admin';
export type Genero = 'Mujer' | 'Hombre' | 'Otro';

export interface Hermano {
  id: number;
  auth_id: string | null;
  nombre: string;
  apellidos: string;
  genero: Genero;
  direccion: string;
  fecha_nacimiento: string;
  email: string;
  telefono: string;
  bautizado: boolean;
  es_cofrade: boolean;
  estado: EstadoHermano;
  rol: RolUsuario;
  preferencia_paso: string | null;
  pago_presencial: boolean;
  fecha_alta: string;
  stripe_customer_id: string | null;
  notas_admin: string | null;
}

export interface SessionHermano {
  user: {
    id: string;
    email: string;
  };
  hermano: Hermano;
}
