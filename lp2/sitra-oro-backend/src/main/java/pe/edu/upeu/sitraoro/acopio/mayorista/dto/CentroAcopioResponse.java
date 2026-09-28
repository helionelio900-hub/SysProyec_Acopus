package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

public record CentroAcopioResponse(Long idCentroAcopio, String nombre, String zona,
                                   String direccion, String telefono, boolean activo) {}
