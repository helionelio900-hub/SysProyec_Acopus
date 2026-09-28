package pe.edu.upeu.sitraoro.seguridad.service;

import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;
import java.util.List;

public interface CuentaAccesoService {
    CuentaResumen crearCuenta(String documentoIdentidad, String clave, RolCuenta rol,
                              Long idMinero, Long idCentroAcopioPreferido, boolean activo);
    CuentaResumen obtenerPorDocumento(String documentoIdentidad);
    boolean existeCuenta(String documentoIdentidad);
    CuentaResumen autenticar(String documentoIdentidad, String clave);
    List<SolicitudCuentaMinero> listarSolicitudesMinero(Long idCentroAcopio);
    void aprobarSolicitudMinero(String documentoIdentidad, Long idCentroAcopio);
    void actualizarCentroPreferido(String documentoIdentidad, Long idCentroAcopio);
    void asignarCentroAcopiador(Long idCuenta, Long idCentroAcopio);
}
