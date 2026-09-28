import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sin-acceso',
  imports: [RouterLink, MatButtonModule],
  template: `<main class="workspace" style="max-width:680px;padding:4rem 1rem">
    <span class="eyebrow">ACCESO RESTRINGIDO</span>
    <h1>Esta sección no corresponde a tu cuenta</h1>
    <p>Inicia sesión con una cuenta autorizada para continuar.</p>
    <a mat-flat-button class="button-primary" routerLink="/ingresar">Volver al inicio de sesión</a>
  </main>`,
})
export class SinAcceso {}
