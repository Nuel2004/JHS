export interface Noticia {
  id: number;
  titulo: string;
  cuerpo: string;
  imagen_url: string | null;
  autor_id: number | null;
  fecha_publicacion: string;
  publicada: boolean;
  destacada: boolean;
}

export interface NoticiaCreate {
  titulo: string;
  cuerpo: string;
  imagen_url?: string;
  destacada?: boolean;
  publicada?: boolean;
}
