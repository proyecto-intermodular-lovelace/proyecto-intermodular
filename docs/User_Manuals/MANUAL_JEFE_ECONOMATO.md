# Manual de Usuario — Jefe de Economato

## Sistema Lovelace · SmartEconomato

> **Versión:** 1.0 · **Fecha:** Marzo 2026
> **Para:** Jefatura de Economato y responsables de compras

---

## 1. Introducción

El **SmartEconomato** es el sistema de gestión digital del economato del CIFP Virgen de Candelaria. Como responsable logístico (Jefe de Economato), dispones del control total sobre el ecosistema: la administración de inventario (ingredientes y materiales), el catálogo de proveedores, el control de albaranes de entrada y, mediante herramientas de agregación, la consolidación de pedidos semanales para crear órdenes de compra globales.

El sistema está diseñado para funcionar de manera óptima en modo quiosco (pantalla táctil), aunque es accesible desde dispositivos de escritorio o tableta.

---

## 2. Antes de empezar

Para acceder al SmartEconomato con el rol de máxima jerarquía necesitarás:

- Una **dirección de correo electrónico** institucional o administrativa.
- Una **clave** (contraseña) con privilegios de administrador/economato, otorgada por la dirección técnica del centro.

No compartas tu clave con otras personas, ya que tus acciones repercuten directamente en el stock real.

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

1. Toca el campo **Email** e introduce tu dirección de correo electrónico administrativa.
2. Toca el campo **Clave** e introduce tu contraseña.
3. Toca el botón **Entrar** para acceder al sistema.

[INSERTAR CAPTURA DE PANTALLA: Ventana de acceso del Jefe de Economato]

### 3.2 Pantalla de Inicio (Dashboard)

Tras iniciar sesión correctamente, accederás al **Dashboard** o pantalla de inicio. Esta pantalla muestra:

- **Saludo personalizado:** Se muestra un saludo dinámico según la hora del día («Buenos días», «Buenas tardes» o «Buenas noches»).
- **Etiqueta de rol:** En la cabecera del saludo aparece tu rol destacado como **«Jefe de Economato»** de forma distintiva.
- **Acceso rápido:** Un panel interactivo de botones con los diferentes módulos disponibles: **Ingredientes**, **Materiales**, **Categorías**, **Bajas / Dev.**, **Pedidos**, **Albaranes** y **Proveedores**. Toca cualquiera de ellos para desplazarte ágilmente a su gestor táctil.

[INSERTAR CAPTURA DE PANTALLA: Dashboard Principal del Jefe de Economato]

### 3.3 Navegación Global y Perfil

#### Barra de Menú Principal (Navbar)
La cabecera permanente o barra lateral alberga atajos de iconos e imágenes que abren paso al regreso instantáneo a la pantalla principal tocando sobre el logotipo de la escuela. En las diferentes sub-vistas encontrarás el botón de **Volver** en forma de flecha, útil para retornar pasos atrás.

#### Menú de Usuario
Tocando tu nombre logras desplegar:
- **Perfil**: Acceso a tu tarjeta personal para recambiar tu nombre, datos y contraseñas.
- **Modo claro/oscuro**: Transición del tema visual de toda la plataforma a tu comodidad.
- **Cerrar sesión**.

---

## 4. Gestión Integral de Inventario

Como Jefe de Economato, posees el control absoluto en la lectura, edición y supresión sobre el catálogo. 

### 4.1 Ingredientes
Para gestionar el almacén de alimentación, pulsa **Ingredientes** desde el Dashboard.

La pantalla presenta tu tabla de productos con ordenamientos rápidos tocando sus cabeceras (**ID SKU**, **Nombre**, **Categoría**, **Stock**, **Precio** y **Rendimiento**).

**Herramientas Logísticas Superiores:**
- **Filtros y Búsqueda**: Localiza elementos instantáneamente, y siembra tus resultados usando los selectores de búsqueda o los desplegables de Categoría o Proveedor en el área superior.
- **Checkbox "Stock crítico"**: Permite localizar instantáneamente, marcando de rojo su fila, aquellos artículos cuyo nivel sea peligrosamente inferior al nivel estratégico.
- **Exportar CSV**: Al tacto con este botón, se descargará un modelo Excel/CSV con el estado total de tus víveres en las columnas mostradas, ideal para inspecciones formales.

**Mantenimiento del Catálogo (CRUD):**
- **Crear un Ingrediente**: Toca el botón de la cabecera **"+ Crear"**. Te abrirá un formulario in-situ que requiere: Nombre, Unidad de medida (kg, g, L...), el SKU, sumarle una Descripción, tasar el Precio/Unidad, fijar tu Stock actual en almacén y el pertinente *Stock Mínimo* de alerta, porcentaje de Rendimiento y enlazarlo a su Categoría y Proveedor por un formulario desplegable. Al pulsar **"Crear Ingrediente"** se insertará con vida a la red.
- **Modificar (Editar)**: Efectuando tu búsqueda y resaltando en el recuadro "tick" al ingrediente deseado logras activarle su edición o usando en la columna de acción su botón de bolígrafo (✏️). El formulario regresará pero listo a manipular para alterar, por ejemplo, precios de la nueva semana.
- **Eliminar y Desactivar**: Usa el icono de papelera visible en su extrema derecha para prescindir permanentemente al género; no obstante, si cuenta con traza logística registrada en sistema, el servidor arrojará un error protector. En dicho entorno logístico, entra al producto vía el bolígrafo y **marca la casilla "Activo" a falso/inactivo** del elemento, haciéndolo omitible para futuros alumnos, ocultando tu carga obsoleta.

[INSERTAR CAPTURA DE PANTALLA: Vista principal de Gestión de Ingredientes como Jefe]

### 4.2 Materiales
Sigue la misma operativa estructural, accesible tocando en **Materiales**.
En ella, se albergan equipamiento y fungibles. Las labores para añadir, modificar y purgar son idénticas bajo sus propios formularios para un control infraestructural. Las unidades de medida abarcarán formatos paralelos como "caja", "unidad", "m" o "m²".

---

## 5. Gestión de Proveedores y Categorización

Este área permite administrar las conexiones externas empresariales y clasificar metódicamente lo que luego compras en volúmenes.

### 5.1 Directorio de Proveedores
Accede tocando el botón de **Proveedores**.

Este panel interactivo permite un control rápido del directorio. 
- **Nuevo Proveedor**: Toca el botón **"+ Nuevo Proveedor"**. Podrás insertar sus datos como su Razón social, el Email oficial mercantil, Teléfono táctil de comunicación e introducir Notas internas útiles de conocimiento para todo el personal como las condiciones o fletes.
- **Alteraciones**: Igual que a un género o ingrediente, empleas los iconos inmersos del lápiz (Editar) y el engranaje visible (Checkbox visible para Pausar sus tratos, que desactivará al proveedor).

### 5.2 Estructura de Categorías
Desde el módulo **Categorías**, logras dotar al programa web de una inteligencia clasificatoria.
- Creas ramas táctilmente tecleando sobre **"+ Nueva Categoría"**, designando el subtítulo interno y de qué estirpe general es: "Ingrediente" o "Material".
- Visualiza instantáneamente recuentos numéricos sobre a cuántos productos amparan desde su sección "Total" o empleando sus borrados o modificaciones directas al igual que en módulos precedentes.

[INSERTAR CAPTURA DE PANTALLA: Directorio y Gestión de Proveedores]

---

## 6. Operaciones Logísticas: Pedidos y Albaranes

### 6.1 Gestión de Pedidos Propios y Supervisión Global
Como Jefe de Economato (Superadmin), heredas de forma inherente todas las capacidades operativas de los roles de Profesor y Alumno dentro de la plataforma.

Esto te otorga dos privilegios fundamentales en el módulo de **Pedidos**:
- **Creación de pedidos propios:** Al igual que un alumno o profesor, gozas de la potestad para confeccionar y emitir tus propios borradores de pedido individuales para el economato, cubriendo necesidades urgentes o extraordinarias del departamento.
- **Acceso y control global ("Para Revisar"):** Dispones de autoridad de anulación (override) global. Podrás acceder a la pestaña de revisión y tomar control directo para evaluar, editar en caliente, aprobar o rechazar libremente **cualquier pedido** emitido por cualquier alumno o docente en el ecosistema, agilizando cuellos de botella.

### 6.2 Revisión y Consolidación de Pedidos
En el módulo **Pedidos**, tu papel interviene formalmente consolidando en una única lista todos los pedidos dispersos previamente revisados por el profesorado (o por ti mismo).

El centro de este módulo agrupa unas pestañas interactivas, pero tu atención reside primariamente sobre **Por consolidar** (Pedidos aprobados en espera de ser unificados).

**El proceso exhaustivo de Consolidación hacia la Compra Final:**
1. Navega hacia esa misma pestaña **Por consolidar**.
2. Localiza al lateral izquierdo sus casillas selectoras y chequealas consecutivamente para elegir todos los pedidos requeridos en pro forma para esa fecha, o toca a su herramienta aliada "Seleccionar todos".
3. Percatarás iluminarse en el cintillo un poderoso botón azul denominado **"Consolidar X pedidos"**. Púlsalo.
4. En el modelo emergente final, selecciona qué día base (semana formal temporal a ejecutarse en compras) ha de regir a tal sumatorio. Aquí disfrutarás de un resumen matemático donde el sistema, por atrás, ya habrá comprimido los pedidos sumándolos inteligentemente los artículos y listándolos en tabla final totalitaria.
5. Al pisar el mandato **"Confirmar y consolidar"**, los borras a consolidado histórico. Inmediatamente y de forma autónoma el servicio levantará y ejecutará tu hoja local **PDF "Pedido de Compra — I.E. Lovelace"** a modo de formato papel en tabla lista para tu impresora o tu envío por email.

[INSERTAR CAPTURA DE PANTALLA: Modal de Consolidación de Pedidos en Economato abriendo la vista PDF final pre-impresión]

### 6.3 Entrada de Mercancía: Albaranes
Al llegar carga y volumen de forma física a muelle logístico en el instituto, tu deber administrativo es introducir sus guías al sistema documentándolas tocando la vista de **Albaranes**.

- Entrando en esa tarjeta o módulo, ve directivo a pulsar sobre **"+ Nuevo albarán"**.
- Enuncia allí formalmente el **Código** del albarán legal en cartulina recibida del repartidor, asigna tu fecha y su **Proveedor**.
- Más abajo se halla el campo validador de stock: tocando **"+ Añadir línea"** abres apartados por renglones, escoges al activo logístico dentro de todo el sistema por texto predictivo y atastas obligatoriamente la cantidad contante desembalada como el **Precio** cobrado.
- Asegura esta diligente entrada tocando el remate final **"Crear albarán"**. Estos productos pasarán a subir tus niveles en crudo incrementado en stock total e impactará sobre sus rendimientos en reportes contables del almacén.

[INSERTAR CAPTURA DE PANTALLA: Formulario de Nuevo Albarán de recepción con sus selectores de ingreso y suma en directo]

---

## 7. Resolución de Problemas

### No es posible iniciar sesión en la Web App
- Repara en no visualizar un espacio fantasma anterior a tu **Email** en la barra de usuario.
- Notifica al coordinador administrador por si tus privilegios no portaran el permiso de "SUPERADMIN" o "ADMIN", incapacitándote de la total botonadura descrita si se te confiriera roles más básicos.

### Error visual al consolidar pedidos
- La aplicación exige obligatoriamente asignar una fecha (semana lectiva destino) antes de pulsar "Confirmar y consolidar", asomando una cinta roja de error en caso opuesto. Repasa el calendario o campo fecha local para salvar esa detención y continuar tu consolidatorio logístico.
- Asegúrate nunca elegir a alguien en el rubro "Pendientes", estas no permiten fusiones pre-revisión de instructor y nunca asomará este botón "Consolidar X pedidos". Solo podrás realizar aglutinaciones desde la subventana temporal de "Por consolidar".

### El sistema impide borrar un producto, categoría o a un proveedor externo
- La estructura de interrelación no permite dejar al instituto sin históricos de compra u órdenes. Si un proveedor proveyó un material, y ese a una orden, ya jamás podrá evaporarse de los contables. Soluciónalo entrando a modo editar (el botón del Lápiz) usando su respectiva tabla y **desmarcando su recuadro "Activo"**. Esto sepultará y ocultará dicho campo lográndose prescindir en apariencia de la aplicación.

---

*IES Domingo Pérez Minik — Gobierno de Canarias · SmartEconomato v1.0*
