package pe.edu.upeu.bomerp.catalogo.producto.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.bomerp.catalogo.producto.dto.ProductoRequest;
import pe.edu.upeu.bomerp.catalogo.producto.dto.ProductoResponse;
import pe.edu.upeu.bomerp.catalogo.producto.entity.Producto;
import pe.edu.upeu.bomerp.catalogo.producto.mapper.ProductoMapper;
import pe.edu.upeu.bomerp.catalogo.producto.repository.ProductoRepository;
import pe.edu.upeu.bomerp.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> listar() {
        return productoRepository.findAll().stream().map(productoMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        return productoMapper.toResponse(buscarOFallar(id));
    }

    @Override
    public ProductoResponse crear(ProductoRequest request) {
        Producto producto = productoMapper.toEntity(request);
        return productoMapper.toResponse(productoRepository.save(producto));
    }

    @Override
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscarOFallar(id);
        producto.setNombre(request.getNombre());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        return productoMapper.toResponse(productoRepository.save(producto));
    }

    @Override
    public void eliminar(Long id) {
        productoRepository.delete(buscarOFallar(id));
    }

    private Producto buscarOFallar(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
    }
}