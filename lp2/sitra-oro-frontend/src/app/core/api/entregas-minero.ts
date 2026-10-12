export interface EntregaMinero {
  ID_SOLICITUD: number;
  ID_MINERO: number;
  ID_COMPRA_G2: number | null;
  ESTADO: string;
  CENTRO: string;
  NOMBRES_APELLIDOS: string;
  PARTIDAS: { NUMERO: number; COLOR: string; PESO_CRUDO: number; PESO_ESTIMADO: number }[];
}
