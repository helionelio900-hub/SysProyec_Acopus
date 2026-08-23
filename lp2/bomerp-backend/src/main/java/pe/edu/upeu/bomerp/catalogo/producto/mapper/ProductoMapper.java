package pe.edu.upeu.bomerp.catalogo.producto.mapper;

import org.mapstruct.Mapper;
import pe.edu.upeu.bomerp.catalogo.producto.dto.ProductoRequest;
import pe.edu.upeu.bomerp.catalogo.producto.dto.ProductoResponse;
import pe.edu.upeu.bomerp.catalogo.producto.entity.Producto;

@Mapper(componentModel = "spring")
public interface ProductoMapper {
    Producto toEntity(ProductoRequest request);
    ProductoResponse toResponse(Producto producto);
}