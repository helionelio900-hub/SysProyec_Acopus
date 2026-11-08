package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PrestamoDtos.PrestamoRequest;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.PrestamoDtos.PrestamoResponse;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.EstadoPrestamo;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.PrestamoMinero;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.PrestamoMineroRepository;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.repository.MineroRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

/**
 * Préstamos que el acopiador entrega a sus mineros. Quedan PENDIENTES hasta descontarse en una compra al mismo
 * minero. Cada acopiador solo ve y usa los préstamos de su propio centro.
 */
@Service
@RequiredArgsConstructor
public class PrestamoMineroService {
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private final PrestamoMineroRepository repository;
    private final MineroRepository mineros;
    private final CajaAcopioService caja;

    @Transactional
    public PrestamoResponse registrar(PrestamoRequest request, Long idCentro) {
        Minero minero = mineros.findById(request.idMinero())
                .orElseThrow(() -> new ResourceNotFoundException("Minero no encontrado: " + request.idMinero()));
        if (!Objects.equals(idCentro, minero.getIdCentroAcopio()) && mineros.entregasAceptadas(minero.getIdMinero(), idCentro) == 0)
            throw new ConflictException("El minero no pertenece a tu centro de acopio");
        String observacion = request.observacion() == null || request.observacion().isBlank() ? null : request.observacion().trim();
        PrestamoMinero guardado = repository.save(PrestamoMinero.builder()
                .idCentroAcopio(idCentro).minero(minero)
                .fecha(request.fecha() == null ? LocalDate.now(LIMA) : request.fecha())
                .montoPen(request.montoPen().setScale(2, RoundingMode.HALF_UP))
                .observacion(observacion).estado(EstadoPrestamo.PENDIENTE).build());
        // El préstamo sale de la caja del centro el día que se entrega.
        caja.registrarPrestamo(idCentro, guardado.getIdPrestamo(), guardado.getMontoPen(), minero.getNombresApellidos(), guardado.getFecha());
        return respuesta(guardado);
    }

    @Transactional(readOnly = true)
    public List<PrestamoResponse> listar(Long idCentro, Long idMinero, EstadoPrestamo estado) {
        return repository.buscar(idCentro, idMinero, estado).stream().map(PrestamoMineroService::respuesta).toList();
    }

    @Transactional
    public PrestamoResponse anular(Long id, Long idCentro) {
        PrestamoMinero prestamo = repository.bloquear(List.of(id)).stream()
                .filter(p -> Objects.equals(p.getIdCentroAcopio(), idCentro)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Préstamo no encontrado: " + id));
        if (prestamo.getEstado() != EstadoPrestamo.PENDIENTE)
            throw new ConflictException("Solo se anula un préstamo pendiente; este ya está " + prestamo.getEstado());
        prestamo.setEstado(EstadoPrestamo.ANULADO);
        caja.anularAutomatico(pe.edu.upeu.sitraoro.acopio.acopiador.entity.OrigenCajaAcopio.PRESTAMO, id);
        return respuesta(prestamo);
    }

    @Transactional(readOnly = true)
    public List<Long> idsDescontados(Long idCompra) {
        return repository.findByIdCompraG2(idCompra).stream().map(PrestamoMinero::getIdPrestamo).sorted().toList();
    }

    /**
     * Descuenta los préstamos elegidos en la compra y devuelve su suma. Valida que sean del mismo centro y del
     * mismo minero, y que sigan pendientes.
     */
    @Transactional
    public BigDecimal descontar(List<Long> ids, Long idCentro, Long idMinero, Long idCompra) {
        if (ids == null || ids.isEmpty()) return BigDecimal.ZERO;
        if (new HashSet<>(ids).size() != ids.size()) throw new IllegalArgumentException("Un préstamo no puede repetirse");
        List<PrestamoMinero> elegidos = repository.bloquear(ids);
        if (elegidos.size() != ids.size()) throw new ResourceNotFoundException("Uno de los préstamos seleccionados no existe");
        BigDecimal suma = BigDecimal.ZERO;
        for (PrestamoMinero p : elegidos) {
            if (!Objects.equals(p.getIdCentroAcopio(), idCentro) || !Objects.equals(p.getMinero().getIdMinero(), idMinero))
                throw new IllegalArgumentException("El préstamo #" + p.getIdPrestamo() + " no es de este minero");
            if (p.getEstado() != EstadoPrestamo.PENDIENTE)
                throw new ConflictException("El préstamo #" + p.getIdPrestamo() + " ya no está pendiente");
            suma = suma.add(p.getMontoPen());
        }
        for (PrestamoMinero p : elegidos) {
            p.setEstado(EstadoPrestamo.DESCONTADO);
            p.setIdCompraG2(idCompra);
        }
        return suma;
    }

    static PrestamoResponse respuesta(PrestamoMinero p) {
        Minero m = p.getMinero();
        return new PrestamoResponse(p.getIdPrestamo(), m.getIdMinero(), m.getNombresApellidos(), m.getDocumentoIdentidad(),
                p.getFecha(), p.getMontoPen(), p.getObservacion(), p.getEstado().name(), p.getIdCompraG2());
    }
}
