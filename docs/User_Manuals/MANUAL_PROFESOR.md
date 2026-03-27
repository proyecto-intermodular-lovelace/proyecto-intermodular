# Manual de Usuario — Profesor

## Sistema Lovelace · SmartEconomato

> **Versión:** 1.0 · **Fecha:** Marzo 2026
> **Para:** Profesorado del centro escolar

---

## 1. Introducción

El **SmartEconomato** es el sistema de gestión digital del economato del CIFP Virgen de Candelaria. Permite al profesorado consultar el inventario, realizar sus propios pedidos para prácticas, y supervisar, editar y aprobar las solicitudes enviadas por sus alumnos.

El sistema está diseñado para funcionar en modo quiosco (pantalla táctil), aunque también es accesible desde dispositivos de escritorio y tableta.

---

## 2. Antes de empezar

Para acceder al SmartEconomato necesitarás:

- Una **dirección de correo electrónico**.
- Una **clave** (contraseña) asignada por el centro o creada durante el proceso de registro.

Si no dispones de credenciales puedes usar la opción de registro desde la pantalla de acceso. No compartas tu clave con otras personas. Al registrarte como usuario nuevo, por defecto tendrás rol de Alumno; un Administrador deberá cambiarte el rol a Profesor.

---

## 3. Acceso al Sistema y Navegación

### 3.1 Inicio de Sesión (Login) y Registro

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

**Enlaces disponibles en la pantalla de login:**

- **¿Problemas con el usuario o la clave?** — Toca este enlace para recuperar tu contraseña si tienes dificultades para acceder.
- **¿No tienes cuenta? Regístrate aquí** — Permite crear una nueva cuenta en el sistema.

**Registro de una nueva cuenta:**

Si eliges registrarte, accederás a un formulario donde deberás introducir tu **Nombre**, **Primer apellido**, **Segundo apellido** (opcional), tu **Email**, y una **Contraseña** (mínimo 6 caracteres) con su confirmación. Una vez completado, pulsa **Crear Cuenta** e inicia sesión con las credenciales que acabas de definir. Tras registrarte, solicita a un administrador que asigne a tu nueva cuenta el rol de Profesor.

![Vista de Kiosco](../../assets/images/alumno_login_inicio_kiosk.JPG)

---

### 3.2 Pantalla de Inicio (Dashboard)

Tras iniciar sesión correctamente, accederás al **Dashboard** o pantalla de inicio. Esta pantalla muestra:

- **Saludo personalizado:** Se muestra un saludo dinámico según la hora del día («Buenos días», «Buenas tardes» o «Buenas noches»), seguido de tu nombre y apellido. También se muestra el día de la semana y la fecha actual.
- **Etiqueta de rol:** En la cabecera del saludo aparece tu rol como **«Profesor / a»** con una etiqueta distintiva.
- **Acceso rápido:** Un panel de acceso circular/cuadrado con los principales módulos:

| Módulo | Descripción |
|--------|-------------|
| **Ingredientes** | Catálogo de ingredientes: altas, bajas, precios y rendimientos por unidad de medida. |
| **Materiales** | Gestión de materiales y equipamiento: stock actual, entradas y salidas de almacén. |
| **Categorías** | Gestión de categorías de ingredientes y materiales para clasificar productos. |
| **Recetas** | Fichas técnicas de recetas del centro: escandallo, costes y tabla de alérgenos. |
| **Bajas / Dev.** | Registro de bajas por caducidad o rotura y devoluciones a proveedores. |
| **Pedidos** | Solicitudes de pedido por clase, revisión docente y consolidado semanal del economato. |
| **Albaranes** | Registro y validación de albaranes de entrega recibidos de los proveedores. |
| **Proveedores** | Directorio de proveedores: contacto, condiciones comerciales y catálogo asociado. |

Toca cualquiera de los iconos de acceso rápido para navegar al módulo correspondiente. Al mantener el cursor sobre un elemento se mostrará una descripción emergente del módulo.

![Vista de Kiosco](../../assets/images/alumno_inventario_general_kiosk.JPG)

---

### 3.3 Navegación Global y Perfil

El sistema cuenta con opciones de navegación siempre disponibles.

#### Barra de Menú Principal (Navbar)

Visible bajo la cabecera en modo apaisado o desplazable, cuenta con la barra de navegación que lista:
- **Inicio**: Logotipo del CIFP Virgen de Candelaria. Siempre visible a la izquierda para volver al Dashboard cómodamente.
- **Volver**: Sólo visible si hay historial de navegación previo dentro de la sesión temporal. Vuelve a la pantalla precedente.
- Enlaces rápidos de iconos y texto para el resto de grandes elementos (**Ingredientes**, **Materiales**, **Recetas**, **Pedidos**, etc.).

#### Menú de Usuario y Cabecera

La barra superior contiene el logotipo del instituto (que sirve también para volver a Inicio al tacto) y el menú de usuario a la derecha. Tocando sobre tu nombre (y el icono de usuario) logras desplegar:

| Opción | Acción |
|--------|--------|
| **Perfil** | Accede a la pantalla de tu perfil personal. |
| **Modo claro/oscuro** | Cambia el tema visual global de la aplicación web a tonos claros o apagados. |
| **Cerrar sesión** | Cierra tu sesión activa y te devuelve rotando a la pantalla de inicio de sesión. |

#### Pantalla de Mi Perfil

Al tocar **Perfil** accedes a tu tarjeta de identidad, que muestra:
- Tus iniciales en colores generados, nombre completo, email, al igual que la etiqueta de rol asignada en base de datos.

**Sección «Datos personales»** — campos editables:
Puedes actualizar bajo demanda tu **Nombre**, **Primer apellido**, **Segundo apellido** y **Email**. Modifica los datos que desees y toca **Guardar cambios**. 

**Sección «Cambiar contraseña»:**
En esa misma ventana tienes la oportunidad de modificar tu contraseña introduciendo tu **Contraseña actual**, la **Nueva contraseña**, y tu validación en **Confirmar contraseña**. Toca el botón de cierre para guardar permanentemente tras rellenarlo, permitiéndote ver u ocultar esta contraseña usando el pequeño ojo en el interior de cada campo.

---

## 4. Consulta de Inventario

Como profesor, cuentas con credenciales de lectura para visualizar el inventario de todos los géneros cargados en la base de datos principal, idéntico a los alumnos, complementado de grandes vías de búsqueda.

### 4.1 Ingredientes

Para consultar el almacén alimentario de ingredientes, toca **Ingredientes** desde tu Dashboard o desde el Navbar flotante global.

La pantalla emite una **tabla de ingredientes** bajo columnas estructuradas tales como **ID (SKU)**, **Nombre**, **Categoría**, **Stock**, **Precio (€)** y **Rendimiento**.

**Herramientas de búsqueda y filtrado de la vista:**
- **Barra de búsqueda**: Puedes rastrear velozmente por ID (ej. ING-0021) o texto directo.
- **Selectores de Filtro (Dropdowns)**: Cajas desplegables te permitirán apartar resultados centrándose solo en cierta Categoría (Bebidas, Lácteos, Carnes...) o Proveedor.
- **Checkbox: Stock crítico**: Una casilla ideal para filtrar de inmediato y localizar únicamente productos cuyo nivel desciende por debajo del mínimo de seguridad establecido. Las filas verán su color de resalte modificado si están en este estado de alerta.
- **Botón Exportar CSV**: Puedes en un solo clic agrupar a hoja de cálculo tabulada a los ingredientes resultantes de tus filtros o seleccionados expresamente para exportarlo.
- **Resetear Filtros**: Un atajo fundamental con cruz visual que resetea la visual a todos los resultados iniciales.

**Acciones y ordenación de la tabla:**
- Clica simplemente en cualquiera de las cabeceras referidas para variar el ordenamiento entre ascendente/descendente (por su letra o valor base).
- En la última columna "Acciones", cuentas con un botón iconizado de ojo (👁) en cada fila individual para ir a su informe específico: la ficha técnica del producto. Podrás corroborar que otros botones (como Editar, símbolo de lápiz o Eliminar con papelera) estarán visibles pero desactivados por requerirse permisos de Almacén.

**Ver detalle técnico de un ingrediente:**
Accede haciendo clic en la lupa/ojo mencionado o con un rápido doble toque soble la franja de fila. Adentrándote visualizarás un informe bloqueado con apartados fundamentales: Nombre, Tipo de Unidad, SKU y la Descripción base del envase. Abajo visualizarás las cantidades netas con Precio, Stock actual en cifra y tu porcentaje de Rendimiento estandarizado.

> **Nota para profesores:** Las herramientas de escritura, tales como la creación base del ítem, modificaciones y bajas por caducidad se ubican restringidas en exclusiva sobre el perfil de un Gestor Económico.

![Vista de Kiosco](../../assets/images/alumno_inventario_general_kiosk.JPG)

---

### 4.2 Materiales

Este módulo gestiona la infraestructura inerte pero útil usada a diario en prácticas de centro. Ubicado bajo el botón de **Materiales**. Su estructura asimila casi de manera exacta al catálogo de ingredientes.

A lo largo de la cuadrícula, los docentes leerán variables como: **ID (SKU)**, **Nombre**, **Categoría** (Mobiliario, Seguridad, Packaging...), **Stock** final, y su **Precio** actual por cantidad.

Cuentas de igual manera con la inmensidad de **Filtros por nombre, categoría, proveedor y stock perjudicial**, ordenamientos de columnas y el motor de **exportación CSV**.

**Ver detalle de un bien material (MaterialDetailPage):**
Dentro encontrarás campos asimilados al campo superior, incluyendo ahora valores más amplios como su cifra de **Stock Mínimo** (utilizado para colorearlo a estado Crítico en rojo) y si está inactivo/activo logísticamente para pedirlo con antelación en futuras clases.

---

## 5. Gestión de Pedidos

Como educador docente, el eje operativo más amplio del sistema recae en que puedes proponer electrónicamente peticiones de materia prima propias, además de contar con potestad exclusiva para la **revisión, corrección y aprobación de pedidos de los alumnos**.

### 5.1 Vista de Pedidos

Uno de los principales ejes operativos es la proposición formal. Navega hasta **Pedidos** para originar o rastrear todos los estados logísticos.

**Pestañas (Tabs) Generales:**
Tu panorama general presentará una singular línea de pestañas inteligentes de monitorización que engloban cantidades: 
- **Mis pedidos**: Solicitudes que tú has generado como profesor.
- **Para revisar**: Solicitudes externas enviadas por alumnos en espera de tu luz verde.
- **Aprobados**: Peticiones ya validadas y corregidas de tu mano antes de volcar al equipo económico.
- **Todos**: El volcado total de los documentos.

[INSERTAR CAPTURA DE PANTALLA: Vista general de pestañas de pedidos del profesor]

#### Lista de los pedidos en curso

De la lista, aprecies rectángulos denominados "Tarjetas de pedido" exhibiendo a los ojos:
- Formato del estado visual de la petición (Con distintos colores referenciales en badges). El nombramiento y autoría del creador será visible. Para identificar velozmente las tuyas propias verás la palabra "Mío" en color azulado incrustada.
- El lunes de arranque que determina a su propia **Semana de práctica** (ej. "Semana del 11/04").
- Cantidad neta de productos en interior y hora de origen documental.

Dentro de esta tarjeta la visualización se amplifica. Realiza clic (o un tap de dedo en ella misma o su flecha lateral orientada) para examinar la tabla inferior incrustada con:
- **Producto:** Enlista sus productos ya escogidos y vinculados por creador.
- **Cant. solicitada:** Es la cantidad en su unidad base que el alumno/tú marcaste originariamente que necesitabas consumir.
- **Cant. aprobada:** Examen de revisión que el docente aplica para ajustar ese consumo en fase evaluadora. Consta guiones `—` si todavía el listado enviado está virgen.
- **Notas:** Comentarios o pautas escritas individuales que se dejaron anexados al requerimiento.

### 5.2 Revisión de Peticiones del Estudiantado (*Para Revisar*)

Como pilar de tu labor, examinarás y dictarás sentencia evaluativa. Las tarjetas en revisión (estados con badge azul de Enviado) permiten interactuar:
- **Botón de Edición del Alumno ("Editar")**: (Botón blanco con lápi). El más importante. Invocará a la tarjeta a su apertura y te habilita a que tú como docente rebajes o subas su **Cant. aprobada** individual por línea bajo un campo distintivo azulado si prevés carencias de inventariado, además de inyectar nueva rúbrica y notas antes de pasarlo al gestor.  
- Al emplear la edición profunda de revisión tendrás dos cierres: puedes **Guardar y Aprobar** (validando definitivamente tras tu arreglo en única pasada) o simplemente **Solo guardar** para dejar la modificación hecha a medias o en stand-by dentro de tu saco.
- **Botón "Aprobar"** (Línea Verde): Formaliza la petición empañetada validando idénticas sumas totales sugeridas sin corrección. Tras esto cae hacia el área del economato.
- **Botón "Rechazar"**: (Línea Roja y aspa). Ejerce un veto completo deteniendo el rumbo para siempre (Cancelado).

[INSERTAR CAPTURA DE PANTALLA: Modal de revisión y ajuste de pedidos por el docente]

### 5.3 Iniciar nuevas solicitudes ("Mis Pedidos")

No menos importante, cuentas con la libertad de creación del pedido.

Para redactar y armar el nuevo borrador de la propia clase o un demostrativo, sitúate en la cima y presiona **«+ Nueva solicitud»**. El sistema invoca en modo ventana (modal):

1. **Selector temporal de Semana**: Requisito donde, sin importar tu elección individual, el sistema estandarizará el puntero hacia el Lunes estricto de aquella semana de calendario a desarrollar tus labores en aula/taller.
2. **Espacio para Notas**: Bloque reservado que trasvasará en forma de texto todo detalle particular que tu perfil necesite.
3. **El listado de Recursos/Productos**:
   - Activa su buscador tocando el signo  **«+ Añadir producto»**.
   - Ingresa o selecciona sobre su catálogo en línea. Notarás al desplegar que el sistema se adelanta a tus errores reportándote instantáneamente en línea si el elemento cuenta con inventario base deficiente o crítico. Resulta aconsejable pedir un stock razonable en color verde.
   - Acomoda la unidad numérica decimal dentro de su bloque y redacta algo extra en la columna contigua si procediera. Se retirarán productos individualmente activando su pulsador con aspa roja de eliminación. 
4. **Registro Local**: Terminado lo anterior, cierra oprimiendo el mandato inferior explícito de "Guardar borrador" que asegurará internamente bajo la etiqueta exclusiva y Tab *Mis Pedidos* a esta tarjeta en espera de que pulses más adelante su botón definitivo que dice **Enviar** (con forma de avioneta y trazado azul). Tras mandarlo oprime sobre él **Editar** cualquier momento si fuese necesario o **Cancelar** con el aspa gris plomo (ambas funciones únicamente si sigue siendo Borrador).

---

## 6. Resolución de Problemas

### No es posible iniciar sesión en la Web App o formalizar Registro
- Observa y detente si logras percatar en la validación local si has dejado tu **Email** trunco o existiese separación mediante un espacio tanto en arranque como cola del string en su casilla de relleno para **Clave**.
- Operando a un nuevo registro exógeno o recuperación, visualiza tener mínimo 6 carácteres introducidos en cada cajón referencial a contraseñas emparejadas antes de pedir tramitar confirmaciones. 
- Debes recordar que cuentas creadas recientemente y por propia iniciativa no tendrán acceso al panel de aprobación docente de pedidos hasta que un Gestor/Responsable valide su estado elevándolo desde la bandeja base de Alumnos.
- Dispositivo en error 400 u omitido. Solicita siempre recuperación natural abriendo del acceso frontal el diálogo predeterminado "Problemas con mi cuenta".

### Error interno bloqueándome crear y alojar Borradores (Alertas de color rojo)
- El formulario obligatoriamente evalúa tener validación a tu fecha y semana de ejecución. Refresca un instante introduciendo un día (Lunes o equivalente) si te marca esta pauta en alertas de cabecera en estado *missing*. 
- Es posible que intentes Aprobar a un estatus o alumno sobre un elemento eliminado del historial global si cruzas pestañas inactivas. Actualiza ante desincronizaciones de esta gravedad ("Error al Aprobar / Error al Cancelar").

### Congelación de pantallas o mi catálogo de ingredientes figura en negro u oculto 
- El software hace iteraciones seguras pidiendo bases actualizadas al centro, por favor espera un ciclo o recarga formalmente la pestaña un instante logrando arrancar. Notarás una marca explícita avisando "Cargando...".
- Al persistir, confirma si logras retener vía Wi-Fi escolar u operativa tu señal remota de datos.  

---

*IES Domingo Pérez Minik — Gobierno de Canarias · SmartEconomato v1.0*
