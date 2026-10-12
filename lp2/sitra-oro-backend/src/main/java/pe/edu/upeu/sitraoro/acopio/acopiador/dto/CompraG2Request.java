package pe.edu.upeu.sitraoro.acopio.acopiador.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CompraG2Request(
    @NotNull @Positive Long idMinero,
    @NotEmpty @Size(max = 200) List<@NotNull @Valid PartidaCompraRequest> detalles,
    @Positive Long idSolicitud
) {
    public CompraG2Request(Long idMinero, List<PartidaCompraRequest> detalles) {
        this(idMinero, detalles, null);
    }
}
