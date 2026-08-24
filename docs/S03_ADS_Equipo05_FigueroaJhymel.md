# INFORME DE EVIDENCIA INDIVIDUAL - SESIÓN S03 (ADS)
## CURSO: ANÁLISIS Y DISEÑO DE SISTEMAS (ADS)

**Nombre del Archivo Entregable:** `S03_ADS_Equipo05_FigueroaJhymel.pdf`

---

## 1. DATOS DEL ESTUDIANTE

* **Nombre del Estudiante:** Jhymel Nelio Figueroa Chambi
* **Compañero de Equipo:** Helio Calisaya
* **Equipo:** Equipo 05 - Proyecto `bomerp-acopio-oro`
* **Sesión:** S03 - Diseño Estructural y Principios SOLID
* **Rol o Aporte Realizado:** Evaluación Arquitectónica y Análisis SOLID, Cohesión, Acoplamiento, Modularidad y Abstracción sobre las clases reales del backend de Acopio de Oro.
* **Link de GitHub del Proyecto:** [https://github.com/helionelio900-hub/SysProyec_Acopus](https://github.com/helionelio900-hub/SysProyec_Acopus)

---

## 2. EVIDENCIA TÉCNICA (EVALUADA SOBRE RÚBRICA S03 ADS)

### 2.1 Responsabilidad Única (S) - Tabla por Clase Real

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

### 2.2 Abierto/Cerrado (O), Liskov (L) e Interfaces (I)

1. **Open/Closed Principle (O)**:
   - `MineroService` y `AcopiadorService` son interfaces Java.
   - Permiten extender el comportamiento agregando nuevas implementaciones (ejemplo: `MineroServiceCacheImpl` o `MineroServiceAuditDecorator`) sin modificar `MineroController` ni romper código existente.

2. **Liskov Substitution Principle (L)**:
   - Cualquier implementación alternativa de `MineroService` sustituye a `MineroServiceImpl` manteniendo exactamente el mismo contrato (mismo lanzamiento de `ResourceNotFoundException` ante IDs inexistentes) sin alterar el comportamiento de `MineroController`.

3. **Interface Segregation Principle (I)**:
   - Las interfaces `MineroService` y `AcopiadorService` declaran únicamente los métodos específicos consumidos por sus controladores (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`, `listarPorMinero`). No existen métodos inflados ni forzados.

---

### 2.3 Inversión de Dependencias (D) con Código Real

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

### 2.4 Cohesión, Acoplamiento, Modularidad y Abstracción

1. **Cohesión por Paquete (Alta Cohesión)**:
   - `pe.edu.upeu.bomerp.acopio.parametros`: Contiene únicamente las clases de la entidad `Minero` y parámetros del sistema. Alta cohesión temática.
   - `pe.edu.upeu.bomerp.acopio.acopiador`: Contiene únicamente la lógica de registro de transacciones de compra directa de oro (`TransaccionG2`).

2. **Acoplamiento entre Paquetes (Tensión de Diseño Identificada)**:
   - `AcopiadorServiceImpl` depende de `MineroRepository` para validar que el `idMinero` referenciado exista. Puesto que ambos paquetes pertenecen al mismo módulo funcional (`acopio`), este acoplamiento interno es aceptable.
   - En contratos, `TransaccionG2Response` embebe `MineroResumen` (DTO liviano con `idMinero`, `documentoIdentidad`, `nombresApellidos`), evitando depender del DTO completo `MineroResponse`.

3. **Modularidad y Abstracción**:
   - **Modularidad**: Verificada automáticamente por Spring Modulith (`ModularityTests.java`).
   - **Abstracción**: Las entidades JPA (`Minero`, `TransaccionG2`) nunca se exponen en la API REST pública, garantizando el aislamiento mediante DTOs.

---

### 2.5 Hallazgo Real Identificado

* **Descripción del Hallazgo:** En `AcopiadorServiceImpl`, la validación de la existencia del minero se realiza accediendo directamente a `mineroRepository.findById(idMinero)` en lugar de invocar `mineroService.obtener(idMinero)`.
* **Análisis de Impacto:** Esta decisión crea un acoplamiento directo desde el servicio de transacciones de acopio hacia la capa de persistencia de parámetros.
* **Propuesta de Corrección:** Inyectar `MineroService` en `AcopiadorServiceImpl` para invocar `mineroService.obtener(idMinero)`, promoviendo el acoplamiento hacia interfaces públicas estables.

---

## 3. REFLEXIÓN TÉCNICA BREVE (5 A 8 LÍNEAS)

El acoplamiento entre dos paquetes del mismo módulo no es automáticamente una violación de diseño porque ambos pertenecen al mismo dominio de negocio y comparten un ciclo de vida conjunto. A diferencia de dos módulos distintos (donde Spring Modulith exige comunicarse únicamente a través de servicios públicos e impone un aislamiento estricto), los paquetes internos de un mismo módulo pueden colaborar directamente para evitar capas de abstracción innecesarias. Sin embargo, para mantener la mantenibilidad, es recomendable acoplarse preferentemente hacia interfaces o servicios públicos del paquete hermano en lugar de acceder directamente a sus repositorios internos.

---

## 4. RESPUESTAS A LAS PREGUNTAS DE DEFENSA (SESIÓN S03 ADS)

1. **¿Qué diferencia hay entre una violación real de SOLID y una tensión de diseño aceptable?**
   * Una violación real degrada la mantenibilidad y rompe principios esenciales (como instanciar clases concretas con `new` o mezclar persistencia y lógica de negocio). Una tensión de diseño es un acoplamiento intencional y justificado dentro del mismo módulo funcional para simplificar la arquitectura sin violar límites modulares.

2. **¿Por qué `ProductoController` o `MineroController` dependen de la interfaz y no de la implementación directamente?**
   * Para cumplir con la Inversión de Dependencias (D). Permite cambiar o extender la implementación de la capa de servicio sin modificar una sola línea del controlador HTTP.

3. **¿Qué significa que un Service esté "abierto a extensión, cerrado a modificación"?**
   * Significa que se pueden agregar nuevas funcionalidades o comportamientos (como almacenamiento en caché o auditoría) mediante nuevas clases que implementen la interfaz, sin alterar el código fuente existente.

4. **¿Por qué la relación entre transacciones y minero no es una violación de `ModularityTests`?**
   * Porque ambos paquetes (`acopiador` y `parametros`) pertenecen al mismo módulo funcional de negocio (`pe.edu.upeu.bomerp.acopio`). Spring Modulith verifica fronteras entre módulos distintos, no dentro de paquetes internos del mismo módulo.

5. **¿Qué diferencia hay entre exponer una entidad JPA directamente y exponer un DTO?**
   * Exponer la entidad JPA acopla la API a la base de datos, arriesga la fuga de datos sensibles y puede causar ciclos de serialización infinita. Un DTO abstrae y expone únicamente los campos requeridos por el contrato REST.

---

## 5. ANEXO: FEEDBACK DE LA SESIÓN S03

1. **Integrantes del Equipo 05:**
   * Jhymel Nelio Figueroa Chambi (Presentador de este informe)
   * Helio Calisaya

2. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**
   * Evaluar objetivamente el código real del backend utilizando los principios SOLID y distinguir acoplamientos aceptables de violaciones arquitectónicas reales.

3. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**
   * La diferencia entre acoplamiento entre clases vs acoplamiento entre contratos de DTOs.

4. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**
   * ¿Cómo se reflejan estos principios SOLID al migrar de un monolito modular a una arquitectura hexagonal o microservicios en S4?

5. **Sobre tu nivel de comprensión de la clase de hoy, marca una opción:**
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**

6. **Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?:**
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**

7. **Mi satisfacción con la clase fue:**
   * **10** (Muy satisfecho)
