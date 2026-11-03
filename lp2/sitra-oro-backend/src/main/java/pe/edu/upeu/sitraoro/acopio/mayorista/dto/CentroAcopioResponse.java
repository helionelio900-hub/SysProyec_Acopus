package pe.edu.upeu.sitraoro.acopio.mayorista.dto;

import java.io.Serializable;

public record CentroAcopioResponse(Long idCentroAcopio, String nombre, String zona,
                                   String direccion, String telefono, boolean activo) implements Serializable {}
