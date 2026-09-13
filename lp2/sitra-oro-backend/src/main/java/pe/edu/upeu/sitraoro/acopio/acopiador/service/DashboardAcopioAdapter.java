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
    public DashboardResponse obtenerConsolidado() {
        BigDecimal gramosRojo = transaccionG2Repository.sumPesoFundidoByTipoOro("ROJO");
        BigDecimal dineroRojo = transaccionG2Repository.sumTotalPagadoByTipoOro("ROJO");
        BigDecimal gramosVerde = transaccionG2Repository.sumPesoFundidoByTipoOro("VERDE");
        BigDecimal dineroVerde = transaccionG2Repository.sumTotalPagadoByTipoOro("VERDE");

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
