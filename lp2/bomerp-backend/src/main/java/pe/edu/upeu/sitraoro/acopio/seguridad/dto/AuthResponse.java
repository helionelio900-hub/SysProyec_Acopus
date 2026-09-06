package pe.edu.upeu.sitraoro.acopio.seguridad.dto;

import java.util.List;

public record AuthResponse(
    String token,
    String tokenType,
    String username,
    List<String> roles
) {}
