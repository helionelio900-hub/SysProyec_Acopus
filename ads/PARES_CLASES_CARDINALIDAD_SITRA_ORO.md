# SITRA-ORO · Análisis de Relaciones y Cardinalidades Binarias entre Clases
**Curso:** Análisis y Diseño de Sistemas (ADS)  
**Formato:** Pares de Clases con Lectura Bidireccional de Cardinalidades (Metodología del Docente)

---

## Par 1: `CuentaAcceso` ➔ `Rol` (Asociación Simple)

```mermaid
classDiagram
    direction LR

    class CuentaAcceso {
        -idCuenta: Long
        -documentoIdentidad: String
        -claveHash: String
        -activo: boolean
        +autenticar(): boolean
        +cambiarClave(): void
    }

    class Rol {
        -idRol: String
        -nombre: String
        -descripcion: String
        +asignarPermiso(): void
    }

    CuentaAcceso "0..*" --> "1" Rol : tiene
```

* **cuenta a rol:** Una cuenta de usuario debe pertenecer obligatoriamente a un solo rol (`MINERO`, `G2_ACOPIADOR` o `G1_MAYORISTA`).
* **rol a cuenta:** Un rol puede estar asignado a varios usuarios registrados en el sistema.

---

## Par 2: `Minero` ➔ `TransaccionG2` (Asociación Uno a Muchos)

```mermaid
classDiagram
    direction LR

    class Minero {
        -idMinero: Long
        -documentoIdentidad: String
        -nombresApellidos: String
        -telefono: String
        -zonaProcedencia: String
        +registrarMinero(): void
        +actualizarDatos(): void
    }

    class TransaccionG2 {
        -idTransaccionG2: Long
        -pesoSinFundirG: BigDecimal
        -pesoFundidoNetoG: BigDecimal
        -tipoOro: String
        -precioAplicadoPen: BigDecimal
        -totalPagadoPen: BigDecimal
        +registrarPesaje(): void
        +calcularPago(): void
    }

    Minero "1" --> "0..*" TransaccionG2 : realiza
```

* **minero a transaccion:** Un minero puede realizar de cero a muchas compras/ventas de oro en el centro de acopio.
* **transaccion a minero:** Una transacción de compra debe pertenecer obligatoriamente a un solo minero identificado.

---

## Par 3: `LiquidacionG1` ➔ `DetalleLiquidacionG1` (Composición Fuerte)

```mermaid
classDiagram
    direction LR

    class LiquidacionG1 {
        -idLiquidacionG1: Long
        -nombreAcopiadorG2: String
        -fechaLiquidacion: LocalDateTime
        -estado: EstadoLiquidacion
        -totalPagadoG2Pen: BigDecimal
        +procesarCierre(): void
        +anular(): void
    }

    class DetalleLiquidacionG1 {
        -idDetalle: Long
        -tipoOro: String
        -pesoFundidoG: BigDecimal
        -precioGramoPen: BigDecimal
        -subtotalPen: BigDecimal
        +calcularSubtotal(): void
    }

    LiquidacionG1 "1" *-- "1..2" DetalleLiquidacionG1 : compone
```

* **liquidacion a detalle:** Una liquidación mayorista contiene de 1 a 2 detalles consolidados (uno para oro ROJO y/o uno para oro VERDE).
* **detalle a liquidacion:** Un detalle de liquidación pertenece exclusivamente a una sola liquidación cabecera y no puede existir sin ella.

---

## Par 4: `CentroAcopio` ➔ `ZonaAcopio` (Clasificación por Región)

```mermaid
classDiagram
    direction LR

    class CentroAcopio {
        -idCentroAcopio: Long
        -nombre: String
        -direccion: String
        -telefono: String
        -activo: boolean
        +crearCentro(): void
        +actualizarEstado(): void
    }

    class ZonaAcopio {
        -idZona: Long
        -nombre: String
        +agregarZona(): void
        +listarZonas(): void
    }

    CentroAcopio "1..*" --> "1" ZonaAcopio : pertenece a
```

* **centro a zona:** Un centro de acopio físico pertenece obligatoriamente a una sola zona geográfica (La Rinconada, Ananea o Lunar de Oro).
* **zona a centro:** Una zona geográfica puede albergar uno o varios centros de acopio autorizados.

---

## Par 5: `TransaccionG2` ➔ `LiquidacionG1` (Asociación Débil / Agrupación de Cierre)

```mermaid
classDiagram
    direction LR

    class TransaccionG2 {
        -idTransaccionG2: Long
        -fechaTransaccion: LocalDateTime
        -totalPagadoPen: BigDecimal
        -anulada: boolean
        +marcarLiquidada(): void
    }

    class LiquidacionG1 {
        -idLiquidacionG1: Long
        -fechaLiquidacion: LocalDateTime
        -estado: EstadoLiquidacion
        +emitirCierre(): void
    }

    TransaccionG2 "0..*" --> "0..1" LiquidacionG1 : se agrupa en
```

* **transaccion a liquidacion:** Una transacción de compra nace libre (`0`) y luego se agrupa en a lo sumo una liquidación mayorista (`1`).
* **liquidacion a transaccion:** Una liquidación mayorista agrupa muchas compras de oro emitidas por el acopiador (`0..*`).
