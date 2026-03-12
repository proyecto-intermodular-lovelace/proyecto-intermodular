# Manual de Usuario — Alumno

## Sistema Lovelace · SmartEconomato

> **Versión:** 1.0 · **Fecha:** Marzo 2026
> **Para:** Alumnos del centro escolar

---

## 1. Introducción

El **SmartEconomato** es el sistema de gestión digital del economato del CIFP Virgen de Candelaria. Permite a los alumnos consultar el inventario de ingredientes y materiales disponibles en el centro.

El sistema está diseñado para funcionar en modo quiosco (pantalla táctil), aunque también es accesible desde dispositivos de escritorio y tableta.

---

## 2. Antes de empezar

Para acceder al SmartEconomato necesitarás:

- Una **dirección de correo electrónico** institucional o la que te haya facilitado el profesorado.
- Una **clave** (contraseña) asignada por el centro o creada durante el proceso de registro.

Si no dispones de credenciales o las has olvidado, indica a tu profesor o contacta con la administración del centro. No compartas tu clave con otras personas.

---

## 3. Acceso al Sistema y Navegación

### 3.1 Inicio de Sesión (Login)

Al acceder a la URL del SmartEconomato verás la pantalla de inicio de sesión, identificada con el logotipo del **CIFP Virgen de Candelaria** y el título **SmartEconomato**.

El formulario de acceso contiene los siguientes campos:

| Campo | Descripción |
|-------|-------------|
| **Email** | Tu dirección de correo electrónico registrada en el sistema. |
| **Clave** | Tu contraseña de acceso. |

**Pasos para iniciar sesión:**

1. Toca el campo **Email** e introduce tu dirección de correo electrónico.
2. Toca el campo **Clave** e introduce tu contraseña.
3. Toca el botón **Entrar** para acceder al sistema.

**Mensajes de error:**

- Si el campo **Email** o el campo **Clave** se dejan en blanco al pulsar «Entrar», aparecerá un mensaje de error indicando que el campo es obligatorio.
- Si las credenciales son incorrectas, se mostrará un mensaje de error general bajo el formulario.

**Otros enlaces disponibles en la pantalla de login:**

- **¿Problemas con el usuario o la clave?** — Toca este enlace si tienes dificultades para acceder.
- **¿No tienes cuenta? Regístrate aquí** — Permite solicitar el registro en el sistema.

![Vista de Kiosco](../../assets/images/alumno_login_inicio_kiosk.JPG)

---

### 3.2 Pantalla de Inicio (Dashboard)

Tras iniciar sesión correctamente, accederás al **Dashboard** o pantalla de inicio. Esta pantalla muestra:

- **Saludo personalizado:** Se muestra un saludo dinámico según la hora del día («Buenos días», «Buenas tardes» o «Buenas noches»), seguido de tu nombre y apellido. También se muestra el día de la semana y la fecha actual.
- **Etiqueta de rol:** En la esquina superior derecha del saludo aparece tu rol como **«Alumno / a»** con una etiqueta de color verde.
- **Acceso rápido:** Un panel de acceso rápido con los siguientes módulos disponibles:

| Módulo | Descripción |
|--------|-------------|
| **Ingredientes** | Catálogo de ingredientes: precios y rendimientos por unidad de medida. |
| **Materiales** | Gestión de materiales y equipamiento: stock actual. |
| **Recetas** | Fichas técnicas de recetas del centro. |
| **Bajas / Dev.** | Registro de bajas por caducidad o rotura y devoluciones. |
| **Pedidos** | Solicitudes de pedido por clase. |
| **Albaranes** | Registro de albaranes de entrega. |
| **Proveedores** | Directorio de proveedores. |

Toca cualquiera de los iconos de acceso rápido para navegar al módulo correspondiente. Al mantener el dedo sobre un elemento se mostrará una descripción emergente del módulo.

![Vista de Kiosco](../../assets/images/alumno_inventario_general_kiosk.JPG)

---

### 3.3 Navegación Global y Perfil

La barra de navegación superior (**cabecera**) está siempre visible desde cualquier pantalla del sistema y ofrece las siguientes opciones:

#### Volver al Inicio

Toca el **logotipo del CIFP Virgen de Candelaria** (imagen en la esquina superior izquierda de la cabecera) para volver al **Dashboard** desde cualquier sección de la aplicación. Este botón siempre está disponible.

#### Mi Perfil

En la esquina superior derecha de la cabecera aparece tu nombre y apellido con un icono de usuario. Tocando sobre ellos se despliega un menú con las siguientes opciones:

| Opción | Acción |
|--------|--------|
| **Perfil** | Accede a la pantalla de tu perfil personal. |
| **Modo claro/oscuro** | Cambia el tema visual de la aplicación. |
| **Cerrar sesión** | Cierra tu sesión activa y te devuelve a la pantalla de inicio de sesión. |

#### Pantalla de Perfil

Al tocar **Perfil** accedes a la pantalla **Mi perfil**, donde encontrarás:

**Tarjeta de identidad:**
Muestra tus iniciales en un avatar circular, tu nombre completo, tu dirección de correo electrónico y tu rol (etiqueta «Alumno / a»).

**Sección «Datos personales»** — campos editables:

| Campo | Descripción |
|-------|-------------|
| **Nombre** | Tu nombre de pila (mínimo 2 caracteres). |
| **Primer apellido** | Tu primer apellido (mínimo 2 caracteres). |
| **Segundo apellido** | Tu segundo apellido (opcional). |
| **Email** | Tu dirección de correo electrónico. |

Modifica los datos que desees y toca el botón **Guardar cambios** para confirmar. El sistema mostrará un mensaje de confirmación o de error según el resultado de la operación.

**Sección «Cambiar contraseña»:**

Esta sección solo aparece cuando estás viendo tu propio perfil. Permite cambiar tu contraseña actual por una nueva. Contiene tres campos:

| Campo | Descripción |
|-------|-------------|
| **Contraseña actual** | Introduce tu contraseña en uso. |
| **Nueva contraseña** | Nueva contraseña (mínimo 6 caracteres). |
| **Confirmar contraseña** | Repite la nueva contraseña para confirmar. |

Toca el botón **Cambiar contraseña** para aplicar el cambio. Cada campo tiene un icono para mostrar u ocultar los caracteres escritos.

---

## 4. Consulta de Inventario

### 4.1 Ingredientes

Para acceder al inventario completo de ingredientes, toca el enlace **«Gestión avanzada»** desde el resumen de ingredientes, o navega directamente desde el Dashboard tocando **Ingredientes**.

La pantalla muestra una **tabla de ingredientes** con las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| *(Casilla de selección)* | Permite seleccionar uno o varios ingredientes. |
| **ID (SKU)** | Código de referencia del ingrediente. |
| **Nombre** | Nombre del ingrediente. |
| **Categoría** | Categoría a la que pertenece. |
| **Stock** | Cantidad disponible en almacén (con la unidad de medida). Se muestra en rojo si el stock está por debajo del mínimo. |
| **Precio (€)** | Precio por unidad. |
| **Rendimiento** | Factor de rendimiento del ingrediente. |
| **Acciones** | Botones para ver el detalle del ingrediente. |

**Herramientas de búsqueda y filtrado:**

- **Campo de búsqueda** — Filtra los ingredientes por cualquier campo (ID, nombre, etc.).
- **Selector de Categorías** — Filtra por categoría del ingrediente.
- **Selector de Proveedores** — Filtra por proveedor.
- **Botón «Resetear»** — Elimina todos los filtros aplicados.
- **Casilla «Stock crítico»** — Muestra únicamente los ingredientes cuyo stock está por debajo del mínimo establecido.

**Ordenación:** Toca la cabecera de cualquier columna (ID, Nombre, Categoría, Stock, Precio, Rendimiento) para ordenar la tabla de forma ascendente o descendente.

**Ver detalle de un ingrediente:**
- Selecciona un ingrediente (toca la casilla a la izquierda de la fila) y toca el botón **«Ver Detalle»**.
- También puedes tocar el icono de ojo (👁) en la columna de acciones de cada fila.
- O bien, haz doble toque sobre una fila para ir directamente al detalle.

La pantalla de detalle muestra los campos: Nombre del producto, Tipo Unidad, Descripción, Precio/Unidad, Stock, % Rendimiento, Relación (calculado), Categoría y Proveedor.

> **Nota para alumnos:** La creación, modificación y eliminación de ingredientes están reservadas al profesorado y al personal del economato. Los alumnos solo pueden consultar la información.

**Exportación:** Al pie de la tabla se encuentra el botón **«Exportar CSV»**, que descarga los ingredientes visibles (o los seleccionados) en formato de hoja de cálculo.

**Volver al resumen:** Toca **«← Volver a Resumen»** para regresar a la vista anterior.

![Vista de Kiosco](../../assets/images/alumno_inventario_general_kiosk.JPG)

---

### 4.2 Materiales

La sección de materiales es accesible desde el Dashboard tocando **Materiales**, o desde el resumen de inventario mediante el botón de gestión avanzada.

La pantalla muestra una **tabla de materiales** con las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| *(Casilla de selección)* | Permite seleccionar uno o varios materiales. |
| **ID (SKU)** | Código de referencia del material. |
| **Nombre** | Nombre del material. |
| **Categoría** | Categoría del material (Utensilios, Packaging, Limpieza, Seguridad, Mobiliario, Maquinaria, Papelería, Otros). |
| **Stock** | Cantidad disponible (con unidad de medida). Se muestra en rojo si el stock está por debajo del mínimo. |
| **Precio (€)** | Precio por unidad. |
| **Acciones** | Botones para ver el detalle del material. |

**Herramientas de búsqueda y filtrado:**

- **Campo de búsqueda** — Filtra los materiales por SKU o nombre.
- **Selector «Todas las categorías»** — Filtra por categoría.
- **Selector «Todos los proveedores»** — Filtra por proveedor.
- **Botón «Resetear Filtros»** — Elimina todos los filtros aplicados.
- **Casilla «Solo stock crítico»** — Muestra únicamente los materiales con stock bajo mínimo.

**Ordenación:** Toca la cabecera de cualquier columna para ordenar la tabla.

**Ver detalle de un material:**
- Toca el icono de ojo (👁) en la columna de acciones.
- O haz doble toque sobre una fila.

La pantalla de detalle muestra los campos: Nombre del Material, Unidad de Medida, SKU, Descripción, Precio/Unidad, Stock, Stock Mínimo, Rendimiento, Categoría y Proveedor.

> **Nota para alumnos:** La creación, modificación y eliminación de materiales están reservadas al profesorado y al personal del economato. Los alumnos solo pueden consultar la información.

**Exportación:** Al pie de la tabla se encuentra el botón **«Exportar CSV»**, que descarga los materiales visibles (o los seleccionados) en formato de hoja de cálculo.

**Volver al resumen:** Toca **«← Volver a Resumen»** para regresar a la vista anterior.

---

## 5. Mis Pedidos

### 5.1 Vista de Pedidos

Para acceder a tus pedidos, toca **Pedidos** en el Dashboard. La pantalla **«Mis Pedidos»** muestra todas tus solicitudes y permite crear nuevas.

**Encabezado de la pantalla:**
- Título: «Mis Pedidos»
- Subtítulo: «Solicita materiales e ingredientes para tus prácticas»
- Botón **«+ Nueva solicitud»** — Abre el formulario para crear un nuevo pedido.

#### Lista de pedidos

Cada pedido se muestra como una tarjeta desplegable con la siguiente información visible:

| Dato | Descripción |
|------|-------------|
| **Estado del pedido** | Etiqueta de estado (por ejemplo: *Borrador*, *Enviado*, etc.). |
| **Semana del pedido** | Indica la semana para la que se solicitan los productos («Semana del [fecha]»). |
| **Número de productos** | Cantidad de productos incluidos en la solicitud. |
| **Fecha de creación** | Fecha en la que se creó el pedido. |

Si un pedido está en estado **Borrador**, aparecen dos botones adicionales:

| Botón | Acción |
|-------|--------|
| **Enviar** | Envía el borrador al profesor para su revisión. Solo disponible si el pedido contiene al menos un producto. |
| **Cancelar** | Elimina el borrador (solicita confirmación). |

Toca la tarjeta de cualquier pedido para **desplegarla** y ver el detalle de sus productos. La tabla de detalle contiene las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| **Producto** | Nombre del producto solicitado y su unidad de medida. |
| **Cant. solicitada** | Cantidad que has pedido. |
| **Cant. aprobada** | Cantidad aprobada por el profesor (muestra «—» si aún no ha sido revisado). |
| **Notas** | Observaciones asociadas al producto (muestra «—» si no hay notas). |

#### Crear una nueva solicitud de pedido

Al tocar **«+ Nueva solicitud»** se abre el formulario **«Nueva solicitud de pedido»** con los siguientes campos:

| Campo | Descripción |
|-------|-------------|
| **Semana del pedido** *(obligatorio)* | Selecciona la fecha de la práctica. La fecha se ajusta automáticamente al lunes de la semana seleccionada. |
| **Notas del pedido** | Campo de texto libre para añadir observaciones generales del pedido (p. ej.: «Para la práctica del martes de repostería»). |
| **Productos** | Lista de productos que deseas solicitar. |

**Añadir productos al pedido:**

1. Toca el enlace **«+ Añadir producto»** para mostrar el buscador de productos.
2. Escribe el nombre del ingrediente o material en el campo de búsqueda.
3. Selecciona el producto deseado de la lista desplegable. Se mostrará el nombre, la unidad de medida y el tipo (Ingrediente o Material).
4. El producto se añade a la lista del pedido. Para cada producto puedes ajustar:
   - **Cantidad solicitada** — Introduce el número de unidades que necesitas.
   - **Notas** — Observaciones específicas para ese producto.
5. Para eliminar un producto de la lista, toca el icono de la **X** junto al mismo.

**Guardar o enviar el pedido:**

- Toca **«Guardar borrador»** para guardar el pedido en estado *Borrador* sin enviarlo todavía al profesor.
- Desde la lista de pedidos, cuando estés preparado, toca **«Enviar»** en la tarjeta del borrador para enviarlo al profesor.
- Toca **«Cancelar»** en la ventana modal para cerrarla sin guardar cambios.

---

## 6. Resolución de Problemas

### No puedo iniciar sesión

- Verifica que el campo **Email** y el campo **Clave** estén correctamente cumplimentados.
- Comprueba que no haya espacios al principio o al final del correo electrónico.
- Si has olvidado tu contraseña, toca el enlace **«¿Problemas con el usuario o la clave?»** en la pantalla de login.
- Si el problema persiste, contacta con tu profesor o con la administración del centro.

### La pantalla no carga o muestra un error de red

- Comprueba que el dispositivo está conectado a la red Wi-Fi del centro.
- Cierra la pestaña o la aplicación y vuelve a acceder.
- Si el problema persiste, comunícalo al responsable del aula o al personal técnico del centro.

### No veo mis pedidos o el inventario no carga

- Espera unos segundos: los datos se cargan desde el servidor y puede haber un breve retraso.
- Si el mensaje de error persiste, comprueba la conexión de red e inténtalo de nuevo.
- Comunica el incidente al profesor si el problema no se resuelve.

---

*CIFP Virgen de Candelaria — Gobierno de Canarias · SmartEconomato v1.0*
