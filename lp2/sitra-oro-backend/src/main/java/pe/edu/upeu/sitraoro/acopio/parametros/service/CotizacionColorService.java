package pe.edu.upeu.sitraoro.acopio.parametros.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class CotizacionColorService {
    private final JdbcTemplate jdbc;
    public record Precio(String color, BigDecimal precioGramoPen, LocalDateTime fechaPublicacion) {}

    @Transactional(readOnly = true)
    public List<Precio> vigentes() {
        return jdbc.query("SELECT COLOR, PRECIO_GRAMO_PEN, FECHA_PUBLICACION FROM COTIZACIONES_COLOR c WHERE ID_COTIZACION = (SELECT MAX(ID_COTIZACION) FROM COTIZACIONES_COLOR WHERE COLOR = c.COLOR) ORDER BY COLOR",
                (fila, numero) -> new Precio(fila.getString(1), fila.getBigDecimal(2), fila.getTimestamp(3).toLocalDateTime()));
    }

    public BigDecimal precio(String color) {
        return vigentes().stream().filter(item -> item.color().equals(color)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("El mayorista aún no publicó la cotización de oro " + color)).precioGramoPen();
    }

    public static BigDecimal calcular(String color, BigDecimal onza, BigDecimal dolar, BigDecimal porcentaje) {
        return calcular(color, onza, dolar, porcentaje, new BigDecimal("ROJO".equals(color) ? "90" : "80"));
    }
    public static BigDecimal calcular(String color, BigDecimal onza, BigDecimal dolar, BigDecimal porcentaje, BigDecimal ley) {
        if (ley == null || ley.signum() <= 0 || ley.compareTo(new BigDecimal("100")) > 0)
            throw new IllegalArgumentException("La ley debe ser mayor que cero y hasta 100");
        if (onza == null || dolar == null || porcentaje == null || onza.signum() <= 0 || dolar.signum() <= 0
                || porcentaje.signum() < 0 || porcentaje.compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Onza y dólar deben ser positivos; exportación debe estar entre 0 y 100");
        }
        if (!"ROJO".equals(color) && !"VERDE".equals(color)) throw new IllegalArgumentException("Selecciona rojo o verde");
        return onza.multiply(dolar).multiply(ley.movePointLeft(2))
                .multiply(BigDecimal.ONE.subtract(porcentaje.movePointLeft(2)))
                .divide(new BigDecimal("31.0999"), 2, RoundingMode.HALF_UP);
    }

    @Transactional
    public List<Precio> publicar(BigDecimal onza, BigDecimal dolar, BigDecimal rojo, BigDecimal verde) {
        return publicar(onza,dolar,rojo,verde,new BigDecimal("90"),new BigDecimal("80"));
    }
    @Transactional
    public List<Precio> publicar(BigDecimal onza, BigDecimal dolar, BigDecimal rojo, BigDecimal verde, BigDecimal leyRojo, BigDecimal leyVerde) {
        BigDecimal precioRojo = calcular("ROJO", onza, dolar, rojo, leyRojo);
        BigDecimal precioVerde = calcular("VERDE", onza, dolar, verde, leyVerde);
        Timestamp fecha = Timestamp.valueOf(LocalDateTime.now(java.time.ZoneId.of("America/Lima")));
        guardar("ROJO", onza, dolar, rojo, precioRojo, fecha, leyRojo);
        guardar("VERDE", onza, dolar, verde, precioVerde, fecha, leyVerde);
        return vigentes();
    }
    private void guardar(String color, BigDecimal onza, BigDecimal dolar, BigDecimal porcentaje, BigDecimal precio, Timestamp fecha, BigDecimal ley) {
        jdbc.update("INSERT INTO COTIZACIONES_COLOR (COLOR, ONZA_USD, DOLAR_PEN, EXPORTACION_PCT, PRECIO_GRAMO_PEN, FECHA_PUBLICACION, LEY_PCT) VALUES (?, ?, ?, ?, ?, ?, ?)", color, onza, dolar, porcentaje, precio, fecha, ley);
    }
}
