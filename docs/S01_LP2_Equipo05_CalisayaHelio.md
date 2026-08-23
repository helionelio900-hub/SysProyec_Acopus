# INFORME DE EVIDENCIA INDIVIDUAL - SESIÓN S01
## CURSO: LENGUAJE DE PROGRAMACIÓN II (LP2)

**Nombre del Archivo Entregable:** `S01_LP2_Equipo05_CalisayaHelio.pdf`

---

## DATOS DEL ESTUDIANTE

* **Nombre:** Helio Calisaya
* **Equipo:** Equipo 05 - Proyecto `bomerp-acopio-oro`
* **Sesión:** S01 - Arquitectura Backend REST Profesional
* **Rol o Aporte Realizado:** Desarrollador Backend & Arquitecto de Base de Datos
* **Link de GitHub del Proyecto:** [https://github.com/helionelio900-hub/SysProyec_Acopus](https://github.com/helionelio900-hub/SysProyec_Acopus)

---

## EVIDENCIA TÉCNICA (EVALUADA SOBRE RÚBRICA 4.6)

### BLOQUE 1: Ejecución y Configuración Reproducible (Peso: 20%)

1. **Ejecución del Backend:**
   * El backend fue construido y ejecutado usando Java 21 y el wrapper oficial de Maven (`.\mvnw.cmd spring-boot:run`).
   * **Resultado de Compilación:** `BUILD SUCCESS` (0 errores de compilación).
   * **Endpoint de Verificación Actuador / Health:** `GET http://localhost:8080/actuator/health` responde con estado `{"status":"UP"}`.

2. **Configuración por Ambiente sin Secretos Expuestos:**
   * Se utilizó la configuración por ambiente local `application-dev.yml` en `src/main/resources/`.
   * **Seguridad:** Las credenciales pertenecen al entorno de desarrollo en laptop (`BOMERP_APP` / `123456`), sin exponer secretos de producción ni claves privadas.

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:oracle:thin:@localhost:1521/XEPDB1
    username: BOMERP_APP
    password: 123456
    driver-class-name: oracle.jdbc.OracleDriver
  jpa:
    database-platform: org.hibernate.dialect.OracleDialect
    hibernate:
      ddl-auto: validate
    show-sql: true
```

---

### BLOQUE 2: Conexión a Base de Datos Verificada (Peso: 20%)

1. **Conexión a Oracle Database:**
   * Se ejecutaron los scripts DDL en la base de datos Oracle XE/23ai:
     - `bd2/S01_01_esquemas.sql`: Creación del esquema propietario `BOM_ACOPIO` y el usuario de la aplicación `BOMERP_APP`.
     - `bd2/S01_02_tablas.sql`: Creación de las 4 tablas principales (`PARAMETROS_SISTEMA`, `MINEROS`, `TRANSACCIONES_G2`, `LIQUIDACIONES_G1`).
   * Se otorgaron permisos de lectura y escritura (`GRANT SELECT, INSERT, UPDATE, DELETE`) a `BOMERP_APP`.

2. **Verificación de Reglas de Negocio en BD:**
   * Restricción `CHECK (TIPO_ORO IN ('ROJO', 'VERDE'))` comprobada para evitar la mezcla de categorías.

---

### BLOQUE 3: Recursos, Endpoints y DTO Coherentes (Peso: 20%)

1. **Tabla de Contratos REST Versionados (`/api/v1/...`):**

| Módulo | Método | Endpoint HTTP | DTO Request | DTO Response |
|---|:---:|---|---|---|
| **Módulo 1: Seguridad** | `POST` | `/api/v1/auth/login` | `AuthRequest` | `AuthResponse` |
| **Módulo 2: Cotizador** | `GET` | `/api/v1/cotizador/estimar` | `pesoBrutoGramos` (Query) | `CotizacionEstimadaResponse` |
| **Módulo 3: Acopio G2** | `POST` | `/api/v1/acopio/transacciones` | `TransaccionG2Request` | `TransaccionG2Response` |
| **Módulo 3: Acopio G2** | `GET` | `/api/v1/acopio/acumulados-semanales` | — | `AcumuladosG2Response` |
| **Módulo 4: Mayorista G1** | `POST` | `/api/v1/mayorista/liquidaciones` | `LiquidacionG1Request` | `LiquidacionG1Response` |
| **Módulo 5: Dashboard** | `GET` | `/api/v1/dashboard/consolidado` | — | `DashboardResponse` |

2. **Ejemplos de Respuestas JSON DTO (Java 21 `record`):**

* **Módulo 2 (Cotizador Minero):**
```json
{
  "pesoBrutoGramos": 20.0,
  "porcentajeMermaEstimada": 5.00,
  "pesoNetoEstimadoGramos": 19.000,
  "precioGramoDiaPen": 280.00,
  "montoEstimadoTotalPen": 5320.00,
  "mensaje": "Cotización estimativa rápida. Esta sesión concluye al mostrar el resultado (no persiste transacción en BD)."
}
```

* **Módulo 3 (Acopio G2 - Sumatorias por Color):**
```json
{
  "totalGramosRojo": 150.500,
  "totalDineroRojoPen": 42140.00,
  "totalGramosVerde": 80.200,
  "totalDineroVerdePen": 23578.80
}
```

---

### BLOQUE 4: Documentación OpenAPI y Versionado (Peso: 20%)

1. **OpenAPI / Swagger UI Navegable:**
   * Acceso disponible en: `http://localhost:8080/swagger-ui.html`
   * Muestra la especificación interactiva de los 5 módulos etiquetados (`@Tag`).

2. **Versionado de la API (`/api/v1/...`):**
   * Todos los endpoints incluyen el prefijo de versión `/api/v1/`. Esto garantiza que cambios futuros en los contratos de liquidación no rompan la compatibilidad con versiones anteriores de aplicaciones móviles o SPAs.

---

### BLOQUE 5: Estructura Modular Verificada con Spring Modulith (Peso: 20%)

1. **Organización por Responsabilidades (`pe.edu.upeu.bomerp.acopio`):**
   * Cada módulo funcional se encuentra encapsulado en su propio paquete:
     - `seguridad`: Autenticación, JWT, Roles.
     - `cotizador`: Consultas estimativas públicas.
     - `acopiador`: Transacciones presenciales de compra G2.
     - `mayorista`: Cierres y liquidaciones semanales G1.
     - `parametros`: Precios del día, mineros y Dashboard.

2. **Prueba de Modularidad (`ModularityTests`):**
   * Se ejecutó el test de verificación de límites de Spring Modulith obteniendo resultado en **VERDE**:
   ```java
   @Test
   void verifyModularity() {
       ApplicationModules.of(BomerpBackendApplication.class).verify();
   }
   ```

---

## RESPUESTAS A LAS PREGUNTAS DE DEFENSA (SECCIÓN 4.5)

1. **¿Cómo se reproduce la ejecución del backend en otro equipo?**
   * Clonando el repositorio con `git clone`, asegurándose de tener Java 21 instalado y ejecutando `.\mvnw.cmd spring-boot:run` (o `./mvnw spring-boot:run`). El Maven Wrapper descarga automáticamente las dependencias exactas sin instalar Maven global.

2. **¿Cómo se configura la conexión sin publicar credenciales?**
   * Utilizando perfiles de configuración desacoplados (`application-dev.yml` / `application-prod.yml`) e inyectando variables de entorno en producción para evitar incluir contraseñas reales en el control de versiones.

3. **¿Qué comprueba el endpoint de verificación?**
   * Comprueba que la aplicación Spring Boot esté activa y respondiendo HTTP 200 OK (`/actuator/health`), verificando la disponibilidad de la JVM y del pool de conexiones HikariCP.

4. **¿Qué diferencia hay entre DTO y entidad persistente?**
   * La entidad persistente (`@Entity`) representa la tabla en la base de datos Oracle. El DTO (`record`) representa la estructura de datos expuesta al cliente REST, desacoplando el modelo interno y evitando problemas de rendimiento como serializaciones infinitas o N+1.

5. **¿Por qué `/api/v1/...` cuenta como versionado de API, aunque todavía no exista una v2?**
   * Porque establece un contrato de API explicito desde el día uno, permitiendo evolucionar a `/api/v2/` en el futuro sin interrumpir a los clientes que consumen la v1.

6. **¿Qué pasaría si `mayorista` importara directamente el Repository de `acopiador`? ¿Qué lo impide?**
   * Acoplaría directamente el módulo `mayorista` con la persistencia interna de `acopiador`, violando la encapsulación. Lo impide **Spring Modulith** mediante `ModularityTests`, el cual hace fallar las pruebas unitarias en la compilación si un módulo accede directamente al repository o entidad de otro.

---

## ERROR O HALLAZGO TÉCNICO DIAGNOSTICADO

* **Hallazgo:** Inicialmente existía el riesgo de que el cálculo del precio por gramo en las liquidaciones mayoristas (`G1`) sufriera desviaciones por el uso de punto flotante `double`.
* **Solución Aplicada:** Se corrigió forzando el uso exclusivo de `java.math.BigDecimal` con redondeo bancario `RoundingMode.HALF_UP` y precisión a 4 decimales en operaciones intermedias de conversión Onza USD / Tipo Cambio PEN, garantizando exactitud financiera a 2 decimales en el total pagado.

---

## REFLEXIÓN TÉCNICA BREVE (5 A 8 LÍNEAS)

La ejecución reproducible en diferentes ambientes se logra mediante la estandarización del entorno de ejecución con Java 21 y el uso obligatorio del Maven Wrapper (`mvnw`), el cual garantiza que todos los desarrolladores compilen exactamente con la misma versión de herramientas sin depender de configuraciones globales del sistema operativo. Además, la separación de la configuración en perfiles (`application-dev.yml`) inyectando variables de entorno permite migrar el backend entre entornos de desarrollo, pruebas y producción sin modificar una sola línea de código fuente. Finalmente, la verificación estricta de modularidad con Spring Modulith asegura que la arquitectura se mantenga limpia a medida que el proyecto escala.

---

## ANEXO: FEEDBACK DE LA SESIÓN

1. **¿Cuál es el aprendizaje más importante que te llevas de la clase de hoy?**
   * La importancia de utilizar Spring Modulith para verificar automáticamente los límites de los módulos de negocio y evitar el acoplamiento no deseado.

2. **¿Qué punto de la clase te resultó más confuso o te dejó con dudas?**
   * La gestión de permisos entre el usuario dueño del esquema en Oracle (`BOM_ACOPIO`) y el usuario ejecutor del backend (`BOMERP_APP`).

3. **¿Tienes alguna pregunta que te gustaría que sea respondida la siguiente clase?**
   * ¿Cómo manejaremos la expiración y renovación de tokens JWT cuando integremos la SPA en la Unidad 2?

4. **Nivel de comprensión de la clase de hoy:**
   * [X] **¡Entendido! - Lo domino y podría explicarlo.**

5. **Autoevaluación de participación y esfuerzo:**
   * [X] **Muy Comprometido/a: Me esforcé al máximo.**

6. **Calificación de satisfacción con la clase (1 a 10):**
   * **10**
