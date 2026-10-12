import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { NumeroClaroPipe } from '../../core/numero-claro.pipe';
import { environment } from '../../../environments/environment';
interface Registro { ID_REGISTRO: number; FECHA: string; PESO_TOTAL: number; LECTURA: number; FUNDIDO: number | null; FILAS: {NUMERO:number; PESO:number; LEY:number}[] }
@Component({
 selector:'app-registro-ponderacion', imports:[FormsModule,NumeroClaroPipe,A11yModule],
 template:`
 <section class="panel">
 <header><h2>Registro independiente de otros oros</h2><button type="button" (click)="nuevo()" [disabled]="guardando()">Nuevo registro de ponderación</button></header>
 @if (abierto()) {
   <p>N.º de registro: {{ numero() ?? 'Se asigna al guardar' }}</p>
   <div class="scroll"><table><thead><tr><th>Partida</th><th>Peso (g)</th><th>Ley (%)</th><th>Lectura decimal</th><th></th></tr></thead><tbody>
   @for (fila of filas(); track $index; let i=$index) {
     <tr><td>{{ i+1 }}</td><td><input type="number" min="0.001" step="0.001" [disabled]="guardando() || (numero() !== null && !editando())" [ngModel]="fila.peso" (ngModelChange)="editar(i,'peso',$event)" [attr.aria-label]="'Peso partida '+(i+1)" /></td>
     <td><input type="number" min="0.0001" max="100" step="0.0001" [disabled]="guardando() || (numero() !== null && !editando())" [ngModel]="fila.ley" (ngModelChange)="editar(i,'ley',$event)" [attr.aria-label]="'Ley partida '+(i+1)" /></td>
     <td>{{ fila.ley / 100 | numeroClaro:'1.0-6' }}</td><td><button type="button" (click)="quitar(i)" [disabled]="filas().length === 1 || guardando() || (numero() !== null && !editando())">Quitar</button></td></tr>
   }</tbody></table></div>
   <button type="button" (click)="agregar()" [disabled]="filas().length >= 200 || guardando() || (numero() !== null && !editando())">+ Añadir partida</button>
   <div class="results"><div>Total peso bruto<strong>{{ resumen().peso | numeroClaro:'1.0-3' }} g</strong></div><div>Lectura promedio bruto<strong>{{ resumen().lectura | numeroClaro:'1.0-7' }}</strong></div>
   <div><label>Fundido (g)<input type="number" min="0" step="0.001" [disabled]="guardando() || (numero() !== null && !editando())" [ngModel]="fundido()" (ngModelChange)="fundido.set($event)" /></label></div><div>Merma<strong>{{ merma() | numeroClaro:'1.0-3' }} g</strong></div></div>
   <p role="status">{{ mensaje() }}</p>
   <button type="button" (click)="guardar()" [disabled]="!valido() || guardando() || (numero() !== null && !editando())">{{ guardando() ? 'Guardando…' : editando() ? 'Guardar cambios' : 'Guardar registro' }}</button>
   <button type="button" (click)="imprimir()" [disabled]="!valido()">Imprimir promedio total bruto</button>
 }
 <section class="registro-management"><header><div><span class="management-kicker">REGISTROS INDEPENDIENTES</span><h3>Gestión de ponderaciones</h3></div><span class="management-count">{{ registros().length }} registros</span></header>
 @if (registros().length) {
 <div class="scroll"><table class="management-table"><thead><tr><th>Registro</th><th>Fecha</th><th>Peso bruto</th><th>Lectura promedio</th><th>Acciones</th></tr></thead><tbody>
 @for (r of registros(); track r.ID_REGISTRO) {
   <tr><td><button class="registro-link" type="button" [disabled]="guardando()" (click)="abrir(r)">#{{r.ID_REGISTRO}}</button></td><td>{{r.FECHA}}</td><td>{{r.PESO_TOTAL | numeroClaro:'1.0-3'}} g</td><td>{{r.LECTURA | numeroClaro:'1.0-7'}}</td>
   <td class="row-actions"><button type="button" [disabled]="guardando()" (click)="editarRegistro(r)">Editar</button><button class="danger-button" type="button" [disabled]="guardando()" (click)="eliminarPendiente.set(r)">Eliminar</button></td></tr>
 }</tbody></table></div>
 } @else { <div class="empty-register"><h4>Todavía no hay registros</h4><p>Crea una ponderación con los pesos y leyes que recibas.</p><button type="button" (click)="nuevo()">Nuevo registro</button></div> }
 </section>
 @if (eliminarPendiente(); as registro) {
   <div class="modal-backdrop"><section class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-weight-title" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" (keydown.escape)="!guardando() && eliminarPendiente.set(null)">
     <span class="modal-kicker">ELIMINAR REGISTRO</span><h2 id="delete-weight-title">¿Eliminar la ponderación #{{registro.ID_REGISTRO}}?</h2><p>Se eliminarán este registro y sus partidas. Esta acción no se puede deshacer.</p>
     <div class="modal-actions"><button type="button" cdkFocusInitial [disabled]="guardando()" (click)="eliminarPendiente.set(null)">Cancelar</button><button class="danger-button" type="button" [disabled]="guardando()" (click)="eliminarRegistro(registro)">{{guardando() ? 'Eliminando…' : 'Eliminar registro'}}</button></div>
   </section></div>
 }
 </section>`,
 styleUrl:'./registro-ponderacion.css',
 styles:`.registro-management{margin-top:1.8rem;padding:1.2rem;border:1px solid #bdd2ec;border-left:4px solid #143550;border-radius:10px;background:#f5f8fc}.management-kicker{font-size:.65rem;font-weight:800;letter-spacing:.1em;color:#966800}.management-count{padding:.4rem .7rem;border-radius:20px;background:#dce8f6;font-size:.8rem}.saved-row{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;padding:.7rem 0;border-top:1px solid #d7e2f2}.saved-row .saved{flex:1;text-align:left;min-width:220px;background:white;border-color:#cddcf0}.panel{margin-top:1rem;padding:1.2rem;border:1px solid #d7e2f2;border-radius:12px;background:white}header{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}h2{font-size:1.1rem}.scroll{overflow:auto}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{padding:.7rem;text-align:left;border-bottom:1px solid #d7e2f2}input{padding:.5rem;border:1px solid #cddcf0;border-radius:6px;max-width:150px;font:inherit}button{padding:.65rem;margin:.3rem;border:1px solid #d0af54;border-radius:6px;background:#fff8e6;color:#4e3b12;cursor:pointer;font:inherit}button:disabled{opacity:.5}.results{display:grid;grid-template-columns:1fr 1fr;gap:1rem;background:#fff8e6;padding:1rem;margin-top:1rem}strong{display:block;margin-top:.4rem;font-size:1.3rem}.saved{display:block}@media print{button,header,h3,.saved{display:none}}`,
})
export class RegistroPonderacion {
 private readonly http=inject(HttpClient);
 private readonly url=environment.apiBaseUrl+'/api/v1/mayorista/ponderaciones';
 protected readonly abierto=signal(false);
 protected readonly filas=signal([{peso:0,ley:0}]);
 protected readonly fundido=signal<number|null>(null);
 protected readonly guardando=signal(false);
 protected readonly numero=signal<number|null>(null);
 protected readonly editando=signal(false);
 protected readonly mensaje=signal('');
 protected readonly registros=signal<Registro[]>([]);
 protected readonly eliminarPendiente=signal<Registro|null>(null);
 protected readonly resumen=computed(()=>{const filas=this.filas();const peso=filas.reduce((s,f)=>s+Math.round(f.peso*1000),0)/1000;return {peso,lectura:peso>0?filas.reduce((s,f)=>s+f.peso*f.ley/100,0)/peso:0};});
 protected readonly valido=computed(()=>this.filas().every(f=>Number.isFinite(f.peso)&&f.peso>0&&f.peso<=9999999.999&&Math.abs(f.peso*1000-Math.round(f.peso*1000))<0.00001&&Number.isFinite(f.ley)&&f.ley>0&&f.ley<=100&&Math.abs(f.ley*10000-Math.round(f.ley*10000))<0.00001)&&(this.fundido()===null||(Number.isFinite(this.fundido())&&this.fundido()!>=0&&this.fundido()!<=this.resumen().peso&&Math.abs(this.fundido()!*1000-Math.round(this.fundido()!*1000))<0.00001)));
 protected readonly merma=computed(()=>this.fundido()===null?0:Math.round((this.resumen().peso-this.fundido()!)*1000)/1000);
 constructor(){this.cargar();}
 private cargar(){this.http.get<Registro[]>(this.url).subscribe({next:r=>this.registros.set(r),error:()=>this.mensaje.set('No se pudieron cargar los registros de ponderación.')});}
 protected nuevo(){this.editando.set(false);this.numero.set(null);this.filas.set([{peso:0,ley:0}]);this.fundido.set(null);this.mensaje.set('');this.abierto.set(true);}
 protected editar(i:number,campo:'peso'|'ley',valor:number){this.filas.update(f=>f.map((p,n)=>n===i?{...p,[campo]:valor}:p));}
 protected agregar(){if(this.filas().length<200)this.filas.update(f=>[...f,{peso:0,ley:0}]);}
 protected quitar(i:number){if(this.filas().length>1)this.filas.update(f=>f.filter((_,n)=>n!==i));}
 protected abrir(r:Registro){this.editando.set(false);this.numero.set(r.ID_REGISTRO);this.filas.set(r.FILAS.map(f=>({peso:f.PESO,ley:f.LEY})));this.fundido.set(r.FUNDIDO);this.abierto.set(true);this.mensaje.set('Registro guardado. Puedes imprimirlo.');}
 protected editarRegistro(r:Registro){this.abrir(r);this.editando.set(true);this.mensaje.set('Edita las partidas y pulsa Guardar cambios.');}
 protected eliminarRegistro(r:Registro){
   if(this.guardando())return;
   this.guardando.set(true);
   this.http.delete(this.url+'/'+r.ID_REGISTRO).subscribe({next:()=>{this.guardando.set(false);this.eliminarPendiente.set(null);if(this.numero()===r.ID_REGISTRO){this.nuevo();this.abierto.set(false);}this.mensaje.set('Registro eliminado.');this.cargar();},error:()=>{this.guardando.set(false);this.mensaje.set('No se pudo eliminar el registro. Intenta nuevamente.');}});
 }
 protected guardar(){
   if(!this.valido()||this.guardando()||(this.numero()!==null&&!this.editando()))return;
   this.guardando.set(true);
   const datos={filas:this.filas(),fundido:this.fundido()};
   const solicitud=this.editando()?this.http.put<Registro>(this.url+'/'+this.numero(),datos):this.http.post<Registro>(this.url,datos);
   solicitud.subscribe({next:r=>{this.guardando.set(false);this.abrir(r);this.cargar();},error:()=>{this.guardando.set(false);this.mensaje.set('No se pudo guardar. Revisa pesos y leyes e intenta nuevamente.');}});
 }
 protected imprimir(){
   if(!this.valido())return;
   const ventana=window.open('','_blank','width=900,height=700');
   if(!ventana){this.mensaje.set('Permite la ventana de impresión en tu navegador.');return;}
   const doc=ventana.document;
   doc.title='SITRA-ORO · Registro de ponderación';
   const estilo=doc.createElement('style');estilo.textContent='body{font-family:Arial,sans-serif;padding:30px;color:#142c44}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #ccc;text-align:left}h1{font-size:22px}';doc.head.append(estilo);
   const texto=(tag:string,valor:string)=>{const nodo=doc.createElement(tag);nodo.textContent=valor;return nodo;};
   const formato=(valor:number,max=7)=>new Intl.NumberFormat('en-US',{useGrouping:false,maximumFractionDigits:max}).format(valor);
   doc.body.append(texto('h1','SITRA-ORO · Ponderación'),texto('p',this.numero()===null?'Registro sin guardar':'Registro #'+this.numero()));
   const tabla=doc.createElement('table');const cabecera=doc.createElement('tr');
   for(const titulo of ['Partida','Peso (g)','Lectura decimal'])cabecera.append(texto('th',titulo));tabla.append(cabecera);
   this.filas().forEach((fila,i)=>{const tr=doc.createElement('tr');for(const valor of [String(i+1),formato(fila.peso,3),formato(fila.ley/100,6)])tr.append(texto('td',valor));tabla.append(tr);});doc.body.append(tabla);
   doc.body.append(texto('p','Total peso bruto: '+formato(this.resumen().peso,3)+' g'),texto('p','Lectura promedio bruto: '+formato(this.resumen().lectura)),texto('p','Fundido: '+(this.fundido()===null?'Sin registrar':formato(this.fundido()!,3)+' g')),texto('p','Merma: '+formato(this.merma(),3)+' g'));
   ventana.focus();ventana.print();
 }
}
