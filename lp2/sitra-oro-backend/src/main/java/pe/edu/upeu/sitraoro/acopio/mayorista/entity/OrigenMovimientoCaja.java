package pe.edu.upeu.sitraoro.acopio.mayorista.entity;

/**
 * De dónde sale el movimiento. Los automáticos (PAGO_LOTE y ADELANTO) los crea el sistema y se corrigen solos;
 * los manuales los registra el mayorista y solo esos se pueden anular a mano.
 */
public enum OrigenMovimientoCaja {
    SALDO_INICIAL(true),
    EXPORTADOR(true),
    MANUAL(true),
    PAGO_LOTE(false),
    ADELANTO(false);

    private final boolean manual;

    OrigenMovimientoCaja(boolean manual) { this.manual = manual; }

    public boolean esManual() { return manual; }
}
