package pe.edu.upeu.sitraoro.acopio.minero.service;

import pe.edu.upeu.sitraoro.acopio.minero.dto.CambiarCentroRequest;
import pe.edu.upeu.sitraoro.acopio.minero.dto.PerfilMineroResponse;
import pe.edu.upeu.sitraoro.acopio.minero.dto.RegistroMineroRequest;
import pe.edu.upeu.sitraoro.acopio.minero.dto.RegistroMineroResponse;

public interface MineroPortalService {
    RegistroMineroResponse registrar(RegistroMineroRequest request);
    PerfilMineroResponse obtenerPerfil(String documentoIdentidad);
    PerfilMineroResponse cambiarCentro(String documentoIdentidad, CambiarCentroRequest request);
}
