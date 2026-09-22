export interface Minero { idMinero: number; documentoIdentidad: string; nombresApellidos: string; telefono?: string | null; zonaProcedencia?: string | null; fechaRegistro: string; }
export interface MineroRequest { documentoIdentidad: string; nombresApellidos: string; telefono?: string; zonaProcedencia?: string; }
