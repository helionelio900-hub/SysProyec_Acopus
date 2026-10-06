package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.ZonaAcopioResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.entity.ZonaAcopio;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.CentroAcopioRepository;
import pe.edu.upeu.sitraoro.acopio.mayorista.repository.ZonaAcopioRepository;
import pe.edu.upeu.sitraoro.exception.ConflictException;
import pe.edu.upeu.sitraoro.exception.ResourceNotFoundException;

@Service @RequiredArgsConstructor
public class ZonaAcopioService {
    private final ZonaAcopioRepository zonas;
    private final CentroAcopioRepository centros;

    @Transactional(readOnly = true)
    public List<ZonaAcopioResponse> listar() {
        return zonas.findAllByOrderByNombreAsc().stream()
                .map(z -> new ZonaAcopioResponse(z.getIdZona(), z.getNombre())).toList();
    }

    @Transactional
    public ZonaAcopioResponse crear(String nombre) {
        String limpio = nombre.trim().replaceAll("\\s+", " ");
        if (zonas.findByNombreIgnoreCase(limpio).isPresent())
            throw new ConflictException("La zona ya existe");
        ZonaAcopio zona = zonas.save(new ZonaAcopio(null, limpio));
        return new ZonaAcopioResponse(zona.getIdZona(), zona.getNombre());
    }

    @Transactional
    public void eliminar(Long id) {
        ZonaAcopio zona = zonas.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zona no encontrada"));
        if (centros.existsByZonaIgnoreCase(zona.getNombre()))
            throw new ConflictException("La zona está asignada a un centro y no se puede eliminar");
        zonas.delete(zona);
    }

    @Transactional(readOnly = true)
    public String exigirZona(String nombre) {
        return zonas.findByNombreIgnoreCase(nombre.trim())
                .map(ZonaAcopio::getNombre)
                .orElseThrow(() -> new ResourceNotFoundException("Selecciona una zona registrada"));
    }
}
