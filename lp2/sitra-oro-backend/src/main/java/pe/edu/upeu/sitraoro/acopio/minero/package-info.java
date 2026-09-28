/** Portal de cuenta y autoservicio del minero, separado de las operaciones de compra. */
@org.springframework.modulith.ApplicationModule(allowedDependencies = {
        "seguridad::seguridad-service", "seguridad::seguridad-model",
        "acopio.parametros::parametros-service", "acopio.parametros::parametros-model",
        "acopio.parametros::parametros-dto", "acopio.mayorista::mayorista-service", "exception"
})
package pe.edu.upeu.sitraoro.acopio.minero;
