# Compra de acopio con cabecera y detalle

## Flujo implementado

En **Acopio → Preparar entrega → Agregar compra**, el acopiador selecciona al minero una sola vez y agrega entre 1 y 200 partidas. Cada partida registra peso recibido, peso fundido y precio por gramo. Puede usar el precio publicado o un precio excepcional propio.

El formulario muestra el importe estimado de cada fila y su suma. **Revisar y guardar compra** abre una confirmación. **Confirmar compra** envía una sola petición al servidor, que calcula los importes con `BigDecimal`, guarda una cabecera y sus detalles dentro de una transacción, y devuelve el total confirmado.

El historial permite desplegar cada compra y consultar todas sus partidas. El envío al mayorista continúa seleccionando partidas disponibles; las partidas muestran a qué compra pertenecen. Editar o anular una partida conserva su vínculo con la cabecera.

## Persistencia y compatibilidad

- `COMPRAS_G2`: cabecera con minero, centro de acopio y fecha asignada por el servidor.
- `TRANSACCIONES_G2.ID_COMPRA_G2`: vínculo de cada partida con la cabecera. Las columnas previas se conservan para compatibilidad con los módulos existentes.
- Las operaciones históricas conservan sus IDs y vínculos. Las que no tienen cabecera nueva se presentan como registros anteriores.
- `POST /api/v1/acopio/compras`: registra la cabecera con `detalles[]`.
- `GET /api/v1/acopio/compras`: devuelve compras y partidas únicamente del centro autenticado.

La relación cabecera → partidas es 1 a N. Este incremento no crea un catálogo de leyes ni acredita por sí solo la relación N a N con un catálogo. Por decisión del flujo acordado, Acopio mantiene rojo/verde como grupos y recibe el precio; los datos de valorización se tratarán en Mayorista.

## Activación en Oracle

Ejecutar `bd2/S09_05_compras_cabecera_detalle.sql` conectado al esquema de SITRA que ya tenga aplicadas las migraciones anteriores. El script comprueba requisitos y es repetible. Agrega estructura; no borra registros ni transforma compras anteriores.

Después, reiniciar el backend con Java 21. El frontend ya utiliza los nuevos endpoints.

La base real del backend es **Oracle local en localhost:1521/XEPDB1**, esquema `BOMERP_APP`. El contenedor `sitra-oro-oracle` del puerto 1522 es otra instancia y no era la conexión que usaba la aplicación.

La migración se aplicó en la base real el 09/10/2026. Se verificaron **34 partidas y 9 mineros antes y después**, la tabla `COMPRAS_G2` y el vínculo `TRANSACCIONES_G2.ID_COMPRA_G2`. El backend existente se reinició mediante DevTools y `/actuator/health` respondió `UP` con base `Oracle`.

## Comprobaciones realizadas

El frontend compiló con `npm run build`. El backend compiló con Java 21. Pasaron 13 pruebas: 10 del controlador y 3 del guardado en H2. Cubren varias partidas con precios independientes, una sola partida, rechazo de una compra inválida sin registros parciales, validación del detalle y permisos del rol.

La estructura y el arranque se comprobaron en Oracle real. El usuario debe revisar el formulario en su sesión de Firefox; las pruebas automáticas del guardado se realizaron en H2 y no insertaron compras de prueba en Oracle.
