# Sistema de Distribución Equitativa de Reportes

## Descripción General

Se ha implementado un sistema de asignación automática y equitativa de reportes entre administradores para balancear la carga de trabajo.

## Características Implementadas

### 1. Asignación Automática de Reportes

Cuando un usuario crea un nuevo reporte, el sistema automáticamente:

- **Busca SOLO administradores regulares activos** (role: "admin")
- **NO incluye super_admin** (su rol es supervisar, no moderar)
- **Cuenta cuántos reportes activos** (pendientes o en revisión) tiene cada admin
- **Asigna el reporte al admin con menos carga de trabajo**

Esto asegura que los reportes se distribuyan equitativamente entre los administradores de moderación, dejando al super_admin libre para gestionar al equipo.

### 2. Filtrado por Asignación

#### Para Administradores Regulares (role: admin)

- **Solo ven los reportes asignados a ellos**
- No pueden ver reportes de otros administradores
- Las estadísticas muestran solo sus reportes asignados

#### Para Super Administradores (role: super_admin)

- **Ven todos los reportes del sistema**
- Pueden reasignar reportes entre administradores
- Las estadísticas muestran todos los reportes

### 3. Visualización en el Frontend

Cada tarjeta de reporte muestra:

- **Reportado por**: Usuario que hizo el reporte
- **Asignado a**: Administrador responsable (con ícono de escudo 🛡️)
- Fecha y hora del reporte
- Toda la información del contenido reportado

## Endpoints del Backend

### Asignación Automática

```
POST /api/reportes
Body: { tipoContenido, contenidoId, motivo, descripcion }
```

- El sistema asigna automáticamente al admin con menos carga

### Obtener Reportes

```
GET /api/moderacion/reportes?estado=pendiente&page=1&limit=20
```

- Admin: Solo ve sus reportes asignados
- Super Admin: Ve todos los reportes

### Reasignar Reporte (Solo Super Admin)

```
PUT /api/admin/reportes/:reporteId/reasignar
Body: { adminId }
```

- Permite cambiar el administrador asignado a un reporte

### Ver Distribución

```bash
node scripts/ver-distribucion-reportes.js
```

- Script que muestra:
  - **Super Administradores**: Rol supervisorio, no reciben reportes automáticamente
  - **Administradores Regulares**: Carga de trabajo actual de cada moderador activo
  - Distribución porcentual entre admins

## Cambios en la Base de Datos

### Modelo Reporte

```javascript
{
  // ... campos existentes ...
  asignadoA: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",  // Referencia al admin asignado
  }
}
```

## Flujo de Trabajo

### 1. Usuario Reporta Contenido

```
Usuario → Crea reporte → Sistema asigna al admin con menos carga → Notificación al admin
```

### 2. Admin Revisa su Cola

```
Admin → Ve solo sus reportes asignados → Toma acción → Reporte resuelto
```

### 3. Super Admin Gestiona Cargas

```
Super Admin → Ve todos los reportes → Puede reasignar si hay desbalance → Monitorea estadísticas
```

## Algoritmo de Distribución

```javascript
// 1. Obtener todos los admins activos
const admins = await Usuario.find({
  role: { $in: ["admin", "super_admin"] },
  estaActivo: true,
});

// 2. Contar reportes activos de cada uno
const adminConMenosReportes = await Promise.all(
  admins.map(async (admin) => {
    const count = await Reporte.countDocuments({
      asignadoA: admin._id,
      estado: { $in: ["pendiente", "en_revision"] },
    });
    return { adminId: admin._id, count };
  })
);

// 3. Asignar al que tenga menos
adminConMenosReportes.sort((a, b) => a.count - b.count);
asignadoA = adminConMenosReportes[0].adminId;
```

## Ventajas del Sistema

✅ **Distribución Equitativa**: Todos los admins tienen cargas similares
✅ **Responsabilidad Clara**: Cada reporte tiene un admin responsable
✅ **Escalabilidad**: Funciona con cualquier número de administradores
✅ **Flexibilidad**: Super admins pueden reasignar si es necesario
✅ **Visibilidad**: Los reportes muestran quién es el responsable

## Estadísticas por Admin

El sistema ahora muestra estadísticas personalizadas:

- **Admin regular**: Solo cuenta sus reportes asignados
- **Super admin**: Ve estadísticas globales del sistema

Ejemplo de estadísticas:

```json
{
  "total": 15,
  "porEstado": {
    "pendiente": 5,
    "en_revision": 3,
    "resuelto": 7
  }
}
```

## Migración de Reportes Existentes

Para reportes antiguos sin asignación:

```javascript
// Se pueden asignar manualmente con el script de distribución
// O el super admin puede reasignarlos desde el panel
```

## Casos Especiales

### No hay administradores disponibles

- El reporte se crea con `asignadoA: null`
- Cuando se agregue un admin, se puede asignar manualmente

### Admin desactivado o degradado

- Sus reportes activos deben reasignarse manualmente
- El super admin puede usar la función de reasignación

### Prioridad de reportes

- Los reportes urgentes mantienen su prioridad
- El sistema de asignación no considera prioridad (todos son importantes)
- Los admins pueden ordenar sus reportes por prioridad

## Testing

Para verificar que funciona:

1. Crea varios reportes como usuario normal
2. Revisa con el script `ver-distribucion-reportes.js`
3. Verifica que se distribuyen equitativamente
4. Cada admin debe ver solo sus reportes en el panel
5. Super admin debe ver todos

## Mantenimiento

### Ver distribución actual

```bash
cd backend
node scripts/ver-distribucion-reportes.js
```

### Reasignar manualmente (Super Admin)

```javascript
// Desde el panel de admin o vía API
PUT /api/admin/reportes/:reporteId/reasignar
{ "adminId": "nuevo_admin_id" }
```
