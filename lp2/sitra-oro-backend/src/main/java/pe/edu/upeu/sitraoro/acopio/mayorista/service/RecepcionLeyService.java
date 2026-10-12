package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.*;
import pe.edu.upeu.sitraoro.exception.*;
import java.math.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecepcionLeyService {
    private final RecepcionMayoristaRepository recepciones;
    private final DetalleRecepcionLeyRepository detalles;
    private final LeyOroRepository leyes;
    private final JdbcTemplate jdbc;
    private final Validator validator;

    public RecepcionLeyResponse.Calculo calcular(RecepcionLeyRequest request) {
        var errores = validator.validate(request);
        if (!errores.isEmpty()) throw new IllegalArgumentException("Revisa los valores y la cantidad de partidas: " + errores.iterator().next().getMessage());
        Set<Long> vistas = new HashSet<>();
        List<RecepcionLeyResponse.Detalle> filas = new ArrayList<>();
        BigDecimal peso = BigDecimal.ZERO;
        BigDecimal subtotal = BigDecimal.ZERO;
        for (var p : request.detalles()) {
            long idLey = p.ley().movePointRight(4).longValueExact();
            if (!vistas.add(idLey)) throw new IllegalArgumentException("La ley " + p.ley().stripTrailingZeros().toPlainString() + " está repetida en este lote. Reúne sus pesos en una sola partida.");
            if (p.pesoFundidoG().compareTo(p.pesoSinFundirG()) > 0)
                throw new IllegalArgumentException("El peso fundido no puede superar el peso sin fundir");
            // Conserva la convención comercial vigente de SITRA; la ley ingresada sustituye al factor fijo por color.
            BigDecimal usdExacto = p.onza().multiply(p.ley().movePointLeft(2))
                    .multiply(BigDecimal.ONE.subtract(p.porcentaje().movePointLeft(2)))
                    .divide(new BigDecimal("31.0999"), 16, RoundingMode.HALF_UP);
            BigDecimal usd = usdExacto.setScale(2, RoundingMode.HALF_UP);
            BigDecimal pen = usdExacto.multiply(p.tipoCambio()).setScale(2, RoundingMode.HALF_UP);
            if (pen.signum() <= 0) throw new IllegalArgumentException("El precio por gramo debe ser al menos S/ 0.01");
            BigDecimal total = pen.multiply(p.pesoFundidoG()).setScale(2, RoundingMode.HALF_UP);
            filas.add(new RecepcionLeyResponse.Detalle(idLey, p.onza(), p.ley(), p.porcentaje(), p.tipoCambio(),
                    p.pesoSinFundirG(), p.pesoFundidoG(), usd, pen, total));
            peso = peso.add(p.pesoFundidoG());
            subtotal = subtotal.add(total);
        }
        if (request.adelanto().compareTo(subtotal) > 0) throw new IllegalArgumentException("El adelanto no puede superar el total de material");
        return new RecepcionLeyResponse.Calculo(filas, peso, subtotal, request.adelanto(), subtotal.subtract(request.adelanto()));
    }

    @Transactional(readOnly = true)
    public List<RecepcionLeyResponse> listar(Long idCentro) {
        var items = idCentro == null ? recepciones.findAllByOrderByFechaDescIdRecepcionDesc()
                : recepciones.findByCentroAcopio_IdCentroAcopioOrderByFechaDescIdRecepcionDesc(idCentro);
        Set<Long> agrupadas = new HashSet<>(jdbc.queryForList("SELECT ID_ORIGEN FROM RECEPCION_ACUMULADA", Long.class));
        return items.stream().filter(r -> !agrupadas.contains(r.getIdRecepcion())).map(this::respuesta).toList();
    }

    @Transactional
    public RecepcionLeyResponse guardarAcumulado(AnalisisAcumuladoRequest request) {
        calcular(request.analisis());
        var ids = request.entregas().stream().map(AnalisisAcumuladoRequest.Origen::id).sorted().toList();
        if (new HashSet<>(ids).size() != ids.size()) throw new IllegalArgumentException("Una entrega no puede repetirse");
        List<RecepcionMayorista> origenes = new ArrayList<>();
        BigDecimal rojo = BigDecimal.ZERO, verde = BigDecimal.ZERO;
        Long centro = null;
        for (Long id : ids) {
            var r = recepciones.bloquearPorId(id).orElseThrow(() -> new ResourceNotFoundException("Entrega no encontrada: " + id));
            var revision = request.entregas().stream().filter(o -> o.id().equals(id)).findFirst().orElseThrow().revision();
            if (!Objects.equals(r.getRevisionLey(), revision) || idExportacion(id) != null
                    || detalles.existsByRecepcion_IdRecepcion(id)
                    || !jdbc.queryForList("SELECT ID_ORIGEN FROM RECEPCION_ACUMULADA WHERE ID_ORIGEN = ?", Long.class, id).isEmpty())
                throw new ConflictException("Una entrega ya fue procesada. Actualiza el resumen.");
            if (centro == null) centro = r.getCentroAcopio().getIdCentroAcopio();
            if (!centro.equals(r.getCentroAcopio().getIdCentroAcopio())) throw new IllegalArgumentException("Las entregas deben pertenecer al mismo acopiador");
            rojo = rojo.add(r.getRojo() == null || r.getRojo().getPesoSinFundirG() == null ? BigDecimal.ZERO : r.getRojo().getPesoSinFundirG());
            verde = verde.add(r.getVerde() == null || r.getVerde().getPesoSinFundirG() == null ? BigDecimal.ZERO : r.getVerde().getPesoSinFundirG());
            origenes.add(r);
        }
        BigDecimal entrada = request.analisis().detalles().stream().map(RecepcionLeyRequest.Partida::pesoSinFundirG).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (entrada.compareTo(rojo.add(verde)) != 0) throw new IllegalArgumentException("Los pesos sin fundir deben sumar exactamente el material recibido");
        var conjunta = new RecepcionMayorista();
        conjunta.setFecha(java.time.LocalDate.now(java.time.ZoneId.of("America/Lima")));
        conjunta.setCentroAcopio(origenes.getFirst().getCentroAcopio());
        conjunta.setNombreAcopiador(origenes.getFirst().getNombreAcopiador());
        conjunta.setRojo(DatosOro.builder().pesoSinFundirG(rojo).build());
        conjunta.setVerde(DatosOro.builder().pesoSinFundirG(verde).build());
        recepciones.saveAndFlush(conjunta);
        for (var r : origenes) jdbc.update("INSERT INTO RECEPCION_ACUMULADA (ID_ORIGEN, ID_ACUMULADA) VALUES (?, ?)", r.getIdRecepcion(), conjunta.getIdRecepcion());
        return guardar(conjunta.getIdRecepcion(), new RecepcionLeyRequest(0L, request.analisis().adelanto(), request.analisis().detalles()));
    }

    @Transactional
    public RecepcionLeyResponse guardar(Long id, RecepcionLeyRequest request) {
        var calculo = calcular(request);
        var recepcion = recepciones.bloquearPorId(id).orElseThrow(() -> new ResourceNotFoundException("Lote recibido no encontrado: " + id));
        if (!jdbc.queryForList("SELECT ID_ORIGEN FROM RECEPCION_ACUMULADA WHERE ID_ORIGEN = ?", Long.class, id).isEmpty())
            throw new ConflictException("La entrega pertenece a un análisis acumulado");
        if (idExportacion(id) != null) throw new ConflictException("El lote recibido ya integra un lote de exportación y no puede modificarse");
        if (!Objects.equals(recepcion.getRevisionLey(), request.revision()))
            throw new ConflictException("Otra operación actualizó este lote. Actualiza los datos y vuelve a abrirlo.");
        detalles.deleteAll(detalles.findByRecepcion_IdRecepcionOrderByIdDetalle(id));
        detalles.flush();
        for (var fila : calculo.detalles()) {
            // ID canónico por valor de ley (4 decimales). Dos lotes reutilizan la misma entrada del catálogo.
            if (!leyes.existsById(fila.idLey())) {
                try { jdbc.update("INSERT INTO LEYES_ORO (ID_LEY, VALOR) VALUES (?, ?)", fila.idLey(), fila.ley()); }
                catch (DuplicateKeyException concurrente) {
                    if (!leyes.existsById(fila.idLey())) throw concurrente;
                }
            }
            var detalle = new DetalleRecepcionLey();
            detalle.setRecepcion(recepcion);
            detalle.setLey(leyes.getReferenceById(fila.idLey()));
            detalle.setOnza(fila.onza()); detalle.setPorcentaje(fila.porcentaje()); detalle.setTipoCambio(fila.tipoCambio());
            detalle.setPesoSinFundirG(fila.pesoSinFundirG()); detalle.setPesoFundidoG(fila.pesoFundidoG());
            detalle.setPrecioUsd(fila.precioUsd()); detalle.setPrecioPen(fila.precioPen()); detalle.setTotalPen(fila.totalPen());
            detalles.save(detalle);
        }
        recepcion.setRevisionLey(recepcion.getRevisionLey() + 1);
        recepcion.setDescuento(calculo.adelanto().toPlainString());
        recepcion.setTotal(calculo.total().toPlainString());
        recepciones.saveAndFlush(recepcion);
        return respuesta(recepcion);
    }

    private RecepcionLeyResponse respuesta(RecepcionMayorista r) {
        var filas = detalles.findByRecepcion_IdRecepcionOrderByIdDetalle(r.getIdRecepcion()).stream().map(d ->
                new RecepcionLeyResponse.Detalle(d.getLey().getIdLey(), d.getOnza(), d.getLey().getValor(), d.getPorcentaje(),
                        d.getTipoCambio(), d.getPesoSinFundirG(), d.getPesoFundidoG(), d.getPrecioUsd(), d.getPrecioPen(), d.getTotalPen())).toList();
        Long exportacion = idExportacion(r.getIdRecepcion());
        BigDecimal peso = filas.isEmpty() ? sumarPeso(r, true) : filas.stream().map(RecepcionLeyResponse.Detalle::pesoFundidoG).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal subtotal = filas.isEmpty() ? null : filas.stream().map(RecepcionLeyResponse.Detalle::totalPen).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal adelanto = numeroHistorico(r.getDescuento());
        BigDecimal pesoRojo = r.getRojo() != null ? r.getRojo().getPesoSinFundirG() : null;
        BigDecimal pesoVerde = r.getVerde() != null ? r.getVerde().getPesoSinFundirG() : null;
        return new RecepcionLeyResponse(r.getIdRecepcion(), r.getFecha(), r.getCentroAcopio() == null ? -r.getIdRecepcion() : r.getCentroAcopio().getIdCentroAcopio(), r.getNombreAcopiador(),
                r.getRevisionLey(), exportacion != null ? "EN_LOTE" : filas.isEmpty() ? "PENDIENTE" : "VALORIZADO", exportacion,
                r.isCompraDirecta() ? filas.stream().map(RecepcionLeyResponse.Detalle::pesoSinFundirG).reduce(BigDecimal.ZERO, BigDecimal::add) : sumarPeso(r, false), pesoRojo, pesoVerde, peso, subtotal, adelanto, filas.isEmpty() ? numeroHistorico(r.getTotal()) : subtotal.subtract(adelanto), filas);
    }

    private Long idExportacion(Long id) {
        try {
            var ids = jdbc.queryForList("SELECT ID_LOTE FROM LOTE_RECEPCIONES WHERE ID_RECEPCION = ?", Long.class, id);
            return ids.isEmpty() ? null : ids.getFirst();
        } catch (org.springframework.dao.DataAccessException e) {
            return null;
        }
    }
    private static BigDecimal sumarPeso(RecepcionMayorista r, boolean fundido) {
        BigDecimal total = BigDecimal.ZERO;
        for (var fila : Arrays.asList(r.getRojo(), r.getVerde())) {
            if (fila == null) continue;
            var peso = fundido ? fila.getPesoFundidoG() : fila.getPesoSinFundirG();
            if (peso != null) total = total.add(peso);
        }
        return total;
    }
    private static BigDecimal numeroHistorico(String valor) {
        if (valor == null || valor.isBlank()) return BigDecimal.ZERO;
        try { return new BigDecimal(valor.trim().replace(',', '.')); }
        catch (NumberFormatException error) { return BigDecimal.ZERO; }
    }
}
