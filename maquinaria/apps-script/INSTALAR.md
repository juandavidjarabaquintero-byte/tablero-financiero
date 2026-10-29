# Tablero de Maquinaria · Instalación

## 1. Conectar el Drive del dueño (una sola vez, con su cuenta de Google)
1. Abre https://script.google.com con la cuenta del dueño → **Nuevo proyecto** → nómbralo "Tablero de Maquinaria".
2. Borra el contenido, pega todo `Code.gs` y guarda.
   - Opcional: en `DRIVE_FOLDER` pega el ID de la carpeta del Drive donde quiere todo (lo que va después de `/folders/` en el enlace). Si se deja vacío se crea la carpeta **Tablero de Maquinaria** en Mi unidad.
3. Elige la función **configurar** → **Ejecutar** → autoriza.
4. En **Registro de ejecución** quedan: enlace de la carpeta, enlace del Sheet de datos y las 3 claves.
5. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: **Yo** · Acceso: **Cualquier usuario** → copia la URL que termina en `/exec`.

## 2. Instalar la app en cada equipo
Enlace: https://juandavidjarabaquintero-byte.github.io/tablero-financiero/maquinaria/
- iPhone: Safari → Compartir → Agregar a pantalla de inicio.
- Android: Chrome → ⋮ → Instalar aplicación.
- PC: Chrome o Edge → ícono de instalar.

En **Ajustes → Sincronización** pega la URL `/exec` y la clave:

| Persona | Clave | Puede |
|---|---|---|
| Administrador | ADM-… | Todo |
| Auxiliares de campo | AUX-… | Registrar y editar, no borrar |
| Dueño | CON-… | Ver todo e informes, sin modificar |

## 3. Qué queda en el Drive
- `Tablero de Maquinaria · Datos` (Sheet): una pestaña por tipo de registro y la pestaña **INFORME DUEÑO**, que se actualiza sola.
- `Soportes/`: fotos y facturas por máquina, fondos, gastos y pagos de clientes.
- `Informes/AAAA-MM/`: PDF guardados con **Descargar → Guardar en el Drive**.

Todo se registra sin internet y se envía al Drive cuando vuelve la señal.
