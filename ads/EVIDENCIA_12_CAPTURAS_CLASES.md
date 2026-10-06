# Evidencia de Aprendizaje · 12 Clases del Modelo SITRA-ORO

**Curso:** Análisis y Diseño de Sistemas / Lenguaje de Programación II  
**Unidad:** Unidad 2 · Implementación y Mapeo de Clases de Dominio  
**Estudiante:** Faijo Calisaya Helio Paul  
**Equipo:** 05 · SITRA-ORO  

---

### Captura 1. `TransaccionG2` (Compra de Acopio)
![TransaccionG2](img_clases/captura-01-transacciong2.png)
**Explicación:** Muestra la entidad de compra con atributos `pesoSinFundirG`, `pesoFundidoNetoG`, `precioAplicadoPen` y `totalPagadoPen` en `BigDecimal`, relación `@ManyToOne` hacia `Minero` y los identificadores escalares `idLiquidacionG1` e `idRecepcionMayorista`.

---

### Captura 2. `Minero` (Productor / Proveedor)
![Minero](img_clases/captura-02-minero.png)
**Explicación:** Muestra la entidad maestra de mineros con `idMinero`, `documentoIdentidad` único, datos de contacto y la relación estrictamente unidireccional (sin colección `@OneToMany`) para prevenir consumo excesivo de memoria.

---

### Captura 3. `LiquidacionG1` (Cierre Mayorista)
![LiquidacionG1](img_clases/captura-03-liquidaciong1.png)
**Explicación:** Muestra la cabecera de liquidación con `cotizacionOnzaUsd`, `tipoCambioUsdPen`, `totalPagadoG2Pen`, estado gobernado por `EstadoLiquidacion` y la composición `@OneToMany` hacia sus detalles.

---

### Captura 4. `DetalleLiquidacionG1` (Línea por Tipo de Oro)
![DetalleLiquidacionG1](img_clases/captura-04-detalleliquidaciong1.png)
**Explicación:** Muestra la relación `@ManyToOne` hacia `LiquidacionG1`, el cálculo de `subtotalPen`, y la restricción única `UQ_DET_LIQ_G1_COLOR` para asegurar máximo un detalle por color.

---

### Captura 5. `RecepcionMayorista` (Recepción de Stock)
![RecepcionMayorista](img_clases/captura-05-recepcionmayorista.png)
**Explicación:** Muestra la relación `@ManyToOne` hacia `CentroAcopio`, los dos objetos `@Embedded` de `DatosOro` (rojo y verde), y los campos de liquidación monetaria `descuento` (adelanto en soles) y `total`.

---

### Captura 6. `DatosOro` (Objeto de Valor Embebido)
![DatosOro](img_clases/captura-06-datosoro.png)
**Explicación:** Muestra la clase `@Embeddable` sin identidad propia, agrupando pesos y cotizaciones de fundición mayorista dentro de la recepción.

---

### Captura 7. `CentroAcopio` (Sede Física de Acopio)
![CentroAcopio](img_clases/captura-07-centroacopio.png)
**Explicación:** Muestra los atributos de sede física, estado booleano `activo`, y la referencia desacoplada `idCuentaAcopiador` hacia el módulo de seguridad.

---

### Captura 8. `ParametrosSistema` (Cotizaciones Diarias)
![ParametrosSistema](img_clases/captura-08-parametrossistema.png)
**Explicación:** Muestra la tabla de parámetros diarios autónoma con cotizaciones de onza, tipo de cambio y precio referencial, consultada transversalmente sin enlaces ORM directos.

---

### Captura 9. `AjusteCompraG2` (Auditoría de Compras)
![AjusteCompraG2](img_clases/captura-09-ajustecomprag2.png)
**Explicación:** Muestra la entidad de trazabilidad que guarda claves numéricas intermodulares y fotos inmutables de pesos anteriores (`pesoSinFundirAnterior`, `pesoFundidoAnterior`).

---

### Captura 10. `LoteExportacion` (Lote Consolidado)
![LoteExportacion](img_clases/captura-10-loteexportacion.png)
**Explicación:** Muestra el lote de exportación con ciclo de vida tipificado por `EstadoLoteExportacion` y su relación `@OneToMany` hacia sus partidas.

---

### Captura 11. `PartidaLoteExportacion` (Partida de Lote)
![PartidaLoteExportacion](img_clases/captura-11-partidaloteexportacion.png)
**Explicación:** Muestra la relación `@ManyToOne` doble hacia `LoteExportacion` y `LiquidacionG1`, vinculando la liquidación mayorista al lote de comercio exterior.

---

### Captura 12. `CuentaAcceso` (Seguridad y Acceso)
![CuentaAcceso](img_clases/captura-12-cuentaacceso.png)
**Explicación:** Muestra el control de acceso con clave única en `documentoIdentidad`, rol gobernado por `RolCuenta` e identificadores numéricos escalares hacia el minero o centro asignado.
