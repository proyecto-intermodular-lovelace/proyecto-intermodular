# Manual de Usuario — Jefe de Economato
## Sistema Lovelace · Smarteconomato

> **Versión:** 1.0 · **Fecha:** Marzo 2026  
> **Para:** Responsable del Economato / Jefe de Almacén

---

## Introducción

El **Jefe de Economato** es el usuario con **control total** sobre el inventario físico del economato. Este manual cubre todas las operaciones que te competen: la recepción de mercancía de proveedores, la distribución interna a las distintas cocinas y aulas, el registro de bajas y mermas, y la consulta y auditoría del inventario permanente.

La aplicación está optimizada para su uso en **pantallas táctiles** (tablet o quiosco de 10" o superior). Los botones son grandes y las acciones están diseñadas para requerir el menor número de pasos posible.

---

## Acceso al Sistema

### Inicio de Sesión

1. En la pantalla de inicio, **pulsa** el campo **"Usuario"** e introduce tus credenciales de Jefe de Economato.
2. **Pulsa** **"Contraseña"** e introdúcela.
3. **Pulsa** **"Iniciar Sesión"**.
4. Accederás al **Panel de Control** principal, desde donde puedes navegar a todos los módulos.

<details>
  <summary>🖼️ <b>Ver Capturas de Pantalla (Click para expandir)</b></summary>
  
  **Modo Kiosco (Principal):**
  ![Vista Kiosco](../../assets/images/jefe_dashboard_principal_kiosk.JPG)
  
  **Otras resoluciones:**
  <a href="../../assets/images/jefe_dashboard_principal_desktop.JPG" target="_blank">💻 Ver versión Desktop</a> | <a href="../../assets/images/jefe_dashboard_principal_tablet.JPG" target="_blank">📱 Ver versión Tablet</a>
</details>

### Cerrar Sesión

**Pulsa** tu nombre de usuario en la esquina superior derecha → **"Cerrar Sesión"**. Hazlo siempre al terminar tu jornada de trabajo para evitar accesos no autorizados.

---

## Módulo 1 — RECEPCIÓN

El módulo de **Recepción** te permite registrar la entrada de nueva mercancía al economato, directamente desde el albarán del proveedor.

### 1.1 Registrar la entrada de mercancía de un proveedor

**Cuándo usarlo:** Cada vez que recibes una entrega física de un proveedor y quieres actualizar el stock.

1. En el menú lateral, **pulsa** **"Recepción"**.
2. Verás la pantalla de Recepción con un formulario en blanco.
3. **Pulsa** **"+ Nueva Recepción"**.

<details>
  <summary>🖼️ <b>Ver Capturas de Pantalla (Click para expandir)</b></summary>
  
  **Modo Kiosco (Principal):**
  ![Vista Kiosco](../../assets/images/jefe_recepcion_inicio_kiosk.JPG)
  
  **Otras resoluciones:**
  <a href="../../assets/images/jefe_recepcion_inicio_desktop.JPG" target="_blank">💻 Ver versión Desktop</a> | <a href="../../assets/images/jefe_recepcion_inicio_tablet.JPG" target="_blank">📱 Ver versión Tablet</a>
</details>

4. Rellena los datos de la cabecera del albarán:

| Campo | Descripción |
|---|---|
| **Proveedor** | Selecciona el proveedor del desplegable o escribe su nombre para buscarlo. |
| **Nº de Albarán** | Introduce el número de referencia del albarán en papel. |
| **Fecha de Recepción** | Por defecto es la fecha actual. Cámbiala si el albarán es de un día anterior. |
| **Notas** | Opcional. Útil para registrar incidencias (ej: "Caja con golpe, producto en buen estado"). |

![Vista de la interfaz](../../assets/images/jefe_recepcion_cabecera.JPG)

5. Añade los productos recibidos línea a línea:
   - **Pulsa** **"+ Añadir Producto"**.
   - Busca y selecciona el producto por nombre. Si el producto no existe en el sistema aún, consulta el apartado 1.2.
   - Introduce la **cantidad recibida** y la **unidad de medida** (kg, l, ud., caja, etc.).
   - Introduce el **precio unitario** que aparece en el albarán. Esto actualizará el coste medio del producto en el inventario.
   - Comprueba la **fecha de caducidad** si el producto es perecedero e introdúcela en el campo correspondiente.
   - Repite por cada artículo del albarán.

![Vista de la interfaz](../../assets/images/jefe_recepcion_linea.JPG)

6. Revisa el resumen de líneas y el total.
7. **Pulsa** **"Confirmar Recepción"**.

> ✅ El stock de cada producto recibido se incrementará automáticamente en el **Inventario Permanente**.

---

### 1.2 Controles de calidad en la recepción

Al registrar cada producto, puedes marcar si ha pasado el control de calidad:

- **✅ Conforme:** La mercancía está en perfecto estado.
- **⚠️ No Conforme:** Hay una incidencia (embalaje roto, temperatura incorrecta, etc.). Documenta la incidencia en el campo **"Notas"** y contacta con el proveedor.

> Los productos marcados como "No Conforme" igualmente actualizan el stock, pero quedan registrados con la incidencia para trazabilidad.

---

## Módulo 2 — DISTRIBUCIÓN INTERNA

El módulo de **Distribución Interna** registra la salida de productos del economato central hacia las distintas cocinas, aulas o talleres del centro.

### 2.1 Proceso de distribución: gestionar un pedido de profesor

La vía principal de distribución es a través de los **pedidos aprobados** de los profesores.

1. En el menú lateral, **pulsa** **"Herramientas"** → **"Pedidos"**.
2. Filtra por estado **"Pendiente"** para ver los pedidos que esperan tu revisión.
3. **Pulsa** sobre un pedido para ver su detalle.

`[Insertar Captura de Pantalla — Lista de pedidos pendientes de validación]`

4. Revisa las líneas del pedido: productos solicitados, cantidades y fecha de uso.
5. Comprueba visualmente si hay stock suficiente (el sistema te indicará en rojo si algún producto tiene stock insuficiente).
6. Si todo es correcto, **pulsa** **"Aprobar Pedido"**. El estado cambia a "Aprobado" y el profesor recibirá la notificación.
7. Si hay algún problema, **pulsa** **"Rechazar Pedido"**, escribe el motivo en el campo de texto y **pulsa** **"Confirmar"**.

`[Insertar Captura de Pantalla — Detalle de pedido con botones Aprobar / Rechazar]`

---

### 2.2 Registrar la salida física de productos

Una vez que los productos han sido físicamente entregados al profesor o al aula, debes confirmar la distribución para descontar el stock del inventario.

1. En la lista de pedidos, localiza el pedido con estado **"Aprobado"**.
2. **Pulsa** sobre él y revisa las líneas.
3. Si las cantidades entregadas coinciden exactamente con las solicitadas, **pulsa** **"Marcar como Distribuido"**.
4. Si la cantidad entregada difiere (por falta de stock), **edita** la cantidad en esa línea antes de confirmar, indicando la cantidad real entregada.
5. **Pulsa** **"Confirmar Distribución"**.

> ✅ El stock se reducirá automáticamente en el Inventario Permanente por las cantidades distribuidas.

`[Insertar Captura de Pantalla — Confirmación de distribución con cantidades editadas]`

---

### 2.3 Distribución directa (sin pedido previo)

Para salidas urgentes o no planificadas que no tienen un pedido asociado:

1. En el menú lateral, **pulsa** **"Distribución Interna"**.
2. **Pulsa** **"+ Nueva Distribución Directa"**.
3. Selecciona el **destino** (aula, cocina, taller) del desplegable.
4. Añade los productos y cantidades a distribuir.
5. Añade una **nota de justificación** (obligatoria para distribuciones directas).
6. **Pulsa** **"Confirmar Distribución"**.

---

## Módulo 3 — BAJAS DE INVENTARIO

El módulo de **Bajas** permite registrar la retirada de productos del inventario por causas distintas a la distribución: caducidad, deterioro, rotura, pérdida, o merma natural.

### 3.1 Registrar una baja de producto

1. En el menú lateral, **pulsa** **"Bajas de Inventario"**.

![Vista de la interfaz](../../assets/images/jefe_bajas.JPG)

3. Rellena el formulario:

| Campo | Descripción |
|---|---|
| **Producto** | Busca y selecciona el producto que se da de baja. |
| **Cantidad** | Introduce la cantidad exacta que se retira del inventario. |
| **Motivo** | Selecciona del desplegable: Caducidad, Deterioro/Putrefacción, Rotura accidental, Pérdida/Extravío, Merma de proceso. |
| **Fecha** | Por defecto es hoy. Modifícala si la incidencia ocurrió otro día. |
| **Observaciones** | Descripción adicional obligatoria para motivos de "Rotura" o "Pérdida". |

4. **Pulsa** **"Registrar Baja"**.

> ✅ La cantidad se descontará del stock inmediatamente. El registro de bajas queda guardado para auditorías.

---


## Módulo 4 — INVENTARIO PERMANENTE

El **Inventario Permanente** es la fotografía en tiempo real de todo el stock del economato. Se actualiza automáticamente con cada Recepción, Distribución y Baja que registras.

### 4.1 Consultar el stock actual

1. En el menú lateral, **pulsa** **"Inventario"**.
2. Verás dos pestañas: **Ingredientes** y **Materiales**. **Pulsa** la que necesites.
3. La tabla muestra: **Nombre del producto**, **Stock actual**, **Unidad**, **Stock mínimo** y **Valor de inventario** (precio × cantidad).

<details>
  <summary>🖼️ <b>Ver Capturas de Pantalla (Click para expandir)</b></summary>
  
  **Modo Kiosco (Principal):**
  ![Vista Kiosco](../../assets/images/jefe_inventario_permanente_kiosk.JPG)
  
  **Otras resoluciones:**
  <a href="../../assets/images/jefe_inventario_permanente_desktop.JPG" target="_blank">💻 Ver versión Desktop</a> | <a href="../../assets/images/jefe_inventario_permanente_tablet.JPG" target="_blank">📱 Ver versión Tablet</a>
</details>

4. Los productos con stock por debajo del mínimo configurado aparecerán resaltados en **naranja** como alerta de reposición.

---

### 4.2 Buscar y filtrar productos

- **Pulsa** la barra de búsqueda y escribe el nombre o parte del nombre del producto.
- Usa los filtros de la barra superior para acotar por **categoría** (lácteos, carnes, verduras, etc.) o por **estado de stock** (normal, bajo, agotado).

![Vista de la interfaz](../../assets/images/jefe_inventario_filtros_tablet.JPG)

---


### 4.4 Exportar el inventario (para informes)

1. En la pantalla del Inventario, **pulsa** el botón **"Exportar"** (icono de descarga).
2. Selecciona el formato: **PDF** (para imprimir) o **Excel/CSV** (para editar en hoja de cálculo).
3. El archivo se descargará o se enviará a la impresora del centro según la configuración.

---

## Resumen de Acciones Clave

| Acción | Módulo | Impacto en Stock |
|---|---|---|
| Recibir mercancía de proveedor | RECEPCIÓN | ⬆️ Sube el stock |
| Aprobar y distribuir un pedido | DISTRIBUCIÓN | ⬇️ Baja el stock |
| Registrar rotura / caducidad | BAJAS | ⬇️ Baja el stock |
| Auditoría de inventario | INVENTARIO | ↕️ Ajusta el stock al valor real |

---

## Preguntas frecuentes (FAQ)

**¿Puedo deshacer una recepción ya confirmada?**
No es posible deshacerla directamente. Si cometiste un error de cantidad, registra una **Baja** por la diferencia con el motivo "Error de entrada" para corregir el stock.

**¿Qué pasa si no tengo stock suficiente para un pedido?**
Rechaza el pedido indicando el motivo, o edita las cantidades distribuidas para entregar lo que haya disponible y notifica al profesor.

**¿Cómo sé qué productos están a punto de agotarse?**
En la vista de Inventario, los productos resaltados en **naranja** están por debajo del stock mínimo configurado. También puedes filtrar por "Stock bajo".

**¿Puedo añadir nuevos productos al catálogo del economato?**
Sí. En el módulo de Inventario, **pulsa** **"Gestión de Catálogo"** → **"+ Nuevo Producto"** y rellena su ficha completa (nombre, unidad, categoría, stock mínimo, proveedor habitual). Esta función puede estar restringida al Administrador del sistema según la configuración del centro.

---

## Seguridad y Buenas Prácticas

> [!CAUTION]
> **CIERRA SIEMPRE TU SESIÓN AL TERMINAR.**
> Tu cuenta de Jefe de Economato tiene los **máximos permisos** del sistema: puede registrar entradas de stock, dar de baja inventario, aprobar pedidos y exportar datos. Una sesión olvidada abierta puede comprometer toda la integridad del inventario del centro.

- **Pulsa** tu nombre de usuario (esquina superior derecha) → **"Cerrar Sesión"** cada vez que abandones el quiosco, aunque sea brevemente.
- Al final de la jornada, verifica que el quiosco haya regresado a la pantalla de inicio (sin ninguna sesión activa).
- **Nunca** compartas tus credenciales. Si otro responsable necesita acceso, solicita al administrador de IT que cree una cuenta con el rol adecuado.
- Ante cualquier operación irreversible (bajas masivas, ajustes de inventario), comprueba los datos dos veces antes de confirmar.
- Si detectas actividad sospechosa en el registro de operaciones (recepciones o bajas que no has realizado tú), reporta al administrador de IT de forma inmediata.

---

## Glosario de Términos

| Término | Definición |
|---|---|
| **Escandallo** | Ficha técnica de una receta que detalla los ingredientes, sus cantidades (bruta y neta), el porcentaje de merma y el coste total por ración. Los profesores los crean para solicitar materiales; tú los recibes como base de los pedidos. |
| **Merma** | Pérdida de peso o volumen que sufre un ingrediente al ser limpiado, pelado, cocinado o manipulado. Cuando registras una baja por "Merma de proceso", esta queda registrada para el cálculo de costes reales del centro. |
| **Stock de Seguridad** | Cantidad mínima configurada para cada producto. Cuando el stock cae por debajo de este umbral, el sistema lo resalta en naranja como alerta de reposición. Debes contactar con el proveedor para reabastecerte. |
| **Recepción** | Proceso de registro de la entrada de mercancía al economato procedente de un proveedor externo. Cada recepción queda vinculada a un albarán, una fecha y un proveedor para trazabilidad completa. |

---

## Resolución de Problemas (Troubleshooting)

### La pantalla táctil del quiosco no responde

1. Limpia la pantalla con un paño seco suave — las huellas en los dedos pueden reducir la sensibilidad.
2. Espera 15 segundos e inténtalo de nuevo con un toque firme y deliberado.
3. **No intentes reiniciar el quiosco por tu cuenta.** Un reinicio forzado en medio de una operación puede dejar registros de inventario en estado inconsistente.
4. Llama al **administrador de IT** para que revise el dispositivo.

### Aparece el error "Sin conexión al servidor" al intentar guardar una recepción o distribución

1. Espera 30 segundos — puede ser un corte de red momentáneo.
2. **No repitas la acción** (por ejemplo, pulsar "Confirmar Recepción" varias veces) sin cerrar antes el formulario: podrías duplicar la entrada de stock.
3. Si el error persiste, contacta con el administrador de IT. Informa de qué operación estabas realizando para que pueda comprobar si hay registros duplicados o incompletos en la base de datos.

### Un registro de recepción o baja se ha guardado con datos incorrectos

- Las operaciones ya confirmadas no se pueden deshacer directamente desde la interfaz por seguridad.
- Para rectificar una **recepción con cantidad errónea** de más: registra una **Baja** por la diferencia con el motivo "Error de entrada".
- Para rectificar una **baja errónea**: registra una nueva **Recepción** de ajuste por la cantidad que se retiró por error, con el mismo número de albarán y la nota "Ajuste por error de baja".
- Contacta con el administrador de IT si necesitas una corrección directa en la base de datos.

### El sistema tarda más de 10 segundos en cargar el inventario

1. Es normal si el catálogo es muy amplio. Usa los **filtros de categoría** para reducir la carga.
2. Si la lentitud es persistente, informa al administrador de IT para que revise el rendimiento del servidor.



---

*Manual generado para el Proyecto Lovelace · Smarteconomato — IES Domingo Perez Minik*
