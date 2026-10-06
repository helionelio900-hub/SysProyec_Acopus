package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.ReporteEntregasAcopiador;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.DatosOro;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.RecepcionMayorista;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.RecepcionMayoristaRepository;
import pe.edu.upeu.sitraoro.acopio.acopiador.service.AcopiadorService;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.ResumenPesoRecepcion;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class RecepcionMayoristaServiceImpl {
    private final RecepcionMayoristaRepository repository;
    private final CentroAcopioRepository centroAcopioRepository;
    private final AcopiadorService acopiadorService;

    @Transactional(readOnly = true)
    public List<RecepcionMayoristaResponse> listar(Long idCentroAcopio) {
        List<RecepcionMayorista> recepciones = idCentroAcopio == null
                ? repository.findAllByOrderByFechaDescIdRecepcionDesc()
                : repository.findByCentroAcopio_IdCentroAcopioOrderByFechaDescIdRecepcionDesc(idCentroAcopio);
        return recepciones.stream()
                .map(this::respuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReporteEntregasAcopiador reporteAcopiador(Long idCentroAcopio, LocalDate desde, LocalDate hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw new IllegalArgumentException("La fecha inicial debe ser anterior o igual a la fecha final");
        }
        List<RecepcionMayoristaResponse> items = listar(idCentroAcopio).stream()
                .filter(item -> desde == null || !item.fecha().isBefore(desde))
                .filter(item -> hasta == null || !item.fecha().isAfter(hasta))
                .toList();
        BigDecimal rojo = items.stream()
                .map(item -> item.rojo().pesoSinFundirG())
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal verde = items.stream()
                .map(item -> item.verde().pesoSinFundirG())
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ReporteEntregasAcopiador(items.size(), rojo, verde, items);
    }

    @Transactional
    public RecepcionMayoristaResponse registrar(RecepcionMayoristaRequest request) {
        if (request.idsComprasAcopiador().isEmpty()) {
            throw new IllegalArgumentException("Selecciona al menos una compra del acopiador");
        }
        RecepcionMayorista guardada = repository.saveAndFlush(
                entidad(request, obtenerCentroActivo(request.idCentroAcopio())));
        ResumenPesoRecepcion pesos = acopiadorService.vincularComprasRecepcion(
                guardada.getIdRecepcion(), request.idCentroAcopio(), request.idsComprasAcopiador());
        aplicarPesosSeleccionados(guardada, pesos);
        repository.save(guardada);
        return respuesta(guardada);
    }

    @Transactional
    public RecepcionMayoristaResponse registrarDesdeAcopiador(Long idCentroAcopio, List<Long> idsCompras) {
        CentroAcopio centro = obtenerCentroActivo(idCentroAcopio);
        RecepcionMayorista recepcion = new RecepcionMayorista();
        recepcion.setFecha(LocalDate.now(ZoneId.of("America/Lima")));
        recepcion.setCentroAcopio(centro);
        recepcion.setNombreAcopiador(centro.getNombre() + " · " + centro.getZona());
        // La tabla exige al menos un peso al insertar; se reemplaza por la suma real antes del commit.
        recepcion.setRojo(DatosOro.builder()
                .pesoSinFundirG(BigDecimal.ZERO)
                .build());
        recepcion.setVerde(DatosOro.builder().build());
        recepcion.setDescuento(null);
        recepcion.setTotal(null);

        RecepcionMayorista guardada = repository.saveAndFlush(recepcion);
        ResumenPesoRecepcion pesos = acopiadorService.vincularComprasRecepcion(
                guardada.getIdRecepcion(), idCentroAcopio, idsCompras);
        aplicarPesosSeleccionados(guardada, pesos);
        repository.save(guardada);
        return respuesta(guardada);
    }

    @Transactional
    public RecepcionMayoristaResponse actualizar(Long id, RecepcionMayoristaRequest request) {
        RecepcionMayorista actual = repository.bloquearPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recepción mayorista no encontrada: " + id));
        ResumenPesoRecepcion pesosSeleccionados = null;
        if (!request.idsComprasAcopiador().isEmpty()) {
            pesosSeleccionados = acopiadorService.vincularComprasRecepcion(
                    id, request.idCentroAcopio(), request.idsComprasAcopiador());
        } else if (!acopiadorService.idsComprasRecepcion(id).isEmpty()) {
            throw new IllegalArgumentException("La recepción debe conservar al menos una compra vinculada");
        } else {
            validarPesosManuales(request);
        }
        copiar(request, actual, obtenerCentroActivo(request.idCentroAcopio()));
        if (pesosSeleccionados != null) aplicarPesosSeleccionados(actual, pesosSeleccionados);
        return respuesta(repository.save(actual));
    }

    @Transactional
    public void eliminar(Long id) {
        RecepcionMayorista actual = repository.bloquearPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recepción mayorista no encontrada: " + id));
        acopiadorService.desvincularComprasRecepcion(id);
        repository.delete(actual);
    }

    private static void validarPesosManuales(RecepcionMayoristaRequest request) {
        validarFila("rojo", request.rojo());
        validarFila("verde", request.verde());
        if (request.rojo().pesoFundidoG() == null && request.verde().pesoFundidoG() == null) {
            throw new IllegalArgumentException("Registra al menos un peso para la recepción histórica");
        }
    }

    private static void validarFila(String color, RecepcionMayoristaRequest.FilaOro fila) {
        boolean sinFundir = fila.pesoSinFundirG() != null;
        boolean fundido = fila.pesoFundidoG() != null;
        if (sinFundir != fundido) {
            throw new IllegalArgumentException("Completa ambos pesos de la fila " + color + " o deja ambos vacíos");
        }
    }

    private CentroAcopio obtenerCentroActivo(Long idCentroAcopio) {
        return centroAcopioRepository.findById(idCentroAcopio)
                .filter(CentroAcopio::isActivo)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Centro de acopio no encontrado o inactivo: " + idCentroAcopio));
    }

    private static RecepcionMayorista entidad(RecepcionMayoristaRequest request, CentroAcopio centro) {
        RecepcionMayorista entidad = new RecepcionMayorista();
        copiar(request, entidad, centro);
        return entidad;
    }

    private static void copiar(RecepcionMayoristaRequest request, RecepcionMayorista entidad, CentroAcopio centro) {
        entidad.setFecha(request.fecha());
        entidad.setCentroAcopio(centro);
        entidad.setNombreAcopiador(centro.getNombre() + " · " + centro.getZona());
        entidad.setRojo(datos(request.rojo(), "ROJO"));
        entidad.setVerde(datos(request.verde(), "VERDE"));
        entidad.setDescuento(limpiar(request.descuento()));
        try {
            BigDecimal adelanto = limpiar(request.descuento()) == null ? BigDecimal.ZERO
                    : new BigDecimal(request.descuento().trim().replace(',', '.'));
            if (adelanto.signum() < 0) throw new IllegalArgumentException("El adelanto no puede ser negativo");
            BigDecimal rojo = entidad.getRojo().getPagoMaterial() == null ? BigDecimal.ZERO : new BigDecimal(entidad.getRojo().getPagoMaterial());
            BigDecimal verde = entidad.getVerde().getPagoMaterial() == null ? BigDecimal.ZERO : new BigDecimal(entidad.getVerde().getPagoMaterial());
            entidad.setDescuento(adelanto.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString());
            entidad.setTotal(rojo.add(verde).subtract(adelanto).setScale(2, java.math.RoundingMode.HALF_UP).toPlainString());
        } catch (NumberFormatException error) {
            throw new IllegalArgumentException("Ingresa el adelanto como un monto válido en soles");
        }
    }

    private static void aplicarPesosSeleccionados(RecepcionMayorista recepcion, ResumenPesoRecepcion pesos) {
        // Lo fundido por el acopiador es el peso de entrada antes de la nueva fundición del mayorista.
        recepcion.getRojo().setPesoSinFundirG(pesos.rojoFundido());
        recepcion.getVerde().setPesoSinFundirG(pesos.verdeFundido());
        if (pesos.rojoFundido() == null) recepcion.getRojo().setPesoFundidoG(null);
        if (pesos.verdeFundido() == null) recepcion.getVerde().setPesoFundidoG(null);
    }

    private static DatosOro datos(RecepcionMayoristaRequest.FilaOro fila, String color) {
        return DatosOro.builder()
                .pesoSinFundirG(fila.pesoSinFundirG())
                .pesoFundidoG(fila.pesoFundidoG())
                .onza(limpiar(fila.onza()))
                .dolar(limpiar(fila.dolar()))
                .exportacion(limpiar(fila.exportacion()))
                .pagoMaterial(calcularPagoMaterial(fila, color))
                .build();
    }

    private static String calcularPagoMaterial(RecepcionMayoristaRequest.FilaOro fila, String color) {
        try {
            BigDecimal porcentaje = limpiar(fila.exportacion()) == null ? BigDecimal.ZERO
                    : new BigDecimal(fila.exportacion().trim().replace(',', '.'));
            if (porcentaje.signum() < 0 || porcentaje.compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Exportación debe estar entre 0 y 100 por ciento");
            }
            if (fila.pesoFundidoG() == null || limpiar(fila.onza()) == null || limpiar(fila.dolar()) == null) return null;
            BigDecimal onza = new BigDecimal(fila.onza().trim().replace(',', '.'));
            BigDecimal dolar = new BigDecimal(fila.dolar().trim().replace(',', '.'));
            if (onza.signum() <= 0 || dolar.signum() <= 0) {
                throw new IllegalArgumentException("La onza y el dólar deben ser mayores que cero");
            }
            return pe.edu.upeu.sitraoro.acopio.parametros.service.CotizacionColorService.calcular(color, onza, dolar, porcentaje)
                    .multiply(fila.pesoFundidoG()).setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
        } catch (NumberFormatException error) {
            throw new IllegalArgumentException("Ingresa valores numéricos válidos para onza, dólar y exportación");
        }
    }

    private RecepcionMayoristaResponse respuesta(RecepcionMayorista item) {
        List<Long> idsCompras = acopiadorService.idsComprasRecepcion(item.getIdRecepcion());
        return new RecepcionMayoristaResponse(
                item.getIdRecepcion(), item.getFecha(), item.getCentroAcopio().getIdCentroAcopio(),
                item.getNombreAcopiador(),
                fila(item.getRojo()), fila(item.getVerde()),
                texto(item.getDescuento()), texto(item.getTotal()), idsCompras);
    }

    private static RecepcionMayoristaResponse.FilaOro fila(DatosOro fila) {
        if (fila == null) {
            return new RecepcionMayoristaResponse.FilaOro(null, null, "", "", "", "");
        }
        return new RecepcionMayoristaResponse.FilaOro(
                fila.getPesoSinFundirG(), fila.getPesoFundidoG(), texto(fila.getOnza()), texto(fila.getDolar()),
                texto(fila.getExportacion()), texto(fila.getPagoMaterial()));
    }

    private static String limpiar(String valor) {
        if (valor == null || valor.isBlank()) return null;
        return valor.trim();
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor;
    }
}
