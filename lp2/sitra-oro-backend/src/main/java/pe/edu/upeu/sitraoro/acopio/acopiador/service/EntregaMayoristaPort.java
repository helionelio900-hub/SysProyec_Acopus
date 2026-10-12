package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import pe.edu.upeu.sitraoro.acopio.acopiador.dto.EntregaMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.ReporteEntregasAcopiadorResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Puerto que desacopla la invocación de traspaso de compras hacia el módulo mayorista,
 * evitando ciclos de dependencia arquitectónica en Spring Modulith.
 */
public interface EntregaMayoristaPort {
    EntregaMayoristaResponse registrarDesdeAcopiador(Long idCentroAcopio, List<Long> idsCompras);
    ReporteEntregasAcopiadorResponse reporteAcopiador(Long idCentroAcopio, LocalDate desde, LocalDate hasta);
}
