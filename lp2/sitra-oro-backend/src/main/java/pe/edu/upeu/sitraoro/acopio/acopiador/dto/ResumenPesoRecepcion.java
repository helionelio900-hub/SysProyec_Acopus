package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import java.math.BigDecimal;

public record ResumenPesoRecepcion(
        BigDecimal rojoFundido,
        BigDecimal verdeFundido
) {}
