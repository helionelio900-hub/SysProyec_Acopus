package pe.edu.upeu.sitraoro.acopio.mayorista.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.AdelantoResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DashboardMayoristaResponse;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.DashboardMayoristaResponse.*;
import pe.edu.upeu.sitraoro.acopio.mayorista.dto.RecepcionLeyResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/** Arma el tablero del mayorista a partir de los lotes valorizados y los adelantos registrados. */
@Service
@RequiredArgsConstructor
public class DashboardMayoristaService {
    private static final ZoneId LIMA = ZoneId.of("America/Lima");
    private static final int MAX_DIAS = 366;

    private final RecepcionLeyService recepciones;
    private final AdelantoService adelantos;

    @Transactional(readOnly = true)
    public DashboardMayoristaResponse generar(LocalDate desde, LocalDate hasta) {
        LocalDate hoy = LocalDate.now(LIMA);
        LocalDate fin = hasta == null ? hoy : hasta;
        LocalDate inicio = desde == null ? fin.minusDays(29) : desde;
        if (inicio.isAfter(fin)) throw new IllegalArgumentException("La fecha inicial no puede superar la fecha final");
        if (ChronoUnit.DAYS.between(inicio, fin) >= MAX_DIAS)
            throw new IllegalArgumentException("El rango del tablero no puede superar " + MAX_DIAS + " días");

        List<RecepcionLeyResponse> todas = recepciones.listar(null);
        List<RecepcionLeyResponse> valorizadas = todas.stream().filter(r -> !r.detalles().isEmpty()).toList();
        List<AdelantoResponse> entregados = adelantos.listar(null, null).stream()
                .filter(a -> !"ANULADO".equals(a.estado())).toList();

        Map<LocalDate, List<RecepcionLeyResponse>> porDia = valorizadas.stream()
                .collect(Collectors.groupingBy(RecepcionLeyResponse::fecha));
        Map<LocalDate, List<AdelantoResponse>> adelantosPorDia = entregados.stream()
                .collect(Collectors.groupingBy(AdelantoResponse::fecha));

        List<Dia> serie = new ArrayList<>();
        for (LocalDate d = inicio; !d.isAfter(fin); d = d.plusDays(1)) {
            serie.add(dia(d, porDia.getOrDefault(d, List.of()), adelantosPorDia.getOrDefault(d, List.of())));
        }
        List<RecepcionLeyResponse> enRango = valorizadas.stream().filter(r -> dentro(r.fecha(), inicio, fin)).toList();
        List<AdelantoResponse> adelantosRango = entregados.stream().filter(a -> dentro(a.fecha(), inicio, fin)).toList();

        BigDecimal ingreso = sumar(serie.stream().map(Dia::ingresoPen));
        long operaciones = enRango.size();
        Dia mejor = serie.stream().filter(d -> d.ingresoPen().signum() > 0)
                .max(Comparator.comparing(Dia::ingresoPen)).orElse(null);
        Totales periodo = new Totales(operaciones,
                sumar(serie.stream().map(Dia::pesoFundidoG)), ingreso,
                sumar(serie.stream().map(Dia::ingresoUsd)),
                sumar(serie.stream().map(Dia::pagadoPen)),
                operaciones == 0 ? BigDecimal.ZERO : ingreso.divide(BigDecimal.valueOf(operaciones), 2, RoundingMode.HALF_UP),
                ingreso.divide(BigDecimal.valueOf(serie.size()), 2, RoundingMode.HALF_UP),
                sumar(adelantosRango.stream().map(AdelantoResponse::montoPen)),
                mejor == null ? null : mejor.fecha(), mejor == null ? BigDecimal.ZERO : mejor.ingresoPen());

        AdelantoResponse.Saldo saldo = adelantos.saldo(null);
        return new DashboardMayoristaResponse(inicio, fin,
                dia(hoy, porDia.getOrDefault(hoy, List.of()), adelantosPorDia.getOrDefault(hoy, List.of())),
                periodo, serie, topCentros(enRango), porMoneda(enRango),
                new Adelantos(saldo.cantidadPendientes(), saldo.saldoPen(), periodo.adelantosEntregadosPen(), adelantosRango.size()),
                new Estados(
                        todas.stream().filter(r -> "PENDIENTE".equals(r.estado())).count(),
                        todas.stream().filter(r -> "VALORIZADO".equals(r.estado())).count(),
                        todas.stream().filter(r -> "EN_LOTE".equals(r.estado())).count()));
    }

    private static Dia dia(LocalDate fecha, List<RecepcionLeyResponse> lotes, List<AdelantoResponse> entregados) {
        return new Dia(fecha, lotes.size(),
                sumar(lotes.stream().map(RecepcionLeyResponse::pesoFundidoG)),
                sumar(lotes.stream().map(DashboardMayoristaService::ingresoPen)),
                sumar(lotes.stream().map(DashboardMayoristaService::ingresoUsd)),
                sumar(lotes.stream().map(RecepcionLeyResponse::total)),
                sumar(entregados.stream().map(AdelantoResponse::montoPen)));
    }

    private static List<Centro> topCentros(List<RecepcionLeyResponse> lotes) {
        Map<Long, List<RecepcionLeyResponse>> grupos = lotes.stream()
                .collect(Collectors.groupingBy(r -> r.idCentroAcopio() > 0 ? r.idCentroAcopio() : 0L));
        return grupos.entrySet().stream()
                .map(e -> new Centro(e.getKey(), e.getKey() == 0L ? "Compras directas al minero" : e.getValue().getFirst().nombreAcopiador(),
                        e.getValue().size(), sumar(e.getValue().stream().map(RecepcionLeyResponse::pesoFundidoG)),
                        sumar(e.getValue().stream().map(DashboardMayoristaService::ingresoPen))))
                .sorted(Comparator.comparing(Centro::ingresoPen).reversed())
                .limit(5)
                .toList();
    }

    private static List<Moneda> porMoneda(List<RecepcionLeyResponse> lotes) {
        List<Moneda> resultado = new ArrayList<>();
        for (String moneda : List.of("PEN", "USD")) {
            List<RecepcionLeyResponse> grupo = lotes.stream().filter(r -> moneda.equals(r.monedaPago())).toList();
            resultado.add(new Moneda(moneda, grupo.size(), sumar(grupo.stream().map(RecepcionLeyResponse::totalPagoMoneda))));
        }
        return resultado;
    }

    private static BigDecimal ingresoPen(RecepcionLeyResponse r) {
        return r.subtotal() == null ? BigDecimal.ZERO : r.subtotal();
    }

    /** Valor en dólares del material: precio USD por gramo de cada partida por su peso fundido. */
    private static BigDecimal ingresoUsd(RecepcionLeyResponse r) {
        return sumar(r.detalles().stream().map(d -> d.precioUsd().multiply(d.pesoFundidoG())))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private static boolean dentro(LocalDate fecha, LocalDate desde, LocalDate hasta) {
        return fecha != null && !fecha.isBefore(desde) && !fecha.isAfter(hasta);
    }

    private static BigDecimal sumar(java.util.stream.Stream<BigDecimal> valores) {
        return valores.filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
