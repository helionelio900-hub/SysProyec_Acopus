package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaRequest;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.CentroAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.DatosOro;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.RecepcionMayorista;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.RecepcionMayoristaRepository;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecepcionMayoristaServiceImpl implements RecepcionMayoristaService {
    private final RecepcionMayoristaRepository repository;
    private final CentroAcopioRepository centroAcopioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RecepcionMayoristaResponse> listar(Long idCentroAcopio) {
        List<RecepcionMayorista> recepciones = idCentroAcopio == null
                ? repository.findAllByOrderByFechaDescIdRecepcionDesc()
                : repository.findByCentroAcopio_IdCentroAcopioOrderByFechaDescIdRecepcionDesc(idCentroAcopio);
        return recepciones.stream()
                .map(RecepcionMayoristaServiceImpl::respuesta)
                .toList();
    }

    @Override
    @Transactional
    public RecepcionMayoristaResponse registrar(RecepcionMayoristaRequest request) {
        validar(request);
        return respuesta(repository.save(entidad(request, obtenerCentroActivo(request.idCentroAcopio()))));
    }

    @Override
    @Transactional
    public RecepcionMayoristaResponse actualizar(Long id, RecepcionMayoristaRequest request) {
        validar(request);
        RecepcionMayorista actual = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recepción mayorista no encontrada: " + id));
        copiar(request, actual, obtenerCentroActivo(request.idCentroAcopio()));
        return respuesta(repository.save(actual));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Recepción mayorista no encontrada: " + id);
        }
        repository.deleteById(id);
    }

    private static void validar(RecepcionMayoristaRequest request) {
        validarFila("rojo", request.rojo());
        validarFila("verde", request.verde());
        boolean tienePeso = request.rojo().pesoFundidoG() != null || request.verde().pesoFundidoG() != null;
        if (!tienePeso) {
            throw new IllegalArgumentException("Registra al menos un peso fundido, rojo o verde");
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
        entidad.setRojo(datos(request.rojo()));
        entidad.setVerde(datos(request.verde()));
        entidad.setDescuento(limpiar(request.descuento()));
        entidad.setTotal(limpiar(request.total()));
    }

    private static DatosOro datos(RecepcionMayoristaRequest.FilaOro fila) {
        return DatosOro.builder()
                .pesoSinFundirG(fila.pesoSinFundirG())
                .pesoFundidoG(fila.pesoFundidoG())
                .onza(limpiar(fila.onza()))
                .dolar(limpiar(fila.dolar()))
                .exportacion(limpiar(fila.exportacion()))
                .pagoMaterial(limpiar(fila.pagoMaterial()))
                .build();
    }

    private static RecepcionMayoristaResponse respuesta(RecepcionMayorista item) {
        return new RecepcionMayoristaResponse(
                item.getIdRecepcion(), item.getFecha(), item.getCentroAcopio().getIdCentroAcopio(),
                item.getNombreAcopiador(),
                fila(item.getRojo()), fila(item.getVerde()), texto(item.getDescuento()), texto(item.getTotal()));
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
