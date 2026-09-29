# Ejemplo UML de acopio de oro

Proyecto Java independiente para abrir en IntelliJ IDEA. Sirve para ver cómo
las clases y relaciones del diagrama UML se traducen a objetos Java. No forma
parte del backend del sistema SITRA-ORO.

## Abrir en IntelliJ IDEA

1. Selecciona **File → Open**.
2. Abre la carpeta `ejemploUml` o su archivo `pom.xml`.
3. Acepta la importación como proyecto Maven.
4. Ejecuta `pe.edu.upeu.ejemplouml.App` desde la carpeta `src/main/java`.

El proyecto requiere Java 8 o superior y no usa bibliotecas externas.

## Clases y relaciones

- `Minero` mantiene sus compras: un minero puede realizar varias.
- Cada `CompraAcopio` pertenece a un minero y clasifica el oro con `TipoOro`.
- `LiquidacionMayorista` contiene los detalles de cierre mediante composición.
- `EstadoLiquidacion` representa los estados permitidos de la liquidación.
- `App` crea un ejemplo de compra y liquidación y muestra el cálculo por
  consola.

Para simplificar la demostración, este ejemplo Java usa nombres funcionales y
referencias entre objetos. El backend actual conserva otros identificadores y
algunos vínculos como claves numéricas.
