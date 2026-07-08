export type CanalTipo = 'aritmética' | 'álgebra' | 'física';
export type EstadoNivel = 'active' | 'locked' | 'dx';

export interface Nivel {
  id: string;
  titulo: string;
  canal: CanalTipo;
  estado: EstadoNivel;
  formula_latex: string;
  prerrequisito_id: string | null;
  orden_index: number;
  creado_at: string;
  
  // Joined fields for convenience in UI
  completado?: boolean;
  puntaje_energia?: number | null;
  analogia?: Analogia | null;
}

export interface Analogia {
  id: string;
  nivel_id: string;
  ruta_imagen: string;
  pregunta_texto: string;
  respuesta_correcta: string;
  respuestas_incorrectas: string[];
  creado_at: string;
}

export interface ProgresoUsuario {
  id: string;
  usuario_id: string;
  nivel_id: string;
  completado_at: string;
  puntaje_energia: number;
}
