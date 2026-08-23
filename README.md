# BOM ERP - Acopio de Oro (`bomerp-acopio-oro`)

**Sistema de Control, Acopio y Liquidación de Oro**

BOM ERP (`bomerp-acopio-oro`) es el proyecto integrador del grupo para gestionar la trazabilidad, cotización y liquidación financiera en el proceso de acopio de oro.

El proyecto articula la línea curricular:

```text
ADS -> BD2 -> LP2
```

## Alcance del Proyecto: 5 Módulos (`bomerp-acopio-oro`)

```text
BOM ERP - Acopio de Oro (5 Módulos)
|
|-- 🔐 [Módulo 1: SEGURIDAD]
|   `-- Autenticación JWT, Encriptación BCrypt y Roles RBAC (Minero, G2, G1)
|
|-- 🔄 [Módulos TRANSACCIONALES - 2 Módulos]
|   |-- Módulo 2 (Transaccional 1): Acopio y Compras Directas G2 (Fundición, Rojo/Verde, Pagos)
|   `-- Módulo 3 (Transaccional 2): Liquidaciones Mayoristas G1 (Cierre Semanal, Onza USD / T.C.)
|
`-- ℹ️ [Módulos NO TRANSACCIONALES - 2 Módulos]
    |-- Módulo 4 (No Transaccional 1): Cotizador Estimativo Minero (Consulta pública y bajada/merma)
    `-- Módulo 5 (No Transaccional 2): Parámetros, Maestros y Dashboard (Precios, Mineros, Analítica)
```

## Estructura del Repositorio del Grupo

```text
bomerp-acopio-oro/
|-- ads/     - Entregables e informe de requerimientos (ADS)
|-- bd2/     - Scripts SQL DDL de la base Oracle BOM_ACOPIO (BD2)
|-- lp2/     - Backend Java Spring Boot y Frontend SPA (LP2)
|-- docs/    - Documentación MkDocs (ADS, BD2, LP2)
`-- README.md - Onboarding del proyecto del grupo
```
