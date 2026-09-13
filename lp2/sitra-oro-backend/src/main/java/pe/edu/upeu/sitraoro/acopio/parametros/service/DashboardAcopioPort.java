package pe.edu.upeu.sitraoro.acopio.parametros.service;

import pe.edu.upeu.sitraoro.acopio.parametros.dto.DashboardResponse;

/**
 * Puerto de lectura del consolidado. Parámetros define el contrato y Acopiador
 * aporta la implementación sin exponer su repositorio.
 */
public interface DashboardAcopioPort {

    DashboardResponse obtenerConsolidado();
}
