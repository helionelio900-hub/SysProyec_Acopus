package pe.edu.upeu.sitraoro.acopio.parametros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import java.util.Optional;

@Repository
public interface MineroRepository extends JpaRepository<Minero, Long> {
    @org.springframework.data.jpa.repository.Query(value="SELECT m.* FROM MINEROS m WHERE m.ID_CENTRO_ACOPIO=:centro OR EXISTS (SELECT 1 FROM SOL_ENTREGA_MINERO s WHERE s.ID_MINERO=m.ID_MINERO AND s.ID_CENTRO_ACOPIO=:centro AND s.ESTADO IN ('ACEPTADA','COMPRA_REGISTRADA')) ORDER BY m.NOMBRES_APELLIDOS", nativeQuery=true)
    java.util.List<Minero> vinculados(@org.springframework.data.repository.query.Param("centro") Long centro);
    @org.springframework.data.jpa.repository.Query(value="SELECT COUNT(*) FROM SOL_ENTREGA_MINERO WHERE ID_MINERO=:minero AND ID_CENTRO_ACOPIO=:centro AND ESTADO IN ('ACEPTADA','COMPRA_REGISTRADA')",nativeQuery=true)
    long entregasAceptadas(@org.springframework.data.repository.query.Param("minero") Long minero,@org.springframework.data.repository.query.Param("centro") Long centro);
    java.util.List<Minero> findByIdCentroAcopioOrderByNombresApellidosAsc(Long idCentroAcopio);
    Optional<Minero> findByDocumentoIdentidad(String documentoIdentidad);
}
