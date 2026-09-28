package pe.edu.upeu.sitraoro.acopio.minero.dto;

public record PerfilMineroResponse(Long idMinero, String documentoIdentidad,
                                   String nombresApellidos, String telefono,
                                   String zonaProcedencia, Long idCentroAcopioPreferido) {}
