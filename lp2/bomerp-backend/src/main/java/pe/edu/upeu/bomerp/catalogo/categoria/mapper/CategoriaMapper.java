package pe.edu.upeu.bomerp.catalogo.categoria.mapper;

import org.mapstruct.Mapper;
import pe.edu.upeu.bomerp.catalogo.categoria.dto.CategoriaRequest;
import pe.edu.upeu.bomerp.catalogo.categoria.dto.CategoriaResponse;
import pe.edu.upeu.bomerp.catalogo.categoria.dto.CategoriaResumen;
import pe.edu.upeu.bomerp.catalogo.categoria.entity.Categoria;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {
    Categoria toEntity(CategoriaRequest request);
    CategoriaResponse toResponse(Categoria categoria);
    CategoriaResumen toResumen(Categoria categoria);
}
