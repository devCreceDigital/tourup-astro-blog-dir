# Backlog de Remediación Técnica — CMS-tourup

Backlog técnico para remediar hallazgos del code review del repositorio CMS-tourup.

## Priorización

| Prioridad | Significado |
|-----------|-------------|
| **P0** | Rompe producción, persistencia, reservas o renderización crítica |
| **P1** | Seguridad, integridad de negocio, consistencia de dominio o UX severamente degradada |
| **P2** | Robustez, concurrencia, optimización o deuda técnica relevante |

## Definition of Done

- El fix está implementado en código y revisado por PR.
- Existe al menos un test automatizado o, cuando no sea viable, un smoke test documentado.
- No rompe flujos críticos de viajes, reservas, viajeros, alojamiento o themes.
- Si afecta booking, se valida manualmente el flujo completo de reserva.
- Si afecta vistas multi-theme, se prueba con y sin agencia cargada.
- Si afecta seguridad o settings, se valida persistencia segura y comportamiento en UI.

---

## PR-1: Estabilidad de búsqueda, estados y slugs

### TASK-001 — Corregir búsqueda de viajeros por columna inexistente

**Prioridad:** P0

**Archivo:** `app/Http/Controllers/SearchController.php`

**Problema:** La búsqueda usa `full_name`, pero la tabla `travelers` tiene `first_name` y `last_name`; causa error SQL.

**Remediación:**
- Reemplazar `where('full_name', ...)` por búsqueda compuesta sobre `first_name` y `last_name`.
- Preferir `CONCAT(first_name, ' ', last_name)` si la UX requiere búsqueda por nombre completo.
- Mantener scoping por agencia si el módulo ya opera en contexto multi-tenant.

**Criterios de aceptación:**
- Buscar por nombre devuelve viajeros correctos.
- Buscar por apellido devuelve viajeros correctos.
- Buscar por nombre completo devuelve coincidencias esperadas.
- La búsqueda no lanza SQL error con resultados vacíos.

---

### TASK-002 — Unificar estados válidos de viajes entre controlador y base de datos

**Prioridad:** P0

**Archivo:** `app/Http/Controllers/TripController.php`
**Relacionados:** migración/enum de trips, vistas de formulario, factories, seeds

**Problema:** El validador acepta estados que la BD no soporta.

**Remediación:**
- Crear enum PHP o clase de constantes `TripStatus`.
- Reemplazar validaciones ad hoc por `Rule::in(...)` usando esa fuente central.
- Revisar formularios, seeds, badges, filtros y lógica de actualización.

**Criterios de aceptación:**
- Crear o editar viaje con estados permitidos persiste correctamente.
- Estados no permitidos responden 422 y no llegan a la BD.
- UI y filtros reflejan exactamente los valores válidos.

---

### TASK-011 — Garantizar unicidad de slug en viajes

**Prioridad:** P1

**Archivo:** `app/Http/Controllers/TripController.php`

**Problema:** El slug puede duplicarse y terminar en error de BD.

**Remediación:**
- Añadir `Rule::unique(...)` en validación.
- Si el slug es automático, crear helper o servicio de slug único.
- Verificar índice único en la base de datos.

**Criterios de aceptación:**
- Crear viaje con slug existente responde validación amigable.
- Editar viaje mantiene slug actual sin falso positivo.
- La BD conserva restricción de unicidad.

---

### TASK-024 — Garantizar unicidad de slug en programas

**Prioridad:** P2

**Archivo:** `app/Http/Controllers/ProgramController.php`

**Problema:** Mismo patrón de slug duplicado que en viajes.

**Remediación:**
- Aplicar validación `unique`.
- Reutilizar helper/servicio de generación de slug de TASK-011.

**Criterios de aceptación:**
- No se pueden guardar programas con slug duplicado.
- La UX devuelve mensaje de validación claro.

---

## PR-2: Booking core y persistencia segura

### TASK-003 — Corregir autoasignación de asientos con comparación estricta

**Prioridad:** P0

**Archivo:** `app/Services/BookingService.php`

**Problema:** La lógica compara enteros con strings tipo `1A`; coerción laxa puede dar coincidencias falsas.

**Remediación:**
- Normalizar representación de asientos como strings (`1A`, `1B`, etc.).
- Reemplazar `in_array` por comparación estricta `in_array($seatCode, $occupiedSeats, true)`.
- Extraer la lógica a una clase o método aislable para testear.

**Criterios de aceptación:**
- El sistema encuentra el primer asiento libre real.
- Un valor `1` no coincide con `1A`.
- Si no hay asientos libres, devuelve estado controlado sin asignación inválida.

---

### TASK-004 — Preservar sesión de booking si falla validación

**Prioridad:** P0

**Archivo:** `app/Http/Controllers/BookingController.php`

**Problema:** `session()->pull('booking_data')` elimina el estado antes de validar.

**Remediación:**
- Cambiar `pull()` por `get()` al inicio del flujo.
- Limpiar sesión solo al completar satisfactoriamente la confirmación.
- Evaluar encapsular el manejo de sesión del wizard en un helper o service.

**Criterios de aceptación:**
- Si la validación falla, la sesión mantiene `booking_data`.
- Si la reserva se confirma, la sesión se limpia al final.
- El usuario puede corregir el formulario sin perder el progreso.

---

### TASK-005 — Migrar snapshots JSON a tipo de dato seguro

**Prioridad:** P0

**Archivos:** migración de tabla de bookings, modelo Eloquent con casts

**Problema:** `pricing_group_snapshot` y `extras_snapshot` como `VARCHAR(255)` pueden truncar JSON reales.

**Remediación:**
- Migrar columnas a `TEXT` o `JSON` según soporte y uso.
- Añadir casts `array` en el modelo si se procesan como estructuras.
- Verificar compatibilidad con datos existentes.

**Criterios de aceptación:**
- Se pueden guardar snapshots mayores a 255 caracteres.
- Los snapshots se leen completos tras persistencia.
- No hay truncamiento silencioso.

---

### TASK-019 — Blindar disponibilidad de booking con control transaccional

**Prioridad:** P2 (alta)

**Archivo:** `app/Services/BookingService.php`

**Problema:** Race condition en availability check por ausencia de `lockForUpdate()`.

**Remediación:**
- Envolver verificación y reserva en transacción.
- Aplicar `lockForUpdate()` sobre registros que controlan disponibilidad.
- Revisar idempotencia básica del flujo de confirmación.

**Criterios de aceptación:**
- Dos intentos concurrentes no consumen el mismo cupo/asiento de forma doble.
- La disponibilidad final queda consistente tras concurrencia.

---

## PR-3: Themes y consistencia del wizard

### TASK-006 — Blindar acceso a `$agency` en themes

**Prioridad:** P0

**Archivos:** 32 archivos de theme donde aparece `$agency->active_theme ?? 'ethos_earth'`

**Problema:** El acceso a propiedad ocurre antes del coalescing; si `$agency` es null, la vista rompe.

**Remediación:**
- Sustituir por `optional($agency)->active_theme ?? 'ethos_earth'` o `$agency?->active_theme ?? 'ethos_earth'`.
- Mejorar arquitectura resolviendo `$activeTheme` una sola vez en controller o view composer.

**Criterios de aceptación:**
- Las vistas renderizan con agencia presente.
- Las vistas renderizan sin agencia sin lanzar excepción.
- El fallback `ethos_earth` se aplica cuando no existe tema activo.

---

### TASK-007 — Reemplazar URLs hardcodeadas en JS por rutas nombradas

**Prioridad:** P1

**Archivo:** `resources/views/.../itinerary.blade.php`

**Problema:** Rutas `/panel-agencia/...` hardcodeadas dentro de JavaScript.

**Remediación:**
- Inyectar URLs con `route()` y serializarlas con `@json()`.
- Eliminar concatenaciones manuales de strings de ruta.

**Criterios de aceptación:**
- El JS usa rutas nombradas provenientes del backend.
- Un cambio de prefijo o nombre base no obliga a editar strings hardcodeados.

---

### TASK-008 — Sustituir `addslashes()` por serialización segura a JavaScript

**Prioridad:** P1

**Archivo:** `resources/views/.../itinerary.blade.php`

**Problema:** `addslashes()` no es apropiado para contexto JS embebido.

**Remediación:**
- Reemplazar por `@json($variable)` o equivalente.
- Revisar todos los bloques inline con interpolación en JavaScript.

**Criterios de aceptación:**
- Los datos embebidos en JS se serializan correctamente.
- Strings con comillas, saltos de línea o caracteres especiales no rompen el script.

---

### TASK-009 — Evitar duración incorrecta cuando fechas son nulas

**Prioridad:** P1

**Archivo:** `resources/views/.../show.blade.php`

**Problema:** `Carbon::parse(null)` puede derivar en fecha actual y mostrar duración falsa.

**Remediación:**
- Añadir guardas nulas antes del parseo.
- Mostrar fallback claro si falta una fecha.

**Criterios de aceptación:**
- No se muestra duración falsa cuando faltan fechas.
- Con fechas válidas, la duración es correcta.

---

### TASK-010 — Proteger acceso a spots en wizard de viajeros

**Prioridad:** P1

**Archivo:** `resources/views/.../step3-traveler-form.blade.php`

**Problema:** Acceso directo a `$data['spots']` sin null check.

**Remediación:**
- Usar `data_get($data, 'spots', [])` o validación previa.
- Replicar la corrección en todos los themes equivalentes.

**Criterios de aceptación:**
- La vista no rompe si `spots` no existe.
- El wizard maneja estado incompleto con fallback controlado.

---

### TASK-014 — Cambiar duplicación de viaje de GET a POST con CSRF

**Prioridad:** P1

**Archivo:** `resources/views/.../show.blade.php`
**Relacionados:** rutas y controlador de duplicación

**Problema:** Duplicar viaje es acción mutante expuesta vía GET.

**Remediación:**
- Crear ruta POST para duplicar.
- Actualizar botón o formulario de UI con `@csrf`.
- Revisar permisos/policies del endpoint.

**Criterios de aceptación:**
- La duplicación solo funciona vía POST.
- Un GET a la antigua ruta no muta datos.
- La acción conserva permisos y feedback correcto en UI.

---

### TASK-015 — Alinear indicador de progreso con pasos reales del wizard

**Prioridad:** P1

**Archivos:** `_progress.blade.php` de todos los themes

**Problema:** Se muestra un paso 7 "Pago" aunque no existe la vista correspondiente.

**Remediación:**
- Eliminar temporalmente el paso inexistente, o
- Implementar el paso real, o
- Marcarlo explícitamente como paso externo/no disponible.

**Criterios de aceptación:**
- El número de pasos del indicador coincide con el flujo implementado.
- El usuario no ve pasos fantasmas.

---

## PR-4: Seguridad, dominio y cleanup

### TASK-012 — Cifrar contraseña de email almacenada en settings

**Prioridad:** P1

**Archivo:** `app/Http/Controllers/SettingsController.php`

**Problema:** La contraseña de correo se almacena en texto plano.

**Remediación:**
- Usar `Crypt::encryptString()` al guardar y desencriptar solo al usar.
- Evitar exponer el valor real en formularios de edición.
- Evaluar mover secretos fijos a `.env`.

**Criterios de aceptación:**
- El valor persistido en BD no es legible en texto plano.
- El envío de correo sigue funcionando.
- Un update parcial no borra la contraseña existente por accidente.

---

### TASK-013 — Validar pertenencia del viajero al viaje antes de asignar alojamiento

**Prioridad:** P1

**Archivo:** `app/Http/Controllers/AccommodationController.php`

**Problema:** Se puede asignar un viajero a una habitación sin verificar que pertenezca al viaje.

**Remediación:**
- Validar que el viajero pertenezca al trip antes de asignarlo.
- Validar también que la habitación pertenezca al mismo viaje.
- Mover la invariante a policy, action o service si el flujo se repite.

**Criterios de aceptación:**
- No se puede asignar viajero externo al viaje.
- Sí se puede asignar viajero perteneciente al viaje.
- La respuesta de error es controlada y no produce corrupción de datos.

---

### TASK-016 — Eliminar eager load duplicado en TripTravelerController

**Prioridad:** P2

**Archivo:** `app/Http/Controllers/TripTravelerController.php`

**Problema:** Eager loading repetido que genera consultas desperdiciadas.

**Remediación:**
- Revisar cadena de `with()` y remover duplicados.
- Medir con Laravel Debugbar o Telescope.

**Criterios de aceptación:**
- La consulta carga relaciones solo una vez.
- Se reduce el número de queries sin cambiar el resultado funcional.

---

### TASK-017 — Remover eager load innecesario en AccommodationController

**Prioridad:** P2

**Archivo:** `app/Http/Controllers/AccommodationController.php`

**Problema:** Relaciones cargadas sin uso.

**Remediación:**
- Eliminar cargas no usadas.
- Verificar impacto en serialización o vistas relacionadas.

**Criterios de aceptación:**
- El controlador funciona igual con menos consultas o payload.

---

### TASK-018 — Regenerar mapa de asientos al cambiar filas/columnas

**Prioridad:** P2

**Archivo:** `app/Http/Controllers/TransportController.php`

**Problema:** Al modificar filas o columnas del bus, el mapa de asientos no se reconstruye.

**Remediación:**
- Recalcular asientos al cambiar dimensiones.
- Definir estrategia para conservar asientos ocupados válidos o bloquear cambios incompatibles.

**Criterios de aceptación:**
- Cambiar filas/columnas actualiza el mapa de asientos.
- El inventario final coincide con la configuración del transporte.

---

### TASK-020 — Validar parámetro year en dashboard

**Prioridad:** P2

**Archivo:** `app/Http/Controllers/DashboardController.php`

**Problema:** `year` entra sin validación.

**Remediación:**
- Añadir validación `integer` y rango razonable.
- Definir fallback si el año no es válido.

**Criterios de aceptación:**
- Años inválidos no rompen el dashboard.
- El controlador responde con valor por defecto o error controlado.

---

### TASK-021 — Preservar estado rejected en sincronización documental

**Prioridad:** P2

**Archivo:** `app/Http/Controllers/TripDocumentController.php`

**Problema:** `syncDocStatus` sobrescribe el estado `rejected`.

**Remediación:**
- Revisar transiciones válidas y bloquear sobrescritura indebida.
- Convertir la lógica en una máquina de estados explícita o tabla de transición.

**Criterios de aceptación:**
- Un documento rechazado no se reactiva automáticamente sin transición permitida.
- Los estados evolucionan según reglas explícitas.

---

### TASK-022 — Añadir validación estructurada al módulo de settings

**Prioridad:** P2

**Archivo:** `app/Http/Controllers/SettingsController.php`

**Problema:** Settings sin validación formal.

**Remediación:**
- Crear Form Requests por tipo de setting.
- Validar strings, puertos, emails, flags y credenciales según formato esperado.

**Criterios de aceptación:**
- Inputs inválidos no se guardan.
- El usuario recibe errores claros por campo.

---

### TASK-023 — Eliminar cast huérfano `is_active` del modelo Trip

**Prioridad:** P2

**Archivo:** `app/Models/Trip.php`

**Problema:** Existe cast para una columna que no está en el esquema.

**Remediación:**
- Eliminar el cast si la columna no existe.
- Si la columna debería existir por dominio, documentar y crear task aparte.

**Criterios de aceptación:**
- El modelo no contiene casts de columnas inexistentes.
- No hay side effects en serialización ni lógica derivada.

---

## Secuencia de ejecución sugerida

| PR | Objetivo | Tasks |
|----|----------|-------|
| PR-1 | Estabilidad de búsqueda, estados y slugs | TASK-001, TASK-002, TASK-011, TASK-024 |
| PR-2 | Booking core y persistencia segura | TASK-003, TASK-004, TASK-005, TASK-019 |
| PR-3 | Themes y consistencia del wizard | TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-014, TASK-015 |
| PR-4 | Seguridad, dominio y cleanup | TASK-012, TASK-013, TASK-016, TASK-017, TASK-018, TASK-020, TASK-021, TASK-022, TASK-023 |
