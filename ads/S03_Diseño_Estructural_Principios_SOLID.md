# S03 - Diseño Estructural y Principios SOLID
## Módulo `bomerp-acopio-oro` | Equipo 05

---

## 1. Evaluación de Principios SOLID sobre el Código Real

### 1.1 Single Responsibility Principle (S - Responsabilidad Única)

| Clase / Componente | Responsabilidad Única | ¿Cumple? | Justificación / Evaluación |
|---|---|:---:|---|
| `MineroController` | Traducir peticiones HTTP ↔ llamadas a `MineroService` y aplicar `@Valid`. | **Sí** | No contiene lógica de negocio, reglas de cálculo ni consultas SQL/JPA. |
| `MineroServiceImpl` | Orquestar reglas de negocio del catálogo de Mineros (CRUD y validación `buscarOFallar`). | **Sí** | Se limita a orquestar las operaciones de persistencia del minero. |
| `MineroRepository` | Abstracción de acceso a datos de la tabla `MINEROS` vía Spring Data JPA. | **Sí** | Interface pura sin lógica propia. |
| `MineroMapper` | Mapeo bidireccional entre `MineroRequest`, `Minero`, `MineroResponse` y `MineroResumen`. | **Sí** | Generado por MapStruct, libre de lógica de negocio. |
| `Minero` (Entidad JPA) | Representar el modelo de datos persistente en Oracle (`BOM_ACOPIO.MINEROS`). | **Sí** | Clase `@Entity` con campos, getters/setters y `@PrePersist`. |
| `AcopiadorServiceImpl` | Orquestar la regla de compra directa de oro (`TransaccionG2`), cálculo de montos y validación de minero. | **Sí** | Se enfoca exclusivamente en la transacción de acopio de oro. |
| `TransaccionG2Repository` | Acceso a datos de `TRANSACCIONES_G2` y agregaciones SQL por tipo de oro (Rojo/Verde). | **Sí** | Interface de persistencia Spring Data JPA. |
| `TransaccionG2Mapper` | Mapeo de `TransaccionG2Request` y `Minero` $\rightarrow$ `TransaccionG2` $\rightarrow$ `TransaccionG2Response`. | **Sí** | Interface MapStruct delegando mapeos de minero a `MineroMapper`. |
| `TransaccionG2` (Entidad) | Representar el modelo de datos de compras de oro en Oracle (`BOM_ACOPIO.TRANSACCIONES_G2`). | **Sí** | Mapeo ORM JPA con `@ManyToOne` unidireccional. |

---

### 1.2 Open/Closed (O), Liskov Substitution (L) e Interface Segregation (I)

1. **Open/Closed Principle (O)**:
   - `MineroService` y `AcopiadorService` son interfaces Java.
   - Permiten extender el comportamiento agregando nuevas implementaciones (ejemplo: `MineroServiceCacheImpl` o `MineroServiceAuditDecorator`) sin modificar `MineroController` ni romper código existente.

2. **Liskov Substitution Principle (L)**:
   - Cualquier implementación alternativa de `MineroService` sustituye a `MineroServiceImpl` manteniendo exactamente el mismo contrato (mismo lanzamiento de `ResourceNotFoundException` ante IDs inexistentes) sin alterar el comportamiento de `MineroController`.

3. **Interface Segregation Principle (I)**:
   - Las interfaces `MineroService` y `AcopiadorService` declaran únicamente los métodos específicos consumidos por sus controladores (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`, `listarPorMinero`). No existen métodos inflados ni forzados.

---

### 1.3 Dependency Inversion Principle (D - Inversión de Dependencias)

Todas las dependencias en los controladores y servicios del módulo de acopio se inyectan como **interfaces** mediante `@RequiredArgsConstructor` (Constructor Injection). En ningún punto se utiliza la palabra clave `new` para instanciar repositorios, mappers o servicios concretos:

```java
@RestController
@RequestMapping("/api/v1/acopio/mineros")
@RequiredArgsConstructor
public class MineroController {
    private final MineroService mineroService; // Interfaz, no MineroServiceImpl
    private final AcopiadorService acopiadorService; // Interfaz, no AcopiadorServiceImpl
}
```

```java
@Service
@RequiredArgsConstructor
public class AcopiadorServiceImpl implements AcopiadorService {
    private final TransaccionG2Repository transaccionG2Repository; // Interfaz Spring Data JPA
    private final MineroRepository mineroRepository; // Interfaz Spring Data JPA
    private final TransaccionG2Mapper transaccionG2Mapper; // Interfaz MapStruct
}
```

---

## 2. Cohesión y Acoplamiento

### 2.1 Cohesión por Paquete (Alta Cohesión)
- **`pe.edu.upeu.bomerp.acopio.parametros`**: Contiene únicamente las clases de la entidad `Minero` y parámetros del sistema. Alta cohesión temática.
- **`pe.edu.upeu.bomerp.acopio.acopiador`**: Contiene únicamente la lógica de registro de transacciones de compra directa de oro (`TransaccionG2`).

### 2.2 Acoplamiento entre Paquetes (Tensión de Diseño Identificada)
- **Acoplamiento de Clases**: `AcopiadorServiceImpl` depende de `MineroRepository` para validar que el `idMinero` referenciado en una transacción exista.
- **Evaluación**: Puesto que ambos paquetes pertenecen al mismo módulo funcional (`acopio`), este acoplamiento interno es aceptable y no viola el límite modular verificado por Spring Modulith.
- **Acoplamiento entre Contratos**: `TransaccionG2Response` embebe `MineroResumen` (DTO liviano con `idMinero`, `documentoIdentidad`, `nombresApellidos`), evitando depender del DTO completo `MineroResponse`.

---

## 3. Modularidad y Abstracción

### 3.1 Modularidad (Spring Modulith)
El sistema se organiza en módulos de negocio desacoplados. La prueba automatizada `ModularityTests.java` verifica de forma estricta que ningún módulo externo pueda acceder directamente a entidades o repositorios internos de otro módulo sin pasar por su Service público.

### 3.2 Abstracción (DTOs vs Entidades)
- Las entidades JPA (`Minero`, `TransaccionG2`) nunca se exponen en los controladores HTTP REST.
- Se utilizan DTOs de lectura (`MineroResponse`, `TransaccionG2Response`) y DTOs reducidos (`MineroResumen`), protegiendo la estructura interna de la base de datos Oracle XE.

---

## 4. Hallazgo Real de Diseño y Corrección Propuesta

- **Hallazgo**: `AcopiadorServiceImpl` realiza la validación de la existencia del minero invocando directamente `mineroRepository.findById(idMinero)` en lugar de utilizar `mineroService.obtener(idMinero)`.
- **Análisis**: Esta decisión crea un acoplamiento directo desde el servicio de transacciones hacia la capa de persistencia de parámetros.
- **Propuesta de Mejora**: Inyectar `MineroService` en `AcopiadorServiceImpl` para invocar `mineroService.obtener(idMinero)`, promoviendo el acoplamiento hacia interfaces públicas estables.
