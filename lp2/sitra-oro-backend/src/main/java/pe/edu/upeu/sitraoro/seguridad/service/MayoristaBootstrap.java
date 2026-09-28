package pe.edu.upeu.sitraoro.seguridad.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import pe.edu.upeu.sitraoro.seguridad.entity.RolCuenta;

@Component
@RequiredArgsConstructor
public class MayoristaBootstrap implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(MayoristaBootstrap.class);
    private final CuentaAccesoService cuentaAccesoService;

    @Value("${sitraoro.bootstrap.mayorista.documento:}")
    private String documento;
    @Value("${sitraoro.bootstrap.mayorista.clave:}")
    private String clave;

    @Override
    public void run(ApplicationArguments args) {
        if ((documento == null || documento.isBlank()) && (clave == null || clave.isBlank())) {
            log.info("Cuenta inicial de mayorista no configurada; defina SITRAORO_BOOTSTRAP_MAYORISTA_DOCUMENTO y SITRAORO_BOOTSTRAP_MAYORISTA_CLAVE para habilitarla.");
            return;
        }
        if (documento == null || documento.isBlank() || clave == null || clave.length() < 10) {
            throw new IllegalStateException("La cuenta inicial requiere documento y clave de al menos 10 caracteres");
        }
        if (clave.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("La clave inicial de mayorista no puede superar 72 bytes UTF-8");
        }
        if (!cuentaAccesoService.existeCuenta(documento)) {
            cuentaAccesoService.crearCuenta(documento, clave, RolCuenta.G1_MAYORISTA, null, null, true);
            log.info("Cuenta inicial de mayorista creada desde configuración segura del entorno.");
        } else if (cuentaAccesoService.obtenerPorDocumento(documento).rol() != RolCuenta.G1_MAYORISTA) {
            throw new IllegalStateException("El documento configurado para la cuenta inicial ya pertenece a otro rol");
        }
    }
}
