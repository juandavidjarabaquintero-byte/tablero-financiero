# Conectar la app con el Google Sheet

1. Abre https://script.google.com y toca **Nuevo proyecto**. Ponle de nombre "Tablero Financiero Sync".
2. Borra el contenido del editor, pega todo el archivo `Code.gs` y guarda.
3. Arriba, en el selector de funciones, elige **configurar** y toca **Ejecutar**. Autoriza con tu cuenta de Google (Configuración avanzada → Ir a Tablero Financiero Sync → Permitir).
4. Abre **Registro de ejecución**: ahí salen 4 claves (Administrador, Auxiliar, Contador, Dueño máquina).
5. Toca **Implementar → Nueva implementación** → engranaje → **Aplicación web**.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Toca **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
6. En la app: **Ajustes → Sincronización con Google Drive** → pega la URL y la clave de **Administrador** → **Guardar y conectar**.

La primera sincronización envía todos tus datos al Sheet y crea la pestaña **INFORME CONTADOR**.

## Claves por persona

| Persona | Clave | Qué puede hacer |
|---|---|---|
| Dueño del tablero | Administrador | Todo |
| Auxiliar contable | Auxiliar | Registrar y editar |
| Contador | Contador | Ver todo e informes, sin modificar |
| Dueño de la máquina | Dueño máquina | Solo ve la retroexcavadora |

Cada persona instala la app desde el enlace, va a Ajustes y pone la misma URL con su clave. No necesitan cargar `datos-iniciales.json`.

Para ver las claves otra vez: ejecuta la función `verClaves`. Para cambiarlas todas: `cambiarClaves` (habrá que poner las nuevas en cada equipo).

## Editar desde el Sheet

- Las pestañas que empiezan por **APP** se pueden editar. Los cambios llegan a la app en la siguiente sincronización.
- Para agregar un gasto desde el Sheet, escribe una fila nueva en **APP Movimientos** con Fecha, Proyecto, Rubro y Valor (Proyecto, Rubro y Clasificación tienen lista desplegable).
- Para eliminar un registro, escribe **Sí** en la columna **Borrado**. No borres filas.
- La pestaña **INFORME CONTADOR** se reescribe sola; no la edites.
