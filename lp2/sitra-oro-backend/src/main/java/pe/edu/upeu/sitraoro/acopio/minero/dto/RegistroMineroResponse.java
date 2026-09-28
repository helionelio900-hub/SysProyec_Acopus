package pe.edu.upeu.sitraoro.acopio.minero.dto;

public record RegistroMineroResponse(Long idMinero, String documentoIdentidad,
                                     String estadoCuenta, String mensaje) {}
