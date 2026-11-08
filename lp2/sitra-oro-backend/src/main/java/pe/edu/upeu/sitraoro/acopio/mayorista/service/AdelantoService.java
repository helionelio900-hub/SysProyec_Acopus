package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.AdelantoRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.AdelantoResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.AdelantoAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.EstadoAdelanto;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.AdelantoAcopioRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.auditoria.service.AuditoriaService;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.MayoristaReglaException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

/**
 * Adelantos que el mayorista entrega a los centros de acopio. Quedan PENDIENTES hasta que se
 * descuentan en el pago de un lote recibido del mismo centro.
 */
@Service
@RequiredArgsConstructor
public class AdelantoService {
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private final AdelantoAcopioRepository repository;
    private final CentroAcopioRepository centros;
    private final AuditoriaService auditoriaService;

    @Transactional
    public AdelantoResponse registrar(AdelantoRequest request) {
        CentroAcopio centro = centros.findById(request.idCentroAcopio())
                .filter(CentroAcopio::isActivo)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Centro de acopio no encontrado o inactivo: " + request.idCentroAcopio()));
        BigDecimal monto = request.monto().setScale(2, RoundingMode.HALF_UP);
        BigDecimal tipoCambio = null;
        BigDecimal montoPen = monto;
        if ("USD".equals(request.moneda())) {
            if (request.tipoCambio() == null) {
                throw new IllegalArgumentException("Ingresa el tipo de cambio para un adelanto en dólares");
            }
            tipoCambio = request.tipoCambio();
            montoPen = monto.multiply(tipoCambio).setScale(2, RoundingMode.HALF_UP);
        }
        AdelantoAcopio guardado = repository.save(AdelantoAcopio.builder()
                .centroAcopio(centro)
                .fecha(request.fecha() == null ? LocalDate.now(LIMA) : request.fecha())
                .moneda(request.moneda())
                .monto(monto)
                .tipoCambio(tipoCambio)
                .montoPen(montoPen)
                .observacion(limpiar(request.observacion()))
                .estado(EstadoAdelanto.PENDIENTE)
                .build());
        auditoriaService.registrar(null, "CREAR", "ADELANTO_ACOPIO", guardado.getIdAdelanto(),
                "Adelanto " + request.moneda() + " " + monto.toPlainString() + " a centro=" + centro.getNombre());
        return respuesta(guardado);
    }

    @Transactional(readOnly = true)
    public List<AdelantoResponse> listar(Long idCentroAcopio, EstadoAdelanto estado) {
        return repository.buscar(idCentroAcopio, estado).stream().map(AdelantoService::respuesta).toList();
    }

    @Transactional(readOnly = true)
    public AdelantoResponse.Saldo saldo(Long idCentroAcopio) {
        List<AdelantoResponse> pendientes = listar(idCentroAcopio, EstadoAdelanto.PENDIENTE);
        BigDecimal saldoPen = pendientes.stream().map(AdelantoResponse::montoPen)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal saldoUsd = pendientes.stream().filter(a -> "USD".equals(a.moneda()))
                .map(AdelantoResponse::monto).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new AdelantoResponse.Saldo(idCentroAcopio, pendientes.size(), saldoPen, saldoUsd, pendientes);
    }

    @Transactional
    public AdelantoResponse anular(Long id) {
        AdelantoAcopio adelanto = repository.bloquear(List.of(id)).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Adelanto no encontrado: " + id));
        if (adelanto.getEstado() != EstadoAdelanto.PENDIENTE) {
            throw new ConflictException("Solo se puede anular un adelanto pendiente. Este ya está " + adelanto.getEstado());
        }
        adelanto.setEstado(EstadoAdelanto.ANULADO);
        auditoriaService.registrar(null, "ANULAR", "ADELANTO_ACOPIO", id, "Anulación de adelanto id=" + id);
        return respuesta(adelanto);
    }

    /** Ids de los adelantos descontados en el pago de un lote. */
    @Transactional(readOnly = true)
    public List<Long> idsDescontados(Long idRecepcion) {
        return repository.findByIdRecepcion(idRecepcion).stream().map(AdelantoAcopio::getIdAdelanto).sorted().toList();
    }

    /** Devuelve a PENDIENTE los adelantos que estaban descontados en el lote (al editarlo o eliminarlo). */
    @Transactional
    public void liberar(Long idRecepcion) {
        for (AdelantoAcopio adelanto : repository.findByIdRecepcion(idRecepcion)) {
            adelanto.setEstado(EstadoAdelanto.PENDIENTE);
            adelanto.setIdRecepcion(null);
        }
        repository.flush();
    }

    /**
     * Marca como DESCONTADOS los adelantos elegidos para el pago del lote. Primero libera los que el
     * lote tenía antes, para que una nueva valorización reemplace la selección anterior.
     */
    @Transactional
    public void aplicar(Long idRecepcion, Long idCentroAcopio, List<Long> ids, BigDecimal adelantoPen) {
        liberar(idRecepcion);
        if (ids == null || ids.isEmpty()) return;
        if (idCentroAcopio == null || idCentroAcopio <= 0) {
            throw new IllegalArgumentException("Los adelantos solo se descuentan en lotes de un centro de acopio");
        }
        if (new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Un adelanto no puede repetirse");
        }
        List<AdelantoAcopio> elegidos = repository.bloquear(ids);
        if (elegidos.size() != ids.size()) {
            throw new ResourceNotFoundException("Uno de los adelantos seleccionados no existe");
        }
        BigDecimal suma = BigDecimal.ZERO;
        for (AdelantoAcopio adelanto : elegidos) {
            if (!Objects.equals(adelanto.getCentroAcopio().getIdCentroAcopio(), idCentroAcopio)) {
                throw new IllegalArgumentException("El adelanto #" + adelanto.getIdAdelanto() + " pertenece a otro centro de acopio");
            }
            if (adelanto.getEstado() != EstadoAdelanto.PENDIENTE) {
                throw new ConflictException("El adelanto #" + adelanto.getIdAdelanto() + " ya no está pendiente");
            }
            suma = suma.add(adelanto.getMontoPen());
        }
        if (adelantoPen.compareTo(suma) < 0) {
            throw new MayoristaReglaException("ADELANTO_MENOR_A_SELECCION",
                    "El adelanto descontado (S/ " + adelantoPen.toPlainString() + ") no cubre los adelantos seleccionados (S/ "
                            + suma.toPlainString() + ")");
        }
        for (AdelantoAcopio adelanto : elegidos) {
            adelanto.setEstado(EstadoAdelanto.DESCONTADO);
            adelanto.setIdRecepcion(idRecepcion);
        }
    }

    static AdelantoResponse respuesta(AdelantoAcopio a) {
        CentroAcopio centro = a.getCentroAcopio();
        return new AdelantoResponse(a.getIdAdelanto(), centro.getIdCentroAcopio(),
                centro.getNombre() + " · " + centro.getZona(), a.getFecha(), a.getMoneda(), a.getMonto(),
                a.getTipoCambio(), a.getMontoPen(), a.getObservacion(), a.getEstado().name(), a.getIdRecepcion());
    }

    private static String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
