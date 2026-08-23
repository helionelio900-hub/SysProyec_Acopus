package pe.edu.upeu.bomerp.acopio.seguridad.dto;

import java.util.List;

public record AuthResponse(
    String token,
    String tokenType,
    String username,
    List<String> roles
) {}
