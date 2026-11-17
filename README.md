# SITRA-ORO (`sitra-oro`)

**Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro**  
*Universidad Peruana Unión (UPeU 2026) · Quilate Bullion S.A.C.*  
*Autor: **Faijo Calisaya Helio Paul** · Docente: **Mg. Nélida Huamán Paco***

---

## 🎥 Catálogo Multimedia Oficial de SITRA-ORO

El proyecto cuenta con dos producciones audiovisuales oficiales de alta definición (1080p):

### 1. 🚀 Video Pitch Oficial del Proyecto (Subtitulado · 1m 32s)
> **Presentación ejecutiva, propuesta de valor y modelo de negocio de SITRA-ORO.**  
> Duración: **1m 32s** · Resolución: **1920×1080 Full HD** · Subtítulos sincronizados integrados.  
> 🎬 **[▶️ REPRODUCIR PITCH ONLINE (Streaming)](https://helionelio900-hub.github.io/SysProyec_Acopus/pitch/)** · 🔗 **[Ver en Repositorio Git](https://github.com/helionelio900-hub/SysProyec_Acopus/blob/feat/s14-mayorista-dashboard-adelantos/docs/video/SITRA_ORO_VIDEO_SUBTITULADO.mp4)** · ⬇️ **[Descargar MP4 (18.3 MB)](https://helionelio900-hub.github.io/SysProyec_Acopus/manual/video/SITRA_ORO_VIDEO_SUBTITULADO.mp4)**

---

### 2. 🎬 Video Manual de Usuario y Recorrido del Sistema (15 Pasos · 4m 28s)
> **Recorrido técnico exhaustivo por los 15 pasos del software con voz clonada del autor Helio Paul Calisaya.**  
> Duración: **4m 28s** (8,040 frames) · Resolución: **1920×1080 (16:9 Widescreen)** · Audio: **AAC Stereo 48 kHz**  
> 🎬 **[▶️ REPRODUCIR MANUAL ONLINE (Web Player 1080p)](https://helionelio900-hub.github.io/SysProyec_Acopus/video/)** · 🔗 **[Ver en Repositorio Git](https://github.com/helionelio900-hub/SysProyec_Acopus/blob/feat/s14-mayorista-dashboard-adelantos/docs/video/SITRA-ORO_Pitch_Master_Oficial_Helio.mp4)** · ⬇️ **[Descargar MP4 (31.2 MB)](https://helionelio900-hub.github.io/SysProyec_Acopus/manual/video/SITRA-ORO_Pitch_Master_Oficial_Helio.mp4)**

<p align="center">
  <a href="https://helionelio900-hub.github.io/SysProyec_Acopus/video/" target="_blank">
    <img src="docs/video/poster_video_pitch.png" alt="SITRA-ORO Video Manual y Pitch Oficial" width="850" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  </a>
  <br>
  <em>Haz clic sobre la imagen para abrir el reproductor web interactivo en vivo.</em>
</p>

---

## 📖 Manual de Usuario y Documentación Técnica

- 🌐 **[Acceder al Manual Web Interactivo con Video Embebido](https://helionelio900-hub.github.io/SysProyec_Acopus/manual/)**  
  Portal web responsivo con reproductor HTML5 integrado, catálogo de módulos y guía rápida de operación.
- 📄 **[Descargar Manual de Usuario Profesional en PDF (32 Páginas A4)](https://helionelio900-hub.github.io/SysProyec_Acopus/manual/SITRA-ORO_Manual_de_Usuario_Profesional.pdf)**  
  Documento normativo con capturas reales de la interfaz Angular, tablas de elementos operacionales, reglas de metrología y actas de conformidad firmadas.

---

**SITRA-ORO** (`sitra-oro`) es el proyecto integrador del grupo para gestionar la trazabilidad, cotización y liquidación financiera en el proceso de acopio de oro artesanal.

El proyecto articula la línea curricular:

```text
ADS -> BD2 -> LP2
```

## Alcance del Proyecto: 5 Módulos conceptuales (`sitra-oro`)

**Estado en la Unidad I (S1-S6):** 4 módulos implementados y verificados con Spring
Modulith (`ModularityTests`). El módulo de Seguridad es parte del diseño desde el
brief, pero su implementación real con JWT + BCrypt + RBAC corresponde a **S10 (U2)**;
hoy no existe endpoint de login funcional.

```text
SITRA-ORO - Acopio de Oro (5 Módulos conceptuales)
|
|-- 🔐 [Módulo 1: SEGURIDAD] -- diseñado en el brief, implementación JWT en S10 (U2)
|   `-- Autenticación JWT, Encriptación BCrypt y Roles RBAC (Minero, G2, G1)
|
|-- 🔄 [Módulos TRANSACCIONALES - 2 Módulos] -- implementados en U1
|   |-- Módulo 2 (Transaccional 1): Acopio y Compras Directas G2 (Fundición, Rojo/Verde, Pagos)
|   `-- Módulo 3 (Transaccional 2): Liquidaciones Mayoristas G1 (Cierre Semanal, Onza USD / T.C.)
|
`-- ℹ️ [Módulos NO TRANSACCIONALES - 2 Módulos] -- implementados en U1
    |-- Módulo 4 (No Transaccional 1): Cotizador Estimativo Minero (Consulta pública y bajada/merma)
    `-- Módulo 5 (No Transaccional 2): Parámetros, Maestros y Dashboard (Precios, Mineros, Analítica)
```

## Estructura del Repositorio del Grupo

```text
sitra-oro/
|-- ads/     - Entregables e informe de requerimientos y diseño (ADS)
|-- bd2/     - Scripts SQL DDL de la base Oracle SITRA_ACOPIO (BD2)
|-- lp2/     - Backend Java Spring Boot y Frontend SPA (LP2)
|-- docs/    - Documentación e informes de sesiones (ADS, BD2, LP2)
`-- README.md - Onboarding del proyecto del grupo
```
