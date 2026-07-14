# Seguimiento — Backlog de Remediación Técnica CMS-tourup

Estado global del backlog priorizado para remediar hallazgos del code review.

## Leyenda

- `⬜` Pendiente
- `🔄` En progreso
- `✅` Completado
- `❌` Bloqueado / Cancelado

---

## PR-1: Estabilidad de búsqueda, estados y slugs

| # | Prioridad | Descripción | Estado | Notas |
|---|-----------|-------------|--------|-------|
| TASK-001 | P0 | Corregir búsqueda de viajeros por columna inexistente (`SearchController.php`) | ⬜ | |
| TASK-002 | P0 | Unificar estados válidos de viajes (`TripController.php`, enum `TripStatus`) | ⬜ | |
| TASK-011 | P1 | Garantizar unicidad de slug en viajes (`TripController.php`) | ⬜ | |
| TASK-024 | P2 | Garantizar unicidad de slug en programas (`ProgramController.php`) | ⬜ | Reutilizar helper de TASK-011 |

---

## PR-2: Booking core y persistencia segura

| # | Prioridad | Descripción | Estado | Notas |
|---|-----------|-------------|--------|-------|
| TASK-003 | P0 | Corregir autoasignación de asientos con comparación estricta (`BookingService.php`) | ⬜ | |
| TASK-004 | P0 | Preservar sesión de booking si falla validación (`BookingController.php`) | ⬜ | |
| TASK-005 | P0 | Migrar snapshots JSON a tipo de dato seguro (`VARCHAR(255)` → `TEXT`/`JSON`) | ⬜ | |
| TASK-019 | P2 | Blindar disponibilidad de booking con control transaccional (`BookingService.php`) | ⬜ | Coordinar con TASK-003, TASK-004, TASK-005 |

---

## PR-3: Themes y consistencia del wizard

| # | Prioridad | Descripción | Estado | Notas |
|---|-----------|-------------|--------|-------|
| TASK-006 | P0 | Blindar acceso a `$agency` en themes (32 archivos) | ⬜ | |
| TASK-007 | P1 | Reemplazar URLs hardcodeadas en JS por rutas nombradas (`itinerary.blade.php`) | ⬜ | |
| TASK-008 | P1 | Sustituir `addslashes()` por serialización segura a JS (`itinerary.blade.php`) | ⬜ | Agrupar con TASK-007 |
| TASK-009 | P1 | Evitar duración incorrecta cuando fechas son nulas (`show.blade.php`) | ⬜ | |
| TASK-010 | P1 | Proteger acceso a `spots` en wizard de viajeros (`step3-traveler-form.blade.php`) | ⬜ | Replicar en todos los themes |
| TASK-014 | P1 | Cambiar duplicación de viaje de GET a POST con CSRF (`show.blade.php`) | ⬜ | |
| TASK-015 | P1 | Alinear indicador de progreso con pasos reales del wizard (`_progress.blade.php`) | ⬜ | |

---

## PR-4: Seguridad, dominio y cleanup

| # | Prioridad | Descripción | Estado | Notas |
|---|-----------|-------------|--------|-------|
| TASK-012 | P1 | Cifrar contraseña de email almacenada en settings (`SettingsController.php`) | ⬜ | Coordinar con TASK-022 |
| TASK-013 | P1 | Validar pertenencia del viajero al viaje antes de asignar alojamiento (`AccommodationController.php`) | ⬜ | |
| TASK-016 | P2 | Eliminar eager load duplicado en `TripTravelerController.php` | ⬜ | |
| TASK-017 | P2 | Remover eager load innecesario en `AccommodationController.php` | ⬜ | |
| TASK-018 | P2 | Regenerar mapa de asientos al cambiar filas/columnas (`TransportController.php`) | ⬜ | |
| TASK-020 | P2 | Validar parámetro year en dashboard (`DashboardController.php`) | ⬜ | |
| TASK-021 | P2 | Preservar estado rejected en sincronización documental (`TripDocumentController.php`) | ⬜ | |
| TASK-022 | P2 | Añadir validación estructurada al módulo de settings (`SettingsController.php`) | ⬜ | Coordinar con TASK-012 |
| TASK-023 | P2 | Eliminar cast huérfano `is_active` del modelo `Trip.php` | ⬜ | |

---

## Resumen

| PR | Total | P0 | P1 | P2 | ✅ Completadas |
|----|-------|----|----|----|---------------|
| PR-1 | 4 | 2 | 1 | 1 | 0 |
| PR-2 | 4 | 3 | 0 | 1 | 0 |
| PR-3 | 7 | 1 | 6 | 0 | 0 |
| PR-4 | 9 | 0 | 2 | 7 | 0 |
| **Total** | **24** | **6** | **9** | **9** | **0** |
