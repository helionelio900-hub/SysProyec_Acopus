# Guion y Checklist de Capturas Oficiales — Sesión S11 LP2
**Proyecto:** SITRA-ORO | Módulo Mayorista y Acopio (Equipo 05)  
**Estudiante:** Faijo Calisaya Helio Paul (Código: 202110292)  
**Semestre:** 2026-2 (Ciclo IV) — Docente: Abel Angel Sullón Macalupú  

---

## 📌 Reglas Generales de Obligatorio Cumplimiento para Cada Captura

Cada captura de pantalla del informe debe cumplir sin excepción con lo establecido en la rúbrica (4.3 y 4.4):
1. **Pantalla Completa:** Ventana del navegador y sistema completa, **sin recortar bordes**.
2. **Reloj y Fecha del Sistema:** Barra de tareas de Windows visible en la parte inferior derecha, mostrando hora, minutos y fecha (`25/10/2026`).
3. **Identidad Visible:** Usuario de Windows, avatar de perfil o `preferred_username` en la cabecera de la SPA / Keycloak.
4. **Coherencia con GitHub:** Fechas de ejecución coincidentes con los commits del repositorio.

---

## 📋 Checklist Detallado de Capturas Requeridas (Nivel A — 20/20)

| N° | Nombre de Evidencia | URL y Entorno | Elementos Críticos que Deben Verse | Estado en Informe |
|:---:|:---|:---|:---|:---:|
| **1** | **Configuración PKCE en Keycloak** | `http://localhost:38081/admin/master/console/#/Sitra_oro/clients/...` | • Realm: `Sitra_oro`<br>• Cliente: `sitra-oro-frontend`<br>• *Standard flow*: **ON**<br>• *Direct access grants*: **OFF**<br>• *Require PKCE*: **ON (S256)**<br>• Banner verde: `Client successfully updated` | ✅ **Completada** |
| **2** | **Login Real Completado de Punta a Punta** | `http://localhost:4200/mayorista` | • URL: `/mayorista`<br>• Cabecera: `Mayorista Principal` / `Mayorista`<br>• Banner: `AUTENTICACIÓN REFORZADA: Keycloak - OIDC RS256`<br>• DevTools Consola: `[Mayorista] Resumen de liquidaciones cargado.` | ✅ **Completada** |
| **3** | **Guard Perimetral sin Sesión (Redirección)** | `http://localhost:38081/realms/Sitra_oro/protocol/openid-connect/auth?...` | • Intento inicial por URL a `/mayorista`<br>• Intercepción de `rolGuard`<br>• Redirección a la pantalla oficial de Keycloak con parámetros `client_id=sitra-oro-frontend&response_type=code` | ✅ **Completada** |
| **4** | **Violación RBAC (Redirección a /sin-acceso)** | `http://localhost:4200/sin-acceso` | • Usuario autenticado con rol `G2_ACOPIADOR`<br>• Intento de acceso a `/mayorista`<br>• Redirección controlada por `rolGuard` a `/sin-acceso`<br>• Mensaje en pantalla: *"Esta sección no corresponde a tu cuenta"* | ✅ **Completada** |
| **5** | **Consumo de API con Token Bearer (200 OK)** | `http://localhost:4200/mayorista/centros` (DevTools Red) | • Pestaña Network: `GET /api/v1/mayorista/centros-acopio`<br>• Estado: `200 OK`<br>• Cabeceras de petición: `Authorization: Bearer eyJhbGci...`<br>• Despliegue de los centros de acopio activos | ✅ **Completada** |
| **6** | **Interceptor: 401 Unauthorized y Auto-Refresco** | `http://localhost:4200` (DevTools Red - XHR) | • Petición inicial fallida: `GET colores` / `centros-acopio` con estado **401**<br>• Disparo automático: `POST /token` a Keycloak con estado **200 (fetch)**<br>• Reintento exitoso: `GET centros-acopio` con estado **200 OK** | ✅ **Completada** |
| **7** | **Menú Adaptativo por Rol (Acopiador)** | `http://localhost:4200/acopio` | • Usuario: `acopiador.demo1` visible en cabecera<br>• Rol: `Acopiador`<br>• Menú lateral exclusivo: *Resumen*, *Compras de oro*, *Mineros*, *Cuentas por aprobar*<br>• Módulos de mayorista ocultos | ✅ **Completada** |
| **8** | **Menú Adaptativo por Rol (Mayorista)** | `http://localhost:4200/mayorista` | • Usuario: `mayorista.demo1` visible en cabecera<br>• Rol: `Mayorista`<br>• Menú lateral exclusivo: *Resumen*, *Compra al acopiador*, *Liquidaciones*, *Lotes para exportación*, *Centros y cuentas* | ✅ **Completada** |
| **9** | **Pruebas Unitarias Automatizadas en Verde (10/10)** | Terminal PowerShell (`npm test`) | • Ejecución de Vitest: `✓ src/app/core/auth/auth.spec.ts (10 tests)`<br>• Tests de `generarPkce` (2/2)<br>• Tests de `rolGuard` (3/3: sin sesión, rol incorrecto, rol correcto)<br>• Tests de `authInterceptor` (5/5: Bearer, 401 refresh, refresh fallido, 403 sin refresh, refresh compartido único) | ✅ **Completada** |

---

## 🔒 Parámetros de Expiración de Credenciales

- **Entorno de Demostración (Laboratorio / Video / Defensa):** `tokenLifespanDemoSeconds = 30` (30 segundos para evidenciar el error 401 y el POST de refresco en la pestaña Network sin tiempos muertos).
- **Entorno de Producción / Staging:** `tokenLifespanSeconds = 300` (300 segundos = 5 minutos, estándar de tokens efímeros OIDC en alta seguridad).

---

## 💡 Mecanismo de Recarga de Página (F5) sin localStorage

1. **Tokens estrictamente en memoria:** Ni `accessToken` ni `refreshToken` se guardan en `localStorage` o `sessionStorage`.
2. **Efecto de presionar F5:** La memoria volátil de Angular Signals se vacía (`token = null`).
3. **Recuperación transparente:** Al evaluar la ruta protegida, `rolGuard` detecta la ausencia de sesión en memoria y activa `auth.iniciarLogin(state.url)`.
4. **Cookie SSO de Keycloak:** Como el navegador mantiene la cookie de sesión HttpOnly de Keycloak (`KEYCLOAK_SESSION`), Keycloak emite un nuevo `authorization_code` de forma transparente sin pedir contraseña de nuevo, regresando a `/auth/callback` y restaurando los tokens en memoria en la URL original.
