import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { environment } from '../../../environments/environment';
import { RecepcionLey } from '../../core/api/operaciones.service';
interface Reporte { operaciones:number; partidas:number; pesoFundidoG:number; subtotal:number; adelanto:number; total:number; items:RecepcionLey[] }
@Component({
 selector:'app-reporte-compras-mayorista', imports:[FormsModule,NumeroClaroPipe],
 template:`<section class="panel">
 <h2>Reporte de compras del mayorista</h2><p>Consulta pesos e importes registrados por fecha.</p>
 <form (ngSubmit)="consultar()" class="filters"><label>Desde<input type="date" name="desde" [(ngModel)]="desde" /></label><label>Hasta<input type="date" name="hasta" [(ngModel)]="hasta" /></label><button type="submit" [disabled]="cargando()">{{cargando() ? 'Consultando…' : 'Consultar reporte'}}</button></form>
 @if(error()){<p class="error" role="alert">{{error()}}</p>}
 @if(reporte();as datos){
 <div class="cards" aria-live="polite"><div>Operaciones<strong>{{datos.operaciones}}</strong><small>{{datos.partidas}} partidas</small></div><div>Peso fundido<strong>{{datos.pesoFundidoG | numeroClaro:'1.0-3'}} g</strong></div><div>Material registrado<strong>S/ {{datos.subtotal | numeroClaro:'1.2-2'}}</strong></div><div>Adelantos<strong>S/ {{datos.adelanto | numeroClaro:'1.2-2'}}</strong></div><div>Total registrado<strong>S/ {{datos.total | numeroClaro:'1.2-2'}}</strong></div></div>
 <div class="scroll"><table><thead><tr><th>Operación</th><th>Fecha</th><th>Origen</th><th>Partidas</th><th>Peso fundido</th><th>Total registrado</th></tr></thead><tbody>
 @for(item of datos.items;track item.idRecepcion){<tr><td>#{{item.idRecepcion}}</td><td>{{item.fecha}}</td><td>{{item.nombreAcopiador}}</td><td>{{item.detalles.length}}</td><td>{{item.pesoFundidoG | numeroClaro:'1.0-3'}} g</td><td>S/ {{item.total | numeroClaro:'1.2-2'}}</td></tr>} @empty{<tr><td colspan="6">No hay compras registradas en ese rango.</td></tr>}
 </tbody></table></div>}
 </section>`,
 styles:`.panel{padding:24px;margin-top:1rem;background:white;border:1px solid #d7e2f2;border-radius:12px;color:#143550}h2{font-size:1.2rem}p,small{font-size:.8rem;color:#63748a}.filters{display:flex;align-items:end;gap:1rem;flex-wrap:wrap;margin:1.2rem 0}.filters label{display:grid;gap:.4rem;font-size:.8rem;flex:1;min-width:160px}input,button{padding:.65rem;border:1px solid #cddcf0;border-radius:6px;min-height:44px;font:inherit}button{background:#d6a019;color:#211b0c;cursor:pointer;font-size:.8rem;font-weight:700}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.8rem;margin-bottom:1.5rem}.cards div{padding:1rem;border:1px solid #d7e2f2;border-radius:8px;background:#f7f9fc;font-size:.75rem}strong{display:block;font-size:1.15rem;margin:.5rem 0}.scroll{overflow:auto}table{width:100%;border-collapse:collapse;font-size:.8rem}th,td{padding:.8rem;text-align:left;border-bottom:1px solid #d7e2f2}th{background:#f5f8fc;white-space:nowrap}.error{color:#b42318;background:#fff0ef;padding:.8rem}input:focus-visible,button:focus-visible{outline:3px solid #b98712;outline-offset:2px}`,
})
export class ReporteComprasMayorista {
 private readonly http=inject(HttpClient);
 protected desde=''; protected hasta='';
 protected readonly reporte=signal<Reporte|null>(null);
 protected readonly cargando=signal(false);
 protected readonly error=signal('');
 constructor(){this.consultar();}
 protected consultar():void {
   if(this.cargando())return;
   if(this.desde && this.hasta && this.desde>this.hasta){this.error.set('Desde debe ser anterior o igual a Hasta.');return;}
   let params=new HttpParams();if(this.desde)params=params.set('desde',this.desde);if(this.hasta)params=params.set('hasta',this.hasta);
   this.cargando.set(true);this.error.set('');this.reporte.set(null);
   this.http.get<Reporte>(environment.apiBaseUrl+'/api/v1/mayorista/recepciones-ley/resumen',{params}).subscribe({next:datos=>{this.reporte.set(datos);this.cargando.set(false);},error:()=>{this.error.set('No se pudo consultar el reporte. Revisa la sesión y vuelve a intentarlo.');this.cargando.set(false);}});
 }
}
