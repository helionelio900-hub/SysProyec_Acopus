package pe.edu.upeu.bomerp.acopio.acopiador.service;

import java.math.BigDecimal;

/**
 * Contrato de Estrategia para el cálculo del precio por gramo de oro.
 * Aplica los Principios SOLID:
 * - S (Single Responsibility): Aísla la lógica de determinación de precios.
 * - O (Open/Closed): Permite agregar nuevas fuentes de precio (ej. API internacional) sin modificar el servicio principal.
 * - D (Dependency Inversion): AcopiadorServiceImpl depende de esta interfaz, no de una clase concreta.
 */
public interface CalculadorPrecioOroService {
    BigDecimal determinarPrecioAplicado(BigDecimal precioSolicitado);
}
