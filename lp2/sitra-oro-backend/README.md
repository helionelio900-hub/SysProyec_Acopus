# sitra-oro-backend

Backend de **SITRA-ORO** (*Sistema de Información, Trazabilidad y Liquidación en Acopio de Oro*): Spring Boot 4.0.7 + Spring Modulith.

**Estado actual (Unidad I, S1-S5):** Backend REST con los módulos funcionales
`acopiador`, `mayorista`, `cotizador` y `parametros`, operación cabecera-detalle,
consultas, reportes, CORS, logs y pruebas. La seguridad JWT se implementará en S10.

## Prerrequisitos

- **Java 21** — único requisito local. No instalar Maven aparte: el
  proyecto trae Maven Wrapper (`mvnw` / `mvnw.cmd`), que descarga y cachea
  la versión exacta de Maven (3.9.9) sola.
- **Docker** (para el contenedor Oracle local — ver más abajo).

## Levantar el ambiente local

1. Levantar la base de datos Oracle:

   ```bash
   docker compose -f compose-dev.yml up -d
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

   Usa el perfil `dev` (`application-dev.yml`) por defecto — conecta a
   `jdbc:oracle:thin:@localhost:1521/XEPDB1` y expone la API en el puerto 8081.

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
`http://localhost:8081/swagger-ui.html` (vía `springdoc-openapi`).

## Avanzar por sesión

Para implementar el incremento de una sesión específica (S1 a S16), usa el
skill `lp2-sesion` (`../.claude/skills/lp2-sesion/SKILL.md`) en vez de
codificar directamente — aplica solo el alcance de esa sesión y verifica
con los comandos de esta misma sección.
