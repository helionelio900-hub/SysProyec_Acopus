package pe.edu.upeu.sitraoro.acopio.acopiador.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.acopiador.repository.TransaccionG2Repository;
import pe.edu.upeu.sitraoro.acopio.parametros.dto.DashboardResponse;
import pe.edu.upeu.sitraoro.acopio.parametros.service.DashboardAcopioPort;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardAcopioAdapter implements DashboardAcopioPort {

    private final TransaccionG2Repository transaccionG2Repository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse obtenerConsolidado(Long idCentroAcopio) {
        BigDecimal gramosRojo = idCentroAcopio == null
                ? transaccionG2Repository.sumPesoFundidoByTipoOro("ROJO")
                : transaccionG2Repository.sumPesoFundidoByCentroAndTipoOro(idCentroAcopio, "ROJO");
        BigDecimal dineroRojo = idCentroAcopio == null
                ? transaccionG2Repository.sumTotalPagadoByTipoOro("ROJO")
                : transaccionG2Repository.sumTotalPagadoByCentroAndTipoOro(idCentroAcopio, "ROJO");
        BigDecimal gramosVerde = idCentroAcopio == null
                ? transaccionG2Repository.sumPesoFundidoByTipoOro("VERDE")
                : transaccionG2Repository.sumPesoFundidoByCentroAndTipoOro(idCentroAcopio, "VERDE");
        BigDecimal dineroVerde = idCentroAcopio == null
                ? transaccionG2Repository.sumTotalPagadoByTipoOro("VERDE")
                : transaccionG2Repository.sumTotalPagadoByCentroAndTipoOro(idCentroAcopio, "VERDE");

        return new DashboardResponse(
                gramosRojo,
                dineroRojo,
                gramosVerde,
                dineroVerde,
                gramosRojo.add(gramosVerde),
                dineroRojo.add(dineroVerde)
        );
    }
}
