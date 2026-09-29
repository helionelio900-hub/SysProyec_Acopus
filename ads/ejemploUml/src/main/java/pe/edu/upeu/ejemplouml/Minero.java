package pe.edu.upeu.ejemplouml;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Minero {
    private final long idMinero;
    private final String documentoIdentidad;
    private final String nombresApellidos;
    private final List<CompraAcopio> compras = new ArrayList<>();

    public Minero(long idMinero, String documentoIdentidad, String nombresApellidos) {
        this.idMinero = idMinero;
        this.documentoIdentidad = documentoIdentidad;
        this.nombresApellidos = nombresApellidos;
    }

    public void registrarCompra(CompraAcopio compra) {
        if (compra == null) {
            throw new IllegalArgumentException("La compra es obligatoria");
        }
        compra.asociarMinero(this);
        compras.add(compra);
    }

    public long getIdMinero() { return idMinero; }
    public String getDocumentoIdentidad() { return documentoIdentidad; }
    public String getNombresApellidos() { return nombresApellidos; }
    public List<CompraAcopio> getCompras() { return Collections.unmodifiableList(compras); }
}
