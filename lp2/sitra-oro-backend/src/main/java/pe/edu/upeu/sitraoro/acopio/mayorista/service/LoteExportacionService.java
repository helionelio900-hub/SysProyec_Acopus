package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LoteExportacionRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.LoteExportacionResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLiquidacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoLoteExportacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LiquidacionG1;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.LoteExportacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.PartidaLoteExportacion;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.LiquidacionG1Repository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.LoteExportacionRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.PartidaLoteExportacionRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LoteExportacionService {
    private final LoteExportacionRepository lotes;
    private final LiquidacionG1Repository liquidaciones;
    private final PartidaLoteExportacionRepository partidas;
    private final pe.edu.upeu.sitraoro.acopio.mayorista.repository.RecepcionMayoristaRepository recepciones;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    @Transactional
    public LoteExportacionResponse crearDesdeRecepciones(List<Long> ids) {
        if (ids == null || ids.isEmpty() || ids.size() > 200 || ids.stream().anyMatch(id -> id == null || id <= 0)
                || new HashSet<>(ids).size() != ids.size()) throw new IllegalArgumentException("Selecciona recepciones distintas para el lote");
        LoteExportacion lote = new LoteExportacion();
        lote.setFecha(java.time.LocalDate.now(java.time.ZoneId.of("America/Lima")));
        lotes.saveAndFlush(lote);
        for (Long id : ids.stream().sorted().toList()) {
            var recepcion = recepciones.bloquearPorId(id).orElseThrow(() -> new ResourceNotFoundException("Recepción no encontrada: " + id));
            if (jdbc.queryForObject("SELECT COUNT(*) FROM LOTE_RECEPCIONES WHERE ID_RECEPCION = ?", Integer.class, id) > 0)
                throw new ConflictException("La recepción " + id + " ya está en un lote");
            BigDecimal rojo = recepcion.getRojo().getPesoFundidoG();
            BigDecimal verde = recepcion.getVerde().getPesoFundidoG();
            if ((recepcion.getRojo().getPesoSinFundirG() != null && rojo == null)
                    || (recepcion.getVerde().getPesoSinFundirG() != null && verde == null))
                throw new IllegalArgumentException("Completa y guarda la fundición del mayorista en la recepción " + id);
            rojo = rojo == null ? BigDecimal.ZERO : rojo;
            verde = verde == null ? BigDecimal.ZERO : verde;
            if (rojo.add(verde).signum() <= 0) throw new IllegalArgumentException("La recepción debe tener peso fundido positivo");
            jdbc.update("INSERT INTO LOTE_RECEPCIONES (ID_RECEPCION, ID_LOTE, PESO_ROJO_G, PESO_VERDE_G) VALUES (?, ?, ?, ?)", id, lote.getIdLote(), rojo, verde);
        }
        return respuesta(lote);
    }

    @Transactional(readOnly = true)
    public List<LoteExportacionResponse> listar() {
        return lotes.findAllByOrderByFechaDescIdLoteDesc().stream().map(this::respuesta).toList();
    }

    @Transactional
    public LoteExportacionResponse crear(LoteExportacionRequest request) {
        LoteExportacion lote = new LoteExportacion();
        lote.setFecha(request.fecha());
        reemplazarPartidas(lote, request.partidas());
        return respuesta(lotes.saveAndFlush(lote));
    }

    @Transactional
    public LoteExportacionResponse actualizar(Long id, LoteExportacionRequest request) {
        LoteExportacion lote = obtenerEditable(id);
        if (!detalleRecepciones(id).isEmpty()) throw new ConflictException("Este lote contiene recepciones, no liquidaciones");
        lote.setFecha(request.fecha());
        reemplazarPartidas(lote, request.partidas());
        return respuesta(lotes.saveAndFlush(lote));
    }

    @Transactional
    public void eliminar(Long id) {
        LoteExportacion lote = obtenerEditable(id);
        lotes.delete(lote);
    }

    @Transactional
    public LoteExportacionResponse preparar(Long id) {
        LoteExportacion lote = obtenerEditable(id);
        if (lote.getPartidas().size() < 2) {
            throw new ConflictException("El lote requiere al menos dos liquidaciones");
        }
        lote.setEstado(EstadoLoteExportacion.PREPARADO);
        lote.setFechaPreparacion(LocalDateTime.now());
        return respuesta(lotes.saveAndFlush(lote));
    }

    private LoteExportacion obtenerEditable(Long id) {
        LoteExportacion lote = lotes.bloquearPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado: " + id));
        if (lote.getEstado() != EstadoLoteExportacion.BORRADOR) {
            throw new ConflictException("Un lote preparado ya no se puede modificar ni eliminar");
        }
        return lote;
    }

    private void reemplazarPartidas(LoteExportacion lote, List<LoteExportacionRequest.Partida> solicitudes) {
        if (solicitudes == null || solicitudes.size() < 2) {
            throw new IllegalArgumentException("Selecciona al menos dos liquidaciones");
        }
        Set<Long> ids = new HashSet<>();
        for (var solicitud : solicitudes) {
            if (solicitud == null || solicitud.idLiquidacionG1() == null || solicitud.lecturaDecimal() == null
                    || solicitud.lecturaDecimal().signum() < 0) {
                throw new IllegalArgumentException("Cada partida requiere liquidación y lectura decimal válidas");
            }
            if (!ids.add(solicitud.idLiquidacionG1())) {
                throw new IllegalArgumentException("Una liquidación no puede repetirse dentro del lote");
            }
        }

        Map<Long, PartidaLoteExportacion> existentes = new HashMap<>();
        for (var partida : lote.getPartidas()) {
            existentes.put(partida.getLiquidacion().getIdLiquidacionG1(), partida);
        }
        lote.getPartidas().removeIf(partida -> !ids.contains(partida.getLiquidacion().getIdLiquidacionG1()));

        for (var solicitud : solicitudes.stream().sorted((a, b) -> a.idLiquidacionG1().compareTo(b.idLiquidacionG1())).toList()) {
            LiquidacionG1 liquidacion = liquidaciones.bloquearPorId(solicitud.idLiquidacionG1())
                    .orElseThrow(() -> new ResourceNotFoundException("Liquidación no encontrada: " + solicitud.idLiquidacionG1()));
            if (liquidacion.getEstado() != EstadoLiquidacion.REGISTRADA) {
                throw new ConflictException("La liquidación " + liquidacion.getIdLiquidacionG1() + " no está vigente");
            }
            var ocupacion = partidas.findByLiquidacion_IdLiquidacionG1(solicitud.idLiquidacionG1());
            if (ocupacion.isPresent() && (lote.getIdLote() == null
                    || !lote.getIdLote().equals(ocupacion.get().getLote().getIdLote()))) {
                throw new ConflictException("La liquidación " + liquidacion.getIdLiquidacionG1() + " ya integra otro lote");
            }
            PartidaLoteExportacion partida = existentes.get(solicitud.idLiquidacionG1());
            if (partida == null) {
                partida = new PartidaLoteExportacion();
                partida.setLote(lote);
                partida.setLiquidacion(liquidacion);
                lote.getPartidas().add(partida);
            }
            partida.setLecturaDecimal(solicitud.lecturaDecimal());
        }
    }

    private LoteExportacionResponse respuesta(LoteExportacion lote) {
        var recibidas = detalleRecepciones(lote.getIdLote());
        List<LoteExportacionResponse.Partida> detalle = lote.getPartidas().stream()
                .map(partida -> new LoteExportacionResponse.Partida(
                        partida.getLiquidacion().getIdLiquidacionG1(),
                        partida.getLiquidacion().getNombreAcopiadorG2(),
                        partida.getLiquidacion().getPesoTotalFundidoG(),
                        partida.getLecturaDecimal()))
                .toList();
        BigDecimal pesoTotal = detalle.stream().map(LoteExportacionResponse.Partida::pesoFundidoG)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new LoteExportacionResponse(lote.getIdLote(), lote.getFecha(), lote.getEstado().name(),
                pesoTotal.add(recibidas.stream().map(item -> item.pesoRojoG().add(item.pesoVerdeG())).reduce(BigDecimal.ZERO, BigDecimal::add)),
                lote.getFechaPreparacion(), detalle, recibidas);
    }

    private List<LoteExportacionResponse.Recepcion> detalleRecepciones(Long idLote) {
        return jdbc.query("SELECT lr.ID_RECEPCION, r.NOMBRE_ACOPIADOR, lr.PESO_ROJO_G, lr.PESO_VERDE_G FROM LOTE_RECEPCIONES lr JOIN MAYORISTA_RECEPCIONES r ON r.ID_RECEPCION = lr.ID_RECEPCION WHERE lr.ID_LOTE = ? ORDER BY lr.ID_RECEPCION",
                (fila, numero) -> new LoteExportacionResponse.Recepcion(fila.getLong(1), fila.getString(2), fila.getBigDecimal(3), fila.getBigDecimal(4)), idLote);
    }
}
