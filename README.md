# Herramientas de supervisión · Osinergmin

`index.html` es la **portada**, con dos módulos:

| Módulo | Archivo |
|---|---|
| Cambio de medidores | `medidores.html` (la app OSI-SCRCM de siempre, sin cambios de lógica) |
| Seguridad pública (P-228) | `seguridad.html` + carpeta `seguridad/` |

## Seguridad pública (P-228)

- Tipificaciones de la RCD 228-2009-OS/CD (Anexos 3 y 4).
- Base de 174 892 suministros de Loreto (`seguridad/suministros-loreto.js`): la dirección se precarga al digitar el suministro y se puede editar.
- Foto con fecha y coordenadas UTM; georreferencia de cada punto (GPS de la foto o del teléfono, o fijada a mano / arrastrando en el mapa).
- Pestaña **Mapa Observaciones**: misma configuración de capas que Cambio de medidores. Exporta los puntos propios (Excel, hoja *Georreferencia*), importa los de otros supervisores (varios archivos a la vez, o sus respaldos ZIP) y genera un consolidado en Excel + KML.
- Salidas: Excel (resumen + consolidado por SED + georreferencia), PDF y Word del anexo del panel fotográfico.
- Datos en IndexedDB del navegador; respaldo ZIP por supervisión, con fotos.

---

# OSI-SCRCM · Supervisión y Contraste de Medidores

Aplicación web para la supervisión en campo de medidores de energía eléctrica y
la emisión de actas **F7-PO241-PE-01-GO7**.

## Cómo se usa

Abre `index.html` y elige **Cambio de medidores** (o abre directo `medidores.html`). No requiere instalación ni servidor.

La app **arranca vacía**. Lo único que conserva entre sesiones, además de tu
avance, son los **supervisores**: se registran una vez y siguen ahí.

## Uso en celular

La app está pensada para trabajarse desde el teléfono: los filtros caben en
pantalla, los botones son grandes y las tablas se desplazan de lado.

**Compartir o descargar.** En la ventana de Actas F7 hay cuatro botones:
*Compartir PDF*, *Descargar PDF*, *Compartir Excel* y *Descargar Excel*.
Compartir abre el menú del teléfono (WhatsApp, correo, Drive); Descargar solo
guarda el archivo en el equipo. Los botones de Compartir aparecen únicamente
si la app se abre por **http o https**: si abres el `index.html` como archivo
suelto el teléfono no permite compartir y solo verás los de Descargar. Súbela
a cualquier hosting estático o sírvela desde la red de la oficina.

### Ver varias semanas a la vez

En la barra de arriba, el botón **Semanas** despliega las casillas para
encender una o varias. Sobre la agenda están además los mismos chips. Se pueden activar
varias: si en un mismo día avanzas en la semana 13 y en la 14, enciendes las
dos y la agenda, el mapa, los indicadores y las actas trabajan sobre ambas.
Al cargar la muestra arrancan todas encendidas.

El **acta recoge todo el avance** de las semanas encendidas, no solo una. Y
desde cada jornada puedes emitir el acta de ese día en particular.

### Filtrar por ubicación

Bajo la barra de semanas hay tres desplegables encadenados —departamento,
provincia y distrito— más uno de estado (pendientes o realizados). Al elegir
un departamento se acotan sus provincias, y al elegir provincia sus distritos.
Todo lo filtrado se refleja en la agenda, el mapa y los indicadores, y una
línea resume cuántos medidores quedan a la vista, con un enlace para quitarlos.

### Flujo de trabajo

1. **Carga la muestra.** Sube el Excel de la semana con *Seleccionar archivo*.
   También puedes agregar medidores uno por uno con **+ Agregar medidor**, sin
   pasar por Excel.
2. **Elige la jornada.** La muestra se ve agrupada por **fecha programada**:
   cada día es una jornada plegable con su avance (3/8) y sus distritos.
   Toca un medidor de la lista para activarlo y centrar el mapa.
3. **Marca el estado** con el botón verde **Realizado** o el rojo **No
   realizado**, justo encima del mapa.
4. **Completa los checks.** Al marcar Realizado se abre el formulario de la
   inspección: supervisor a cargo, control de sticker, conclusión y
   observaciones. Si no los tienes a mano, *Completar después*.
5. **Genera el acta**, en **PDF** o en **Excel**. Los dos salen del formato
   oficial: el PDF se escribe sobre el F7 y el Excel rellena la plantilla
   xlsx del mismo formato, conservando bordes, celdas combinadas y estilos.
   El Excel trae una hoja por acta más una hoja **Consolidado** con una fila
   por medidor, cómoda para informes, y cada acta cabe en una A4 horizontal. Dentro de cada jornada hay un botón **Generar acta F7 de
   esta jornada**, que toma solo los realizados de ese día. El botón **Actas
   F7** de arriba toma los de toda la semana. En ambos casos se agrupan de
   **5 en 5**: 20 realizados → 4 actas. Ahí completas los datos del medidor
   reemplazante y generas el PDF, con las firmas en blanco.

Una jornada suele traer unos 5 medidores, que es justo lo que cabe en un acta.

### Agregar medidores a mano

**+ Agregar medidor** pide fecha programada, semana y N° de suministro como
mínimo; el resto es opcional. Si cargas las coordenadas UTM (X e Y) el punto
aparece en el mapa; sin ellas sigue estando en la agenda y en el acta. No
admite dos veces el mismo suministro en la misma semana.

### Sobre el formato del acta

El acta **no se redibuja**. La app lleva incrustado el archivo original
`F7-PO241-PE-01-GO7` y escribe únicamente los datos en sus celdas, así que el
formato estandarizado se respeta tal cual. Solo se sustituyen los marcadores
que están para completarse (`ARM-…….`, `Ciudad, dd de mm de aaaa` y
`<<Nombre de Concesionaria>>`).

### Firmantes

En la cabecera del acta puedes cargar el nombre y DNI de quien firma por la
concesionaria y por OSINERGMIN. Si los dejas vacíos, el espacio queda en
blanco para firmar a mano.

### Concesionaria

Viene precargada como **ELECTRO ORIENTE S.A.** en todas las actas. Puedes
cambiarla en la cabecera si alguna corresponde a otra empresa.

### Año de fabricación

El del **medidor retirado** sale de la columna `EDAD MEDIDOR` de la muestra,
que ya contiene el año (2014, 2018…). Aparece ya escrito en la tabla de Actas
F7, pero el campo es editable: si la muestra lo trae vacío o equivocado, se
corrige ahí y lo corregido es lo que sale en el PDF y en el Excel. El del
**medidor reemplazante** sí se completa a mano.

### Verificación inicial (aferición)

Si la cargas con la base de reemplazos, viene llena. Si no, se completa a mano
en la tabla de Actas F7: hay tres columnas para el certificado, la fecha y la
empresa que afiere. La empresa se autocompleta con las que ya usaste.

### Importar la base de reemplazos

**Importar base de reemplazos** sube el Excel donde ya está registrado lo que
se hizo en campo y lo cruza con la muestra por **N° de suministro**. De ahí
toma, para cada medidor:

- medidor reemplazante: serie, marca/modelo y año
- número de homologación y certificado de aprobación de modelo
- documento y fecha del reemplazo
- **verificación inicial (aferición)**: certificado, fecha y empresa que afiere
- control de sticker y observaciones

Los datos quedan **guardados a la espera**: el medidor sigue pendiente hasta
que en campo lo marques como Realizado. En ese momento el formulario aparece
con todo lleno y solo tienes que marcar los **Sí/No del sticker**.

En la agenda, un 📥 señala los medidores que ya tienen sus datos listos.

Antes de aplicar nada muestra cuántos registros cruzan y cuáles no están en la
muestra. Dos opciones, ambas desactivadas por defecto: traer también el control
de sticker del archivo (si ya viene verificado), y marcar los medidores como
Realizado en el acto (si ya se atendieron).

Reconoce la hoja tal como la exporta la macro, con los encabezados abajo y las
columnas agrupadas; distingue la serie del medidor retirado de la del
reemplazante, y convierte las fechas que Excel guarda como número.

#### Qué columnas debe tener ese Excel

Solo **SUMINISTRO** es obligatoria: es la que cruza con la muestra. Todo lo
demás es opcional, y lo que falte queda en blanco para completarlo en la app.
El orden de las columnas no importa, se reconocen por el nombre.

| Columna | Va a |
|---|---|
| `SUMINISTRO` | cruce con la muestra (obligatoria) |
| `N° de Serie Nuevo` | medidor reemplazante · serie |
| `Marca/Modelo Nuevo` | medidor reemplazante · marca |
| `Año de Fabricación Nuevo` | medidor reemplazante · año |
| `Número de Homologación del Medidor` | medidor reemplazante |
| `Certificado de Aprobación de Modelo` | medidor reemplazante |
| `N° Documento que Acredita` | acta de reemplazo · número |
| `Fecha del Reemplazo` | acta de reemplazo · fecha |
| `Nº de Certificado de Aferición` | verificación inicial · número |
| `Fecha de Aferición` | verificación inicial · fecha |
| `Empresa que afiere` | verificación inicial · empresa |
| `¿Colocó Sticker en Medidor?` | control de sticker (opcional) |
| `¿El color corresponde?` | control de sticker (opcional) |
| `¿Son visibles los datos?` | control de sticker (opcional) |
| `¿Registro de datos es correcto?` | control de sticker (opcional) |
| `Observaciones` | observaciones del supervisor |

`PLANTILLA-base-reemplazos.xlsx` trae esas columnas listas con ejemplos.

También lee **la hoja de la macro tal cual**, sin tocarla: encuentra los
encabezados aunque estén en la fila 41, y usa los grupos combinados
(«Medidor retirado» / «Medidor Reemplazante») para no confundir las columnas
que se repiten. Las fechas valen como texto `dd/mm/aaaa` o como número de
Excel, y los Sí/No admiten `SI`, `NO`, `X`, `1` y `0`.

### Numeración de las actas y supervisores

El `ARM-…….` impreso en el formato es solo un ejemplo: el prefijo real es el
**código del supervisor** que levanta el acta, y puede cambiar de un
suministro a otro.

El N° de Acta de Inspección sigue el formato del procedimiento:

```
ARM - EOR - CONO05 - 2026 - II-E - 001
 │     │      │        │      │     └─ correlativo
 │     │      │        │      └─ semestre
 │     │      │        └─ año
 │     │      └─ código del supervisor
 │     └─ empresa concesionaria
 └─ actividad
```

Los cinco primeros se fijan una vez en la cabecera del modal de Actas F7 y
quedan guardados. **Numerar** aplica el correlativo a todas las filas tomando
el código del supervisor de cada suministro; si uno no lo tiene, usa el de la
cabecera. También puedes escribir el número a mano.

Registra a los supervisores en la pestaña **Supervisores** (nombre y código).
Al marcar un suministro como Realizado eliges quién lo atendió.

### Tipos de actividad

Solo existen dos: **Contraste (C)** y **Reemplazo / Cambio de Medidor (R)**.
Reemplazo y cambio de medidor son la misma actividad; si el Excel trae `CM`,
se convierte a `R` automáticamente.

## Funciona sin internet

Todas las librerías están en la carpeta `vendor/`, así que la app abre y genera
actas sin conexión. Lo único que necesita internet es el mapa base: sin señal
los puntos siguen funcionando, solo que el fondo del mapa aparece vacío.

**Mantén la carpeta `vendor/` junto a `index.html`.**

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Interfaz |
| `app.js` | Lógica, generación de actas y persistencia |
| `styles.css` | Estilos propios |
| `vendor/` | Librerías locales (Tailwind, Leaflet, SheetJS, jsPDF, pdf-lib) |
| `vendor/f7-plantilla.js` | El formato oficial F7 incrustado. **No lo borres:** sin él no se generan actas |
| `muestra_medidores.xlsx` | Muestra de referencia |

## Dónde se guardan los datos

En el almacenamiento local del navegador, en el mismo equipo. Se conserva al
cerrar y reabrir. **Limpiar sesión** borra la muestra y el avance pero
**mantiene los supervisores**. Para llevarlo a otra máquina o resguardarlo usa
**Backup de Progreso** (descarga un `.json`) e **Importar Backup**.

Si cambias de navegador o borras los datos de navegación, se pierde lo no
respaldado.
