# INFORME DE EVIDENCIA INDIVIDUAL - SESIÓN S03 (ADS)
## CURSO: ANÁLISIS Y DISEÑO DE SISTEMAS (ADS)

**Nombre del Archivo Entregable:** `S03_ADS_Equipo05_FigueroaJhymel.pdf`

---

## 1. DATOS DEL ESTUDIANTE

* **Nombre del Estudiante:** Jhymel Nelio Figueroa Chambi
* **Compañero de Equipo:** Helio Calisaya
* **Equipo:** Equipo 05 - Proyecto `bomerp-acopio-oro`
* **Sesión:** S03 - Diseño Estructural y Principios SOLID
* **Rol o Aporte Realizado:** Evaluación Arquitectónica, Análisis SOLID e Implementación de Refactorización SOLID (`CalculadorPrecioOroService`) sobre el backend de Acopio de Oro.
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
| `AcopiadorServiceImpl` | Orquestar el registro de compra directa de oro (`TransaccionG2`) y desembolsos. | **Sí** | Delega la determinación de precios a `CalculadorPrecioOroService`. |
| `CalculadorPrecioOroService` | Interfaz de estrategia para determinar el precio por gramo de oro. | **Sí** | Aísla la regla de cálculo de precios del resto del flujo transaccional. |
| `CalculadorPrecioOficialImpl` | Estrategia de determinación de precios desde `PARAMETROS_SISTEMA` u oficial. | **Sí** | Implementación concreta de la estrategia de precios. |
| `TransaccionG2Repository` | Acceso a datos de `TRANSACCIONES_G2` y agregaciones SQL por tipo de oro (Rojo/Verde). | **Sí** | Interface de persistencia Spring Data JPA. |
| `TransaccionG2Mapper` | Mapeo de `TransaccionG2Request` y `Minero` $\rightarrow$ `TransaccionG2` $\rightarrow$ `TransaccionG2Response`. | **Sí** | Interface MapStruct delegando mapeos de minero a `MineroMapper`. |
| `TransaccionG2` (Entidad) | Representar el modelo de datos de compras de oro en Oracle (`BOM_ACOPIO.TRANSACCIONES_G2`). | **Sí** | Mapeo ORM JPA con `@ManyToOne` unidireccional. |

---

### 2.2 Abierto/Cerrado (O), Liskov (L) e Interfaces (I)

1. **Open/Closed Principle (O)**:
   - `MineroService`, `AcopiadorService` y `CalculadorPrecioOroService` son interfaces Java.
   - Permiten extender el comportamiento agregando nuevas implementaciones (ej. `CalculadorPrecioAPIInternacionalImpl` para cotizaciones internacionales en tiempo real) sin modificar `AcopiadorServiceImpl` ni romper código existente.

2. **Liskov Substitution Principle (L)**:
   - Cualquier implementación alternativa de `CalculadorPrecioOroService` sustituye a `CalculadorPrecioOficialImpl` garantizando un retorno `BigDecimal` válido $> 0$, sin alterar el comportamiento esperado del controlador.

3. **Interface Segregation Principle (I)**:
   - Las interfaces `MineroService`, `AcopiadorService` y `CalculadorPrecioOroService` declaran únicamente los métodos específicos consumidos por sus clientes. No existen métodos inflados ni forzados.

---

### 2.3 Inversión de Dependencias (D) con Código Real

Todas las dependencias en los controladores y servicios del módulo de acopio se inyectan como **interfaces** mediante `@RequiredArgsConstructor` (Constructor Injection). En ningún punto se utiliza la palabra clave `new` para instanciar repositorios, mappers o servicios concretos:

```java
@Service
@RequiredArgsConstructor
public class AcopiadorServiceImpl implements AcopiadorService {
    private final TransaccionG2Repository transaccionG2Repository; // Interfaz Spring Data JPA
    private final MineroRepository mineroRepository; // Interfaz Spring Data JPA
    private final CalculadorPrecioOroService calculadorPrecioOroService; // Interfaz de estrategia de precios
    private final TransaccionG2Mapper transaccionG2Mapper; // Interfaz MapStruct
}
```

---

### 2.4 Cohesión, Acoplamiento, Modularidad y Abstracción

1. **Cohesión por Paquete (Alta Cohesión)**:
   - `pe.edu.upeu.bomerp.acopio.parametros`: Contiene únicamente las clases de la entidad `Minero` y parámetros del sistema. Alta cohesión temática.
   - `pe.edu.upeu.bomerp.acopio.acopiador`: Contiene únicamente la lógica de registro de transacciones de compra directa de oro (`TransaccionG2`) y la estrategia de precios.

2. **Acoplamiento entre Paquetes (Tensión de Diseño Identificada)**:
   - `AcopiadorServiceImpl` depende de `MineroRepository` para validar que el `idMinero` referenciado exista. Puesto que ambos paquetes pertenecen al mismo módulo funcional (`acopio`), este acoplamiento interno es aceptable.
   - En contratos, `TransaccionG2Response` embebe `MineroResumen` (DTO liviano con `idMinero`, `documentoIdentidad`, `nombresApellidos`), evitando depender del DTO completo `MineroResponse`.

3. **Modularidad y Abstracción**:
   - **Modularidad**: Verificada automáticamente por Spring Modulith (`ModularityTests.java`).
   - **Abstracción**: Las entidades JPA (`Minero`, `TransaccionG2`) nunca se exponen en la API REST pública, garantizando el aislamiento mediante DTOs.

---

### 2.5 Refactorización SOLID Realizada

* **Descripción**: Se aplicó una refactorización basada en el patrón Strategy aislando la lógica de precios mediante la interfaz `CalculadorPrecioOroService` y su implementación `CalculadorPrecioOficialImpl`.
* **Impacto**: Se fortalecieron los principios **S**, **O** y **D** en el módulo transaccional de acopio.

---

## 3. REFLEXIÓN TÉCNICA BREVE (5 A 8 LÍNEAS)

El acoplamiento entre dos paquetes del mismo módulo no es automáticamente una violación de diseño porque ambos pertenecen al mismo dominio de negocio y comparten un ciclo de vida conjunto. A diferencia de dos módulos distintos (donde Spring Modulith exige comunicarse únicamente a través de servicios públicos e impone un aislamiento estricto), los paquetes internos de un mismo módulo pueden colaborar directamente para evitar capas de abstracción innecesarias. Sin embargo, para mantener la mantenibilidad, es recomendable acoplarse preferentemente hacia interfaces o servicios públicos del paquete hermano en lugar de acceder directamente a sus repositorios internos.

---

## 4. RESPUESTAS A LAS PREGUNTAS DE DEFENSA (SESIÓN S03 ADS)

1. **¿Qué diferencia hay entre una violación real de SOLID y una tensión de diseño aceptable?**
   * Una violación real degrada la mantenibilidad. Una tensión de diseño es un acoplamiento intencional y justificado dentro del mismo módulo funcional para simplificar la arquitectura sin violar límites modulares.

2. **¿Por qué `MineroController` o `AcopiadorServiceImpl` dependen de interfaces y no de clases concretas?**
   * Para cumplir con la Inversión de Dependencias (D). Permite cambiar o extender la implementación sin modificar una sola línea de código en el cliente consumidor.

3. **¿Qué significa que un Service esté "abierto a extensión, cerrado a modificación"?**
   * Significa que se pueden agregar nuevas funcionalidades o estrategias (como `CalculadorPrecioAPIInternacionalImpl`) mediante nuevas clases que implementen la interfaz, sin alterar el código fuente existente.

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
   * Evaluar e implementar activamente los principios SOLID sobre el código real del backend mediante refactorización basada en interfaces.

3. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**
   * La aplicación de patrones de estrategia (Open/Closed) en servicios transaccionales.

4. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**
   * ¿Cómo se reflejan estos principios SOLID al migrar de un monolito modular a una arquitectura hexagonal o microservicios en S4?

5. **Sobre tu nivel de comprensión de la clase de hoy, marca una opción:**
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**

6. **Pensando en tu participación y esfuerzo en la clase de hoy, ¿cómo te autoevaluarías?:**
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**

7. **Mi satisfacción con la clase fue:**
   * **10** (Muy satisfecho)
