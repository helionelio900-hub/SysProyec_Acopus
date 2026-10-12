package pe.edu.upeu.sitraoro.exception;

public class MayoristaReglaException extends IllegalArgumentException {
    private final String codigo;
    public MayoristaReglaException(String codigo, String mensaje) { super(mensaje); this.codigo = codigo; }
    public String getCodigo() { return codigo; }
}
