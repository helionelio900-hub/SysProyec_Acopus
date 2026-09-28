package pe.edu.upeu.sitraoro.seguridad.dto;

public record TokenResponse(String accessToken, String tokenType, long expiresInSeconds) {}
