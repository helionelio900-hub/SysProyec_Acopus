package pe.edu.upeu.sitraoro.acopio.acopiador.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Request;
import pe.edu.upeu.sitraoro.acopio.acopiador.dto.TransaccionG2Response;
import pe.edu.upeu.sitraoro.acopio.acopiador.entity.TransaccionG2;
import pe.edu.upeu.sitraoro.acopio.parametros.entity.Minero;
import pe.edu.upeu.sitraoro.acopio.parametros.mapper.MineroMapper;

@Mapper(componentModel = "spring", uses = MineroMapper.class)
public interface TransaccionG2Mapper {

    @Mapping(target = "idTransaccionG2", ignore = true)
    @Mapping(target = "fechaTransaccion", ignore = true)
    @Mapping(target = "idLiquidacionG1", ignore = true)
    @Mapping(target = "pesoSinFundirG", source = "request.pesoSinFundirG")
    @Mapping(target = "pesoFundidoNetoG", source = "request.pesoFundidoNetoG")
    @Mapping(target = "tipoOro", source = "request.tipoOro")
    @Mapping(target = "precioAplicadoPen", source = "request.precioAplicadoPen")
    @Mapping(target = "totalPagadoPen", ignore = true)
    @Mapping(target = "minero", source = "minero")
    TransaccionG2 toEntity(TransaccionG2Request request, Minero minero);

    TransaccionG2Response toResponse(TransaccionG2 transaccionG2);
}
