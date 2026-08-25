# EVALUACIÓN Y EJEMPLOS SEPARADOS DE PRINCIPIOS SOLID (S, O, L, I, D)
## Proyecto: `bomerp-acopio-oro` | Equipo 05

---

## 🔴 1. PRINCIPIO S — Single Responsibility Principle (Responsabilidad Única)

> **Definición de la Docente**: *"Una clase debe tener una sola razón para cambiar."*

### ❌ Forma INCORRECTA (Debería optimizarse / Violación S):
```java
package pe.edu.upeu.bomerp.acopio;

// Monolito que viola S al tener 3 responsabilidades distintas en una sola clase
public class AcopioOroMonolitoService {
    public void registrarMinero() {
        System.out.println("Guardando minero en BD Oracle...");
    }

    public void registrarCompraOro() {
        System.out.println("Registrando transacción de acopio...");
    }

    public void generarFacturaPDF() {
        System.out.println("Imprimiendo comprobante...");
    }
}
```

### ✅ Forma CORRECTA (Código Real del Proyecto):
Separación estricta de responsabilidades en componentes independientes:
- **Catálogo de Mineros**: [`MineroServiceImpl.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/parametros/service/MineroServiceImpl.java)
- **Registro de Compras de Oro**: [`AcopiadorServiceImpl.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/AcopiadorServiceImpl.java)
- **Cálculo de Precios del Día**: [`CalculadorPrecioOficialImpl.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/CalculadorPrecioOficialImpl.java)
- **Atención de Peticiones HTTP**: [`MineroController.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/parametros/controller/MineroController.java)

---

## 🟡 2. PRINCIPIO O — Open/Closed Principle (Abierto / Cerrado)

> **Definición de la Docente**: *"Las clases deben estar abiertas para extenderse, pero cerradas para modificarse."*

### ❌ Forma INCORRECTA (Debería optimizarse / Violación O):
```java
package pe.edu.upeu.bomerp.acopio.acopiador.service;

public class CalculadorPrecioOroRigido {
    // Usar 'if/else' obliga a EDITAR este código cada vez que nace una nueva cotización
    public BigDecimal calcularPrecio(String tipoCotizacion, BigDecimal precioSolicitado) {
        if ("OFICIAL_ORACLE".equals(tipoCotizacion)) {
            return new BigDecimal("280.00");
        }
        if ("COTIZACION_API_INTERNACIONAL".equals(tipoCotizacion)) {
            return new BigDecimal("285.50");
        }
        return new BigDecimal("270.00");
    }
}
```

### ✅ Forma CORRECTA (Código Real del Proyecto):
Aplicación del patrón Strategy con una interfaz abstracta:
- **Interfaz (Abierta a extensión)**: [`CalculadorPrecioOroService.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/CalculadorPrecioOroService.java)
- **Implementación Concreta**: [`CalculadorPrecioOficialImpl.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/CalculadorPrecioOficialImpl.java)

*Si en el futuro se necesita cotizar con una API internacional en tiempo real, solo se crea `CalculadorPrecioAPIImpl implements CalculadorPrecioOroService` sin tocar `AcopiadorServiceImpl`.*

---

## 🔵 3. PRINCIPIO L — Liskov Substitution Principle (Sustitución de Liskov)

> **Definición de la Docente**: *"Una clase hija o implementación debe poder reemplazar a su clase padre o interfaz sin alterar el comportamiento esperado."*

### ❌ Forma INCORRECTA (Debería optimizarse / Violación L):
```java
package pe.edu.upeu.bomerp.acopio.acopiador.service;

public class CalculadorPrecioModoPruebasImpl implements CalculadorPrecioOroService {
    @Override
    public BigDecimal determinarPrecioAplicado(BigDecimal precioSolicitado) {
        // Violación de Liskov: Lanza excepción no esperada o retorna null rompiendo el flujo del consumidor
        throw new UnsupportedOperationException("No disponible en ambiente de pruebas");
    }
}
```

### ✅ Forma CORRECTA (Código Real del Proyecto):
Cualquier implementación de `CalculadorPrecioOroService` (`CalculadorPrecioOficialImpl`, `CalculadorPrecioAPIImpl`) respeta estrictamente el contrato: siempre devuelve un `BigDecimal` válido $> 0$, garantizando que se puede intercambiar en `AcopiadorServiceImpl` sin romper la aplicación.

---

## 🟣 4. PRINCIPIO I — Interface Segregation Principle (Segregación de Interfaces)

> **Definición de la Docente**: *"Los clientes no deben depender de métodos que no utilizan. Es mejor tener varias interfaces pequeñas que una muy grande."*

### ❌ Forma INCORRECTA (Debería optimizarse / Violación I):
```java
package pe.edu.upeu.bomerp.acopio;

// Interfaz inflada gigante que obliga a implementar métodos que el cliente no necesita
public interface AcopioSuperInterface {
    void crearMinero();
    void registrarCompraOro();
    void generarLiquidacionMayoristaG1();
    void emitirComprobantePDF();
    void enviarSMSMinero();
}
```

### ✅ Forma CORRECTA (Código Real del Proyecto):
Interfaces pequeñas, segregadas y especializadas para cada contexto del sistema:
- [`MineroService.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/parametros/service/MineroService.java) $\rightarrow$ Solo operaciones CRUD de mineros.
- [`AcopiadorService.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/AcopiadorService.java) $\rightarrow$ Solo compras directas de oro.
- [`CalculadorPrecioOroService.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/CalculadorPrecioOroService.java) $\rightarrow$ Solo cálculo de precios del gramo.

---

## 🟧 5. PRINCIPIO D — Dependency Inversion Principle (Inversión de Dependencias)

> **Definición de la Docente**: *"Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones."*

### ❌ Forma INCORRECTA (Debería optimizarse / Violación D):
```java
package pe.edu.upeu.bomerp.acopio.acopiador.service;

public class AcopiadorServiceImpl {
    // Violación de D: Dependencia directa de una clase concreta mediante 'new'
    private CalculadorPrecioOficialImpl calculador = new CalculadorPrecioOficialImpl();
}
```

### ✅ Forma CORRECTA (Código Real del Proyecto):
En [`AcopiadorServiceImpl.java`](file:///e:/Cursos_Ciclo_4/Lenguaje%20de%20Programaci%C3%B3n%20II/bomerp-acopio-oro/lp2/bomerp-backend/src/main/java/pe/edu/upeu/bomerp/acopio/acopiador/service/AcopiadorServiceImpl.java), se depende únicamente de la interfaz abstracta `CalculadorPrecioOroService` inyectada por Spring mediante constructor:

```java
@Service
@RequiredArgsConstructor
public class AcopiadorServiceImpl implements AcopiadorService {

    private final TransaccionG2Repository transaccionG2Repository;
    private final MineroRepository mineroRepository;
    private final CalculadorPrecioOroService calculadorPrecioOroService; // Cumple D: Inyección por Interfaz
    private final TransaccionG2Mapper transaccionG2Mapper;
}
```
