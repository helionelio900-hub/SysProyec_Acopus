# Informe individual de aprendizaje — S09
## Formulario transaccional cabecera-detalle del módulo Mayorista de SITRA-ORO

**Nombre:** Faijo Calisaya Helio Paul  
**Equipo:** 05  
**Asignatura:** Lenguaje de Programación II  
**Sesión:** S09 — Formularios Transaccionales Cabecera-Detalle  
**Módulo:** Mayorista  
**Rol o aporte realizado:** Formulario de compra directa por partidas, cálculos reactivos, validación de colección, confirmación, manejo de errores y reporte de compras con filtros.  
**Repositorio:** [SysProyec_Acopus](https://github.com/helionelio900-hub/SysProyec_Acopus).


## 1. Operación elegida y modelos

La operación elegida es **registrar una compra directa de oro en Mayorista con varias partidas por ley**. La cabecera identifica la operación, la fecha y el adelanto; el detalle contiene las partidas de oro recibidas. Cada partida registra onza, ley, porcentaje, tipo de cambio, peso sin fundir y peso fundido. El sistema calcula el precio por gramo y el importe correspondiente. La compra directa se identifica mediante un número de registro generado al guardar y no solicita DNI, nombres ni clasificación por color.

El formulario corresponde al negocio de SITRA-ORO. No representa una venta de productos ni añade cantidades comerciales ajenas al sistema. El peso del oro y la ley son los datos centrales de cada partida.

| Elemento | Modelo real | Responsabilidad |
|---|---|---|
| Cabecera | `RecepcionMayorista` | Número de operación, fecha, origen de compra directa, revisión e importe registrado. |
| Detalle | `DetalleRecepcionLey` | Ley, parámetros de valorización, pesos, precios e importe por partida. |
| Catálogo compartido | `LeyOro` | Una misma ley puede participar en varias operaciones. |
| Entrada HTTP | `CompraDirectaMayoristaController.Compra` | Envuelve los datos del análisis enviados por el formulario. |
| Análisis de entrada | `RecepcionLeyRequest` | Revisión, adelanto y colección variable de partidas. |
| Respuesta | `RecepcionLeyResponse` | Operación registrada, detalles, pesos, subtotal, adelanto y total. |

### DTO real de entrada

El endpoint `POST /api/v1/mayorista/compras-directas` recibe este envoltorio:

```java
public record Compra(
    @NotNull @Valid RecepcionLeyRequest analisis
) {}
```

El análisis contiene:

```java
public record RecepcionLeyRequest(
    @NotNull @PositiveOrZero Long revision,
    @NotNull @DecimalMin("0")
    @Digits(integer = 18, fraction = 2) BigDecimal adelanto,
    @NotNull @Size(min = 1, max = 200)
    List<@NotNull @Valid Partida> detalles
) {}
```

Cada `Partida` contiene exactamente estos campos:

```java
BigDecimal onza;
BigDecimal ley;
BigDecimal porcentaje;
BigDecimal tipoCambio;
BigDecimal pesoSinFundirG;
BigDecimal pesoFundidoG;
```

El backend valida que onza, ley, tipo de cambio y pesos sean positivos; la ley no supere 100 y el porcentaje sea menor que 100. Los parámetros admiten hasta cuatro decimales y los pesos hasta tres. La colección contiene entre 1 y 200 partidas.

Ejemplo de estructura de solicitud; los datos son ilustrativos, no evidencia de una ejecución:

```json
{
  "analisis": {
    "revision": 0,
    "adelanto": 0,
    "detalles": [
      {
        "onza": 4000,
        "ley": 90.7,
        "porcentaje": 8.8,
        "tipoCambio": 3.34,
        "pesoSinFundirG": 12,
        "pesoFundidoG": 10
      }
    ]
  }
}
```

Los precios, los importes por partida y el total no se envían como campos editables. El backend los vuelve a calcular antes de persistir la cabecera y sus detalles dentro de una transacción.

## 2. Evidencia técnica

### Bloque 1. Formulario con detalle dinámico

La colección `form.controls.detalles` utiliza `FormArray`. Se inicia con una partida y permite añadir o quitar grupos de controles. La última partida no puede eliminarse y el formulario limita la colección a 200 líneas.

#### Captura 1 — Formulario con partidas dinámicas

![Compra directa del mayorista con tres partidas y botones Agregar y Quitar](img_S09_Mayorista/captura-01-formarray.png)

**Explicación:** la pantalla de compra directa del Mayorista muestra tres partidas dentro de una misma operación. Cada fila contiene sus parámetros y pesos, y dispone del botón Quitar; debajo de la tabla aparece Agregar partida. Esta estructura corresponde al `FormArray` de detalles del formulario. Los campos pendientes mantienen deshabilitado Revisar y registrar. En la cabecera se identifica el perfil Mayorista y en la barra del sistema se observa la hora de captura.

### Bloque 2. Cálculos y validación

`calculo` utiliza `computed` sobre los valores del formulario. `form.valueChanges` actualiza el estado de las partidas y su validez. El precio, el importe de cada línea y el total se recalculan al cambiar una dependencia. El cálculo visual mantiene la fórmula comercial del backend; antes de permitir la confirmación, `calculoValidado` comprueba la coincidencia entre los importes calculados en ambos lados.


El cálculo visual utiliza enteros escalados (`BigInt`) para mantener el redondeo decimal utilizado por el servidor. Los valores almacenados siguen siendo determinados por el backend. El cambio no modifica la fórmula ni añade un porcentaje nuevo.

#### Captura 2 — Cálculos por partida y total

![Compra directa con dos partidas, importes por línea y total general](img_S09_Mayorista/captura-02-calculos.png)

**Explicación:** el formulario presenta dos partidas con leyes distintas. La primera tiene ley 85.5, 11 g recibidos y 10 g fundidos; muestra un precio de S/ 334.97 por gramo y un importe de S/ 3349.70. La segunda tiene ley 95.5, 21 g recibidos y 20 g fundidos; muestra S/ 374.15 por gramo y un importe de S/ 7483.00. Ambas utilizan onza 4000, porcentaje 8.8 y tipo de cambio 3.34. El subtotal es S/ 10832.70; como el adelanto es cero, el total a pagar coincide con ese subtotal. El botón Revisar y registrar está habilitado. Frente a la captura anterior, la colección pasó de tres a dos partidas.

#### Captura 3 — Validación de la colección

![Rechazo de dos partidas con ley 85.5 repetida y registro deshabilitado](img_S09_Mayorista/captura-03-validacion.png)

**Explicación:** ambas partidas contienen la ley 85.5. La interfaz muestra el mensaje “La ley 85.5 está repetida en este lote. Reúne sus pesos en una sola partida”. Los precios e importes aparecen sin resultado y Revisar y registrar queda deshabilitado. La imagen demuestra que las partidas no pueden procesarse únicamente porque sus campos individuales tengan datos: también deben cumplir la regla de la colección. La captura muestra el rechazo visible, aunque por sí sola no identifica si el mensaje procede de la validación local o de una respuesta HTTP.

### Bloque 3. Confirmación y manejo de errores

El botón Revisar y registrar abre un diálogo con la operación, sus partidas, leyes, pesos e importes. También muestra peso fundido total, subtotal, adelanto y total a pagar. La solicitud de guardado se ejecuta cuando el usuario confirma ese resumen y el cálculo visual coincide con el del servidor.

#### Captura 4 — Confirmación con resumen real

![Diálogo de confirmación de dos partidas con 30 g fundidos y total S/ 10832.70](img_S09_Mayorista/captura-04-confirmacion.png)

**Explicación:** antes de guardar, el diálogo presenta la compra directa con dos partidas y resume 30 g de peso fundido, S/ 10832.70 de material, S/ 0.00 de adelanto y S/ 10832.70 como total a pagar. Estas cantidades coinciden con las dos partidas de la captura 2. Los botones Volver y Confirmar permiten corregir los datos o autorizar el registro. El rótulo “Registrar lote #0” corresponde al identificador provisional de la nueva compra; el número definitivo se asigna al guardar.

El backend identifica las reglas rechazadas mediante códigos diferenciados:

| Código | Respuesta | Regla |
|---|---|---|
| `PESO_FUNDIDO_SUPERA_ENTRADA` | HTTP 400 | El fundido no puede superar el peso recibido. |
| `ADELANTO_SUPERA_TOTAL` | HTTP 400 | El adelanto no puede superar el subtotal del material. |
| `LEY_REPETIDA` | HTTP 400 | La misma ley debe reunirse en una partida. |

El frontend revisa `error.code` y presenta un mensaje específico. Estos errores pueden producirse en el endpoint de cálculo previo; son respuestas reales del backend de la misma operación y evitan llegar al guardado con datos inválidos.

#### Captura 5 — Rechazo del backend por peso fundido superior al recibido

![Compra directa con 11 g recibidos, 12 g fundidos y mensaje específico del backend](img_S09_Mayorista/captura-05-error-peso.png)

**Explicación:** una partida con ley 90 registra 11 g sin fundir y 12 g fundidos. La interfaz mantiene la vista previa de los cálculos reactivos: precio S/ 352.60 por gramo e importe S/ 4231.20. Sin embargo, muestra “El backend rechazó la partida: el peso fundido supera el peso recibido. Corrige esos pesos” y deshabilita Revisar y registrar. Así se distingue entre calcular una vista previa y autorizar una operación válida. El frontend identifica el código `PESO_FUNDIDO_SUPERA_ENTRADA` de la respuesta del servidor y presenta el mensaje específico. En la imagen se observan el perfil Mayorista y la hora del sistema.

#### Captura 6 — Rechazo del backend por adelanto superior al total

![Adelanto de S/ 4000 superior al material de S/ 3526.00 y mensaje específico del backend](img_S09_Mayorista/captura-06-error-adelanto.png)

**Explicación:** la partida contiene ley 90, 11 g recibidos y 10 g fundidos, con importe de S/ 3526.00. El adelanto de S/ 4000 supera ese subtotal. La vista previa reactiva muestra S/ -474.00, pero el backend rechaza la operación y la interfaz indica “El backend rechazó el adelanto: supera el total del material. Reduce el adelanto”. Revisar y registrar permanece deshabilitado; el resultado negativo no se acepta como compra válida. El frontend distingue este caso mediante el código `ADELANTO_SUPERA_TOTAL`. La imagen incluye el perfil Mayorista y la hora del sistema.

### Bloque 4. Consulta o reporte

La pestaña Reporte de compras consulta un endpoint de agregados reales de Mayorista:

```http
GET /api/v1/mayorista/recepciones-ley/resumen?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
```

El backend filtra por fecha las operaciones con partidas analizadas. Devuelve cantidad de operaciones, cantidad de partidas, peso fundido, subtotal, adelantos, total e ítems del reporte. Los acumulados proceden de los datos persistidos y son calculados en el backend; no son solo una suma de los controles del formulario.

#### Captura 7 — Reporte de compras filtrado por fechas

![Reporte de Mayorista del 01 al 11 de octubre de 2026 con agregados y cuatro operaciones](img_S09_Mayorista/captura-07-reporte.png)

**Explicación:** se muestra el filtro Desde 01/10/2026 y Hasta 11/10/2026. El reporte presenta cuatro operaciones, cinco partidas, 2029 g de peso fundido, S/ 734812.18 de material registrado, adelantos de S/ 0.00 y un total registrado de S/ 734812.18. Las operaciones #125, #124 y #103 contienen una partida cada una, mientras que la #101 contiene dos. Sus pesos de 10, 10, 9 y 2000 g suman los 2029 g del agregado. Los importes S/ 3917.50, S/ 3553.40, S/ 3221.28 y S/ 724120.00 coinciden con el total del reporte. La vista consume el endpoint de resumen de Mayorista y muestra datos persistidos, incluidos registros directos y entregas de acopiadores.

## 3. Error o hallazgo técnico

En la primera implementación de Mayorista, los importes se actualizaban mediante una llamada al endpoint de cálculo y quedaban en un `signal`. El formulario tenía cálculos automáticos, pero no acreditaba específicamente los derivados con `computed` que exige S09. Se incorporó un estado reactivo del formulario y un `computed` para los precios por línea y el total.

También se detectó que el promedio mostrado en exportación era un cálculo de la interfaz, sin filtro de fechas ni endpoint específico de agregados para las compras actuales. Se añadió Reporte de compras y el endpoint `/recepciones-ley/resumen`. Así se mantuvo el flujo del negocio mientras se completaban los requisitos técnicos de la sesión.

Para proteger el resultado comercial, el cálculo visual conserva las escalas y el redondeo del servidor. La confirmación solo se habilita cuando ambos resultados coinciden; el backend continúa recalculando y guardando los importes.

## 4. Reflexión técnica breve

El mayor riesgo sería registrar varias partidas con una ley o un peso incorrectos.
Esos datos determinan el precio por gramo y el importe que corresponde pagar.
Una operación con varias líneas podría multiplicar un error antes de que se advierta.
Por eso la confirmación debe mostrar las leyes, los pesos, el adelanto y el total real.
Relaciono esta revisión con Knight Capital por el riesgo de ejecutar acciones automáticas no deseadas.
La confirmación ayuda a revisar la intención, pero no sustituye las reglas del backend.
El recálculo y la transacción completan la protección de la compra registrada.
