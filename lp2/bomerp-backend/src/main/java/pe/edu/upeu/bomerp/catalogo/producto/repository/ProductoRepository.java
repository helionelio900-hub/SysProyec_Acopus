package pe.edu.upeu.bomerp.catalogo.producto.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.bomerp.catalogo.producto.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}