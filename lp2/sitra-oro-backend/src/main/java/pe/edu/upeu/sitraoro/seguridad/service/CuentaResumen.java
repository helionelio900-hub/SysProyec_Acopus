package pe.edu.upeu.sitraoro.seguridad.service;

import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;

public record CuentaResumen(Long idCuenta, String documentoIdentidad, RolCuenta rol,
                            Long idMinero, Long idCentroAcopioPreferido,
                            Long idCentroAcopioAsignado, boolean activo) {}
