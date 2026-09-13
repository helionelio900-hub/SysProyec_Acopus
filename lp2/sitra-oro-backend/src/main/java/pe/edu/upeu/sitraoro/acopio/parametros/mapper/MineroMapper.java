package pe.edu.upeu.sitraoro.acopio.parametros.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroRequest;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.MineroResumen;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;

@Mapper(componentModel = "spring")
public interface MineroMapper {
    @Mapping(target = "idMinero", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    Minero toEntity(MineroRequest request);
    MineroResponse toResponse(Minero minero);
    MineroResumen toResumen(Minero minero);
}
