import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEur(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function traducirError(msg: string | undefined): string {
  if (!msg) return 'Error desconocido';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials'))             return 'Correo o contraseña incorrectos';
  if (m.includes('email not confirmed'))                   return 'Confirma tu correo antes de iniciar sesión';
  if (m.includes('user already registered') || m.includes('already been registered') || m.includes('email already exists'))
                                                           return 'Este correo ya está registrado';
  if (m.includes('user not found'))                       return 'Usuario no encontrado';
  if (m.includes('password should be at least') || m.includes('password must be at least'))
                                                           return 'La contraseña debe tener al menos 6 caracteres';
  if (m.includes('too many requests') || m.includes('rate limit'))
                                                           return 'Demasiados intentos. Espera un momento antes de volver a intentarlo';
  if ((m.includes('session') && (m.includes('expired') || m.includes('missing') || m.includes('invalid'))) || m.includes('jwt expired'))
                                                           return 'La sesión ha caducado. Vuelve a iniciar sesión';
  if (m.includes('invalid email') || m.includes('unable to validate email') || m.includes('email is invalid'))
                                                           return 'El formato del correo no es válido';
  if (m.includes('signup disabled'))                      return 'El registro no está disponible en este momento';
  if (m.includes('bucket') && m.includes('not found'))    return 'Error de almacenamiento: bucket no encontrado';
  if (m.includes('file too large') || m.includes('payload too large'))
                                                           return 'El archivo es demasiado grande';
  if (m.includes('duplicate key') || (m.includes('unique') && m.includes('constraint')))
                                                           return 'Ya existe un registro con esos datos';
  if (m.includes('foreign key'))                          return 'No se puede eliminar: hay datos relacionados';
  if (m.includes('database error'))                       return 'Error en la base de datos';
  if (m.includes('network') || m.includes('fetch failed') || m.includes('failed to fetch'))
                                                           return 'Error de conexión. Comprueba tu internet';
  return msg;
}
