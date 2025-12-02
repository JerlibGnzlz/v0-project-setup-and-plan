# Recomendaciones para el Manejo de Convenciones Anuales

## Contexto
Las convenciones son eventos anuales que se realizan cada año (2025, 2026, etc.). Es importante tener una estrategia clara para manejar los datos históricos y mantener el sistema organizado.

## Opciones Recomendadas

### ✅ **Opción 1: Archivar Convenciones Finalizadas (RECOMENDADA)**

**Ventajas:**
- ✅ Mantiene un historial completo de todas las convenciones
- ✅ Permite consultar datos históricos cuando sea necesario
- ✅ Facilita análisis comparativos entre años
- ✅ No se pierde información valiosa
- ✅ Cumple con posibles requisitos legales/fiscales

**Implementación:**
1. Agregar un campo `archivada: boolean` al modelo `Convencion`
2. Cuando termine una convención, marcarla como `archivada: true`
3. En el dashboard, mostrar solo convenciones activas/no archivadas por defecto
4. Agregar un filtro para ver convenciones archivadas cuando sea necesario
5. Las inscripciones y pagos se mantienen asociados a su convención

**Código sugerido:**
```prisma
model Convencion {
  // ... campos existentes
  archivada Boolean @default(false)
  fechaArchivado DateTime?
}
```

### ⚠️ **Opción 2: Eliminar Convenciones Antiguas**

**Ventajas:**
- ✅ Mantiene el sistema más limpio
- ✅ Reduce la cantidad de datos en la base de datos

**Desventajas:**
- ❌ Pérdida permanente de datos históricos
- ❌ No se puede consultar información de años anteriores
- ❌ Dificulta análisis comparativos
- ❌ Puede causar problemas legales/fiscales si se necesita el historial

**Implementación:**
1. Agregar un botón "Eliminar Convención" con confirmación
2. Al eliminar, eliminar también todas las inscripciones y pagos asociados (CASCADE)
3. Mostrar advertencia clara antes de eliminar

## Recomendación Final

**Se recomienda la Opción 1 (Archivar) por las siguientes razones:**

1. **Historial Completo**: Mantiene todos los datos para consultas futuras
2. **Análisis Comparativo**: Permite comparar resultados entre años
3. **Cumplimiento Legal**: Algunas jurisdicciones requieren mantener registros financieros
4. **Flexibilidad**: Puedes decidir eliminar más tarde si es necesario
5. **Seguridad de Datos**: No hay riesgo de perder información importante

## Implementación Sugerida

### 1. Agregar campo de archivo a la base de datos
```sql
ALTER TABLE convenciones ADD COLUMN archivada BOOLEAN DEFAULT false;
ALTER TABLE convenciones ADD COLUMN fecha_archivado TIMESTAMP;
```

### 2. Agregar funcionalidad de archivo en el dashboard
- Botón "Archivar Convención" cuando termine el evento
- Filtro para mostrar/ocultar convenciones archivadas
- Las convenciones archivadas no aparecen en la landing page

### 3. Política de Retención (Opcional)
- Mantener convenciones activas siempre visibles
- Convenciones archivadas: mantener por 5-7 años
- Después de ese período, ofrecer opción de exportar y eliminar

## Flujo Recomendado

1. **Durante la Convención**: Convención activa, visible en landing, aceptando inscripciones
2. **Al Finalizar**: 
   - Marcar convención como `archivada: true`
   - Establecer `fechaArchivado: fecha actual`
   - Ocultar de la landing page automáticamente
3. **Después de Archivar**:
   - Mantener datos para consultas
   - No mostrar en dashboard principal (solo con filtro)
   - Disponible para reportes históricos

## Consideraciones Adicionales

- **Backups**: Realizar backups regulares antes de archivar
- **Exportación**: Ofrecer opción de exportar datos antes de archivar
- **Notificaciones**: Notificar a administradores cuando se archive una convención
- **Reportes**: Mantener capacidad de generar reportes de convenciones archivadas







