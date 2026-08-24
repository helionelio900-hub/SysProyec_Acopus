package pe.edu.upeu.bomerp.acopio.parametros.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MineroResponse {
    private Long idMinero;
    private String documentoIdentidad;
    private String nombresApellidos;
    private String telefono;
    private String zonaProcedencia;
    private LocalDateTime fechaRegistro;
}
