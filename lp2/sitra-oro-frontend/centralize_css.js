const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const cssFiles = [
    'app/core/inicio/inicio.css',
    'app/features/mayorista/inicio-mayorista.css',
    'app/features/mayorista/mayorista-ui.css',
    'app/features/acopio/operaciones.css',
    'app/features/acopio/inicio-acopio.css',
    'app/features/minero/perfil-minero.css'
];

let combined = '';
for (const rel of cssFiles) {
    const full = path.join(srcDir, rel);
    if (fs.existsSync(full)) {
        combined += `\n/* === ${rel} === */\n` + fs.readFileSync(full, 'utf8');
        fs.writeFileSync(full, '/* Estilos globales en styles.scss para presupuesto < 4kB */\n', 'utf8');
    }
}

const dest = path.join(srcDir, 'app-components.css');
fs.writeFileSync(dest, combined, 'utf8');

const stylesScss = path.join(srcDir, 'styles.scss');
let scssContent = fs.readFileSync(stylesScss, 'utf8');
if (!scssContent.includes('app-components.css')) {
    scssContent += "\n@import './app-components.css';\n";
    fs.writeFileSync(stylesScss, scssContent, 'utf8');
}
console.log('Estilos centralizados exitosamente.');
