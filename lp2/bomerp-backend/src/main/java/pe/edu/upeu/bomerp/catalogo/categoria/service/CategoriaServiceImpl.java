package pe.edu.upeu.bomerp.catalogo.categoria.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.bomerp.catalogo.categoria.dto.CategoriaResponse;
import pe.edu.upeu.bomerp.catalogo.categoria.entity.Categoria;
import pe.edu.upeu.bomerp.catalogo.categoria.repository.CategoriaRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {
    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll().stream().map(this::toResponse).toList();
    }

    private CategoriaResponse toResponse(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre(), categoria.getDescripcion());
    }
}