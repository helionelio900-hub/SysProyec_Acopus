package pe.edu.upeu.sitraoro.acopio.acopiador.entity;

/**
 * Origen de un movimiento de la caja del acopiador. PAGO_COMPRA y PRESTAMO los genera el sistema; el resto los
 * registra el acopiador y solo esos se anulan a mano.
 */
public enum OrigenCajaAcopio {
    SALDO_INICIAL(true, true),
    MAYORISTA(true, true),
    MANUAL(true, null),
    PAGO_COMPRA(false, false),
    PRESTAMO(false, false);

    private final boolean manual;
    /** true = siempre ingreso, false = siempre egreso, null = el usuario elige. */
    private final Boolean ingreso;

    OrigenCajaAcopio(boolean manual, Boolean ingreso) { this.manual = manual; this.ingreso = ingreso; }

    public boolean esManual() { return manual; }

    public Boolean esIngreso() { return ingreso; }
}
