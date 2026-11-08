import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

/** Fenómeno que el inicio dibuja sobre la foto. */
export type TipoClima = 'despejado' | 'nublado' | 'niebla' | 'llovizna' | 'lluvia' | 'nieve' | 'granizo' | 'tormenta';

export interface Clima {
  tipo: TipoClima;
  descripcion: string;
  temperatura: number | null;
  esDia: boolean;
  lugar: string;
  /** 'gps' cuando viene de la ubicación del minero; 'referencia' cuando se usa La Rinconada. */
  fuente: 'gps' | 'referencia' | 'demo';
}

interface RespuestaOpenMeteo {
  current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
}

/** Localidades mineras y ciudades de Puno para nombrar la ubicación sin enviar datos a terceros. */
const LUGARES = [
  { nombre: 'La Rinconada', lat: -14.6297, lon: -69.4467 },
  { nombre: 'Ananea', lat: -14.6789, lon: -69.5339 },
  { nombre: 'Cojata', lat: -15.0167, lon: -69.3667 },
  { nombre: 'Putina', lat: -14.9136, lon: -69.8683 },
  { nombre: 'Crucero', lat: -14.3628, lon: -70.0244 },
  { nombre: 'Sandia', lat: -14.3236, lon: -69.4669 },
  { nombre: 'Azángaro', lat: -14.9083, lon: -70.1964 },
  { nombre: 'Juliaca', lat: -15.4997, lon: -70.1333 },
  { nombre: 'Puno', lat: -15.8402, lon: -70.0219 },
];
const REFERENCIA = LUGARES[0];
const REFRESCO_MS = 15 * 60 * 1000;

/** Códigos WMO que devuelve Open-Meteo. */
function interpretar(codigo: number): { tipo: TipoClima; descripcion: string } {
  if (codigo === 0) return { tipo: 'despejado', descripcion: 'Despejado' };
  if (codigo <= 2) return { tipo: 'nublado', descripcion: 'Parcialmente nublado' };
  if (codigo === 3) return { tipo: 'nublado', descripcion: 'Nublado' };
  if (codigo === 45 || codigo === 48) return { tipo: 'niebla', descripcion: 'Neblina' };
  if (codigo >= 51 && codigo <= 57) return { tipo: 'llovizna', descripcion: 'Llovizna' };
  if (codigo === 66 || codigo === 67) return { tipo: 'granizo', descripcion: 'Lluvia helada' };
  if ((codigo >= 61 && codigo <= 65) || (codigo >= 80 && codigo <= 82)) return { tipo: 'lluvia', descripcion: 'Lluvia' };
  if (codigo === 77) return { tipo: 'granizo', descripcion: 'Granizo fino' };
  if ((codigo >= 71 && codigo <= 75) || codigo === 85 || codigo === 86) return { tipo: 'nieve', descripcion: 'Nevando' };
  if (codigo === 96 || codigo === 99) return { tipo: 'granizo', descripcion: 'Tormenta con granizo' };
  if (codigo === 95) return { tipo: 'tormenta', descripcion: 'Tormenta eléctrica' };
  return { tipo: 'nublado', descripcion: 'Nublado' };
}

function distanciaKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function nombrarLugar(lat: number, lon: number): string {
  const cercano = LUGARES
    .map((l) => ({ ...l, km: distanciaKm(lat, lon, l.lat, l.lon) }))
    .sort((a, b) => a.km - b.km)[0];
  if (cercano.km <= 12) return cercano.nombre;
  if (cercano.km <= 60) return `Cerca de ${cercano.nombre}`;
  return 'Tu ubicación';
}

/**
 * Clima real del lugar del minero (Open-Meteo, gratuito y sin clave).
 * Usa el GPS solo si el minero ya dio permiso o pulsa "Usar mi ubicación"; si no, La Rinconada.
 */
@Injectable({ providedIn: 'root' })
export class ClimaService {
  private readonly http = inject(HttpClient);
  private temporizador: ReturnType<typeof setInterval> | null = null;
  private coordenadas = { lat: REFERENCIA.lat, lon: REFERENCIA.lon, lugar: REFERENCIA.nombre, fuente: 'referencia' as Clima['fuente'] };

  readonly clima = signal<Clima | null>(null);
  readonly buscandoUbicacion = signal(false);
  readonly avisoUbicacion = signal('');
  readonly usaGps = computed(() => this.clima()?.fuente === 'gps');
  readonly gpsDisponible = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  /** Arranca el clima. `demo` (por ejemplo ?clima=nieve&hora=noche) fuerza un escenario para presentaciones. */
  iniciar(demo?: { tipo?: string | null; hora?: string | null }): void {
    if (demo?.tipo) {
      const tipo = demo.tipo as TipoClima;
      const descripciones: Record<TipoClima, string> = {
        despejado: 'Despejado', nublado: 'Nublado', niebla: 'Neblina', llovizna: 'Llovizna',
        lluvia: 'Lluvia', nieve: 'Nevando', granizo: 'Granizo', tormenta: 'Tormenta eléctrica',
      };
      if (tipo in descripciones) {
        this.clima.set({ tipo, descripcion: descripciones[tipo], temperatura: tipo === 'nieve' ? -4 : 3,
          esDia: demo.hora !== 'noche', lugar: REFERENCIA.nombre, fuente: 'demo' });
        return;
      }
    }
    this.consultar();
    if (!this.temporizador) this.temporizador = setInterval(() => this.consultar(), REFRESCO_MS);
    // Si el minero ya autorizó la ubicación antes, se usa sin volver a preguntar.
    const permisos = (navigator as Navigator & { permissions?: Permissions }).permissions;
    permisos?.query({ name: 'geolocation' as PermissionName })
      .then((estado) => { if (estado.state === 'granted') this.usarMiUbicacion(); })
      .catch(() => undefined);
  }

  detener(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = null;
  }

  usarMiUbicacion(): void {
    if (!this.gpsDisponible || this.buscandoUbicacion()) return;
    this.buscandoUbicacion.set(true);
    this.avisoUbicacion.set('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.coordenadas = { lat: coords.latitude, lon: coords.longitude,
          lugar: nombrarLugar(coords.latitude, coords.longitude), fuente: 'gps' };
        this.buscandoUbicacion.set(false);
        this.consultar();
      },
      (error) => {
        this.buscandoUbicacion.set(false);
        this.avisoUbicacion.set(error.code === error.PERMISSION_DENIED
          ? 'Sin permiso de ubicación: mostramos el clima de La Rinconada.'
          : 'No pudimos ubicarte: mostramos el clima de La Rinconada.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  }

  private consultar(): void {
    const { lat, lon, lugar, fuente } = this.coordenadas;
    const url = 'https://api.open-meteo.com/v1/forecast';
    this.http.get<RespuestaOpenMeteo>(url, {
      params: { latitude: lat.toFixed(4), longitude: lon.toFixed(4),
        current: 'temperature_2m,weather_code,is_day', timezone: 'auto' },
    }).subscribe({
      next: (r) => {
        const actual = r.current;
        if (!actual || actual.weather_code === undefined) return;
        const { tipo, descripcion } = interpretar(actual.weather_code);
        this.clima.set({ tipo, descripcion, temperatura: actual.temperature_2m ?? null,
          esDia: actual.is_day !== 0, lugar, fuente });
      },
      // Sin conexión o API caída: el inicio se queda con la foto, sin efectos.
      error: () => undefined,
    });
  }
}
