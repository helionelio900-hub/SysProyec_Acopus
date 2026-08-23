# bomerp-backend

Backend único de LP2 (BomERP): Spring Boot 4.0.7 + Spring Modulith, sin
reactor multi-módulo. Ver [`../CLAUDE.md`](../CLAUDE.md) para las
convenciones de arquitectura completas y [`../../docs/lp2/adr/`](../../docs/lp2/adr/)
para las decisiones registradas (ADR-001 a ADR-003).

**Estado actual:** solo el scaffold de Spring Initializr (`BomerpBackendApplication`,
`HelloController` de ejemplo, `OpenApiConfig`). El módulo `catalogo` de S1
(categoría/producto) y `ModularityTests` todavía no existen — se crean al
ejecutar la sesión S1 (ver skill `lp2-sesion`).

## Prerrequisitos

- **Java 21** — único requisito local. No instalar Maven aparte: el
  proyecto trae Maven Wrapper (`mvnw` / `mvnw.cmd`), que descarga y cachea
  la versión exacta de Maven (3.9.9) sola.
- **Docker** (para el contenedor Oracle local — ver más abajo).

## Levantar el ambiente local

1. Levantar la base de datos Oracle:

   ```bash
   docker compose -f compose-local.yml up -d
   ```

   Crea el contenedor `bomerp-oracle` (`gvenzl/oracle-free:23-slim`), puerto
   `1521`, con el usuario de aplicación `BOMERP_APP` (contraseña `123456`,
   valor de laptop en texto plano — no es secreto real, ver `../CLAUDE.md`
   sección "Ambientes").

2. Ejecutar la aplicación:

   ```bash
   # Windows
   .\mvnw.cmd spring-boot:run

   # macOS/Linux
   ./mvnw spring-boot:run
   ```

   Usa el perfil `local` (`application-local.yml`) por defecto — conecta a
   `jdbc:oracle:thin:@localhost:1521/FREEPDB1`.

## Verificar

```bash
# Windows
.\mvnw.cmd clean test

# macOS/Linux
./mvnw clean test
```

Compila y corre las pruebas, incluida `ModularityTests` (verifica los
límites entre módulos de Spring Modulith) una vez que exista — no requiere
Oracle levantado para ese chequeo estructural. Las pruebas que sí requieren
datos reales necesitan el contenedor Oracle del paso 1.

## Documentación de la API

Con la aplicación corriendo, Swagger UI queda disponible en
`http://localhost:8080/swagger-ui.html` (vía `springdoc-openapi`).

## Avanzar por sesión

Para implementar el incremento de una sesión específica (S1 a S16), usa el
skill `lp2-sesion` (`../.claude/skills/lp2-sesion/SKILL.md`) en vez de
codificar directamente — aplica solo el alcance de esa sesión y verifica
con los comandos de esta misma sección.
