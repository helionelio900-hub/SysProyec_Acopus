# GUÍA COMPLETA: UNIONES SOLID MAESTRAS (S + D, O + L, S + O, S + L)
## Proyecto: `bomerp-acopio-oro` | Equipo 05

Este documento contiene las **uniones maestras de principios SOLID** listas para consultar, estudiar o proyectar durante la sustentación de ADS y LP2.

---

## 🏆 1. UNIÓN [ S + D ]: ARQUITECTURA DE CAPAS DESACOPLADAS

> **Concepto:** Separa la responsabilidad de cada capa (S) y las conecta mediante **Interfaces inyectadas** sin instanciar con `new` (D).

### 💻 Código Java Listo:

```java
// =========================================================================
// [CAPA 1: WEB HTTP] MineroController.java
// =========================================================================
@RestController
@RequestMapping("/api/v1/acopio/mineros")
@RequiredArgsConstructor // ✅ [D]: Inyección automática de dependencias por constructor
public class MineroController {

    private final MineroService mineroService; // ✅ [D]: Depende de la INTERFAZ (sin 'new')

    // ✅ [S]: Responsabilidad Única (Solo recibe la petición HTTP web y delega)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MineroResponse crear(@Valid @RequestBody MineroRequest request) {
        return mineroService.crear(request);
    }
}

// =========================================================================
// [CAPA 2: LÓGICA DE NEGOCIO] MineroServiceImpl.java
// =========================================================================
@Service
@RequiredArgsConstructor // ✅ [D]: Inyección de dependencias
public class MineroServiceImpl implements MineroService {

    private final MineroRepository mineroRepository; // ✅ [D]: Inyecta interfaz de base de datos
    private final MineroMapper mineroMapper;

    // ✅ [S]: Responsabilidad Única (Solo gestiona las reglas del Minero)
    @Override
    @Transactional
    public MineroResponse crear(MineroRequest request) {
        Minero entity = mineroMapper.toEntity(request);
        return mineroMapper.toResponse(mineroRepository.save(entity));
    }
}
```

---

## 🏆 2. UNIÓN [ O + L ]: PATRÓN STRATEGY DE PRECIOS EXTENSIBLE

> **Concepto:** Permite agregar nuevas cotizaciones de oro sin modificar clases existentes (O), garantizando que cualquier implementador sustituya la interfaz sin romper el sistema (L).

### 💻 Código Java Listo:

```java
// 1. Interfaz Strategy (Contrato Abierto a Extensión)
public interface CalculadorPrecioOroService {
    // ✅ [O]: Abierto a nuevas cotizaciones sin modificar clientes
    BigDecimal determinarPrecioAplicado(BigDecimal precioSolicitado);
}

// 2. Implementación Concreta Oficial (Sustitución Segura de Liskov)
@Service
@RequiredArgsConstructor
public class CalculadorPrecioOficialImpl implements CalculadorPrecioOroService {

    private final ParametrosSistemaRepository parametrosSistemaRepository;

    // ✅ [L]: Sustitución de Liskov (Garantiza retorno válido > 0 sin lanzar excepciones ilegales)
    @Override
    public BigDecimal determinarPrecioAplicado(BigDecimal precioSolicitado) {
        if (precioSolicitado != null && precioSolicitado.compareTo(BigDecimal.ZERO) > 0) {
            return precioSolicitado;
        }
        ParametrosSistema params = parametrosSistemaRepository
                .findFirstByEstadoOrderByFechaDesc("ACTIVO").orElse(null);
        return (params != null && params.getPrecioDiarioGramoPen() != null)
                ? params.getPrecioDiarioGramoPen()
                : new BigDecimal("280.00");
    }
}
```

---

## 🏆 3. UNIÓN [ S + L ]: ESPECIALISTAS DE PAGO INTERCAMBIABLES

> **Concepto:** Cada clase procesa exclusivamente un tipo de pago (S) y cualquiera puede sustituir a la interfaz padre en la caja de acopio sin errores (L).

### 💻 Código Java Listo:

```java
// Contrato Base
public interface MetodoPagoAcopio {
    void procesarPago(double monto);
}

// Especialista 1: Solo desembolsos en efectivo (S)
public class PagoEfectivo implements MetodoPagoAcopio {
    @Override
    public void procesarPago(double monto) {
        System.out.println("Efectivo de S/ " + monto + " entregado al minero.");
    }
}

// Especialista 2: Solo transferencias bancarias (S)
public class PagoTransferenciaBancaria implements MetodoPagoAcopio {
    private final String cci;
    public PagoTransferenciaBancaria(String cci) { this.cci = cci; }

    @Override
    public void procesarPago(double monto) {
        System.out.println("Transferencia de S/ " + monto + " enviada al CCI: " + cci);
    }
}

// Consumidor: Procesa cualquier pago indistintamente (Liskov puro)
public class CajaAcopioService {
    public void pagar(MetodoPagoAcopio metodo, double monto) {
        metodo.procesarPago(monto); // ✅ [L]: Sustituye cualquier método sin fallar
    }
}
```

---

## 🌟 4. LA GRAN FUSIÓN FINAL: [ S + O + L + I + D ] EN PRODUCCIÓN

Ubicación en el backend: [`pe.edu.upeu.bomerp.acopio.acopiador.service.AcopiadorServiceImpl.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/AcopiadorServiceImpl.java)

```java
@Service
@RequiredArgsConstructor // ✅ [D]: Inyección automática de dependencias por constructor
public class AcopiadorServiceImpl implements AcopiadorService { // ✅ [I]: Interfaz Segregada

    private final MineroRepository mineroRepository;                     // ✅ [D, I]
    private final TransaccionG2Repository transaccionG2Repository;       // ✅ [D, I]
    private final CalculadorPrecioOroService calculadorPrecioOroService; // ✅ [D, O]
    private final TransaccionG2Mapper transaccionG2Mapper;

    // ✅ [S]: Responsabilidad Única (Solo orquesta la compra de oro)
    @Override
    @Transactional
    public TransaccionG2Response registrarCompraDirecta(TransaccionG2Request request) {
        
        Minero minero = buscarMineroOFallar(request.idMinero());

        // ✅ [O + L]: Strategy de precios extensible y seguro
        BigDecimal precio = calculadorPrecioOroService.determinarPrecioAplicado(request.precioAplicadoPen());

        BigDecimal totalPagado = request.pesoFundidoNetoG().multiply(precio).setScale(2, RoundingMode.HALF_UP);

        TransaccionG2 tx = transaccionG2Mapper.toEntity(request, minero);
        tx.setPrecioAplicadoPen(precio);
        tx.setTotalPagadoPen(totalPagado);
        
        return transaccionG2Mapper.toResponse(transaccionG2Repository.save(tx));
    }
}
```
