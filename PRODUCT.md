# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Minero** (persona que extrae y vende oro en La Rinconada, Ananea y zonas cercanas de Puno). Usa el sistema **desde el celular**. Crea su propia cuenta, elige a qué centro de acopio mandar su oro, consulta la cotización referencial y registra solicitudes de entrega.
- **Acopiador (G2)**: encargado de un centro de acopio. Usa computadora en el mostrador. Registra y aprueba mineros, compra el oro (pesaje, fundición, clasificación rojo/verde, pago en soles) y prepara las entregas al mayorista.
- **Mayorista (G1)**: planta que compra el oro acumulado de los acopiadores. Es el módulo más completo y prioritario: recibe lotes, analiza la ley, valoriza, paga al acopiador (en soles o dólares), entrega adelantos y arma lotes de exportación.

## Product Purpose

SITRA-ORO da trazabilidad física, técnica y financiera al oro desde el minero hasta el lote de exportación: pesos antes y después de fundir, clasificación rojo/verde, ley, cotización de la onza, tipo de cambio, pagos y adelantos. Reemplaza el registro manual y no estandarizado de la cadena minero → acopiador → mayorista → exportador.

Éxito: cada gramo y cada sol se puede reconstruir paso a paso, y cada actor ve solo lo que le corresponde.

## Positioning

Está construido sobre la operación real de La Rinconada: oro rojo y verde separados en todo el proceso, pesaje independiente del acopiador y del mayorista, valorización por ley con onza y tipo de cambio en vivo, y adelantos a centros de acopio que se descuentan del pago. Un ERP genérico de compras no modela esas reglas.

## Operating Context

- Cadena: minero → acopiador → mayorista → exportador (actor externo).
- El minero consulta y opera desde el celular, en zonas de gran altura (más de 5 000 m.s.n.m.) donde nieva con frecuencia.
- El acopiador **no imprime tickets**: no tiene ticketeras y le cuesta instalar equipos; los comprobantes del acopio deben funcionar en pantalla.
- El mayorista trabaja en computadora en planta y sí puede imprimir sus comprobantes.
- Precios de referencia en vivo: onza de oro (USD) y tipo de cambio USD/PEN.

## Capabilities and Constraints

- **Separación de información por rol (regla de negocio):**
  - El mayorista **solo crea cuentas de acopiadores**; no ve el dinero del acopiador ni ningún dato del minero.
  - El acopiador administra a sus mineros (crear, aprobar) y decide qué información envía al mayorista.
  - El minero crea su propia cuenta y elige a qué centro de acopio enviar su oro.
- Valorización del mayorista en soles; el pago al acopiador puede hacerse en soles o en dólares.
- Adelantos del mayorista a centros de acopio en PEN o USD, descontados al pagar el siguiente lote.
- **Pendiente de definir:** registro de **caja del mayorista** (dinero disponible ingresado manualmente). Falta decidir si es solo un saldo o un historial de ingresos y egresos, si se lleva en PEN y USD por separado, y si los pagos y adelantos se descuentan de la caja automáticamente.
- **Pendiente de definir:** fórmulas oficiales de liquidación mayorista, ley consolidada, descuentos y tolerancias de merma (ver `docs/DOCUMENTO_MAESTRO_CONTEXTO_FUNCIONAL_SITRA_ORO.md`, sección 8).
- Stack existente: Angular (frontend), Spring Boot + Oracle (backend), Keycloak (acceso).

## Brand Commitments

- Nombre del producto: **SITRA-ORO**. El logo actual muestra "Quilate Bullion · SITRA-ORO".
- Voz en español peruano, cercana y de tú en las pantallas del minero ("Tu oro, tu decisión").
- El inicio público para el minero debe ser lo más atractivo del sistema y reflejar La Rinconada: fotografía real del lugar y el clima real de la zona (por ejemplo, nieve en pantalla cuando está nevando allí).

## Evidence on Hand

- Proyecto real: ganó en su categoría y el autor y su docente planean venderlo a una empresa.
- Fotos de La Rinconada entregadas por el autor (1000×667 px o menos): la del pueblo de noche con el nevado es la más fuerte. **Origen y derechos de uso sin confirmar**; no deben publicarse en la versión comercial sin licencia.
- Documento funcional: `docs/DOCUMENTO_MAESTRO_CONTEXTO_FUNCIONAL_SITRA_ORO.md`.
- No hay testimonios, clientes, cifras ni casos publicados; no se deben inventar.

## Product Principles

1. **Cada rol ve solo lo suyo.** La privacidad entre minero, acopiador y mayorista es una regla del negocio, no un detalle visual.
2. **Los montos son la verdad.** Cifras claras, alineadas y con su moneda; nada decorativo compite con el dinero.
3. **Celular primero para el minero; mostrador y planta para los demás.**
4. **Funcionar sin equipo extra.** Si el acopiador no tiene impresora, el comprobante vive en la pantalla.
5. **Raíz en La Rinconada.** Lugar, clima y oro rojo/verde reales, no una estética genérica de minería.

## Accessibility & Inclusion

- Mineros con poca experiencia en sistemas: pasos cortos y lenguaje simple.
- Uso en exteriores y con luz intensa de altura: contraste alto en las pantallas del minero.
- Respetar "reducir movimiento" del sistema operativo en efectos como la nieve.
