# 🧹 Guía de Limpieza de Snapshots de Cursor IDE

## ¿Qué son estos archivos?

Los archivos `pack-*.pack` y `pack-*.idx` en `~/.config/Cursor/snapshots/` son **snapshots internos** que Cursor IDE usa para:

- 📸 Historial local de cambios en archivos
- 🔄 Funcionalidad de "deshacer" avanzada
- 📚 Indexación rápida de proyectos
- 🎯 Autocompletado inteligente basado en historial

**⚠️ Importante**: Estos archivos NO afectan tus proyectos ni tu código. Son solo caché/historial interno del IDE.

## ¿Por qué ocupan tanto espacio?

Cursor guarda snapshots de todos los cambios que haces en tus archivos. Si trabajas en muchos proyectos o haces muchos cambios, estos archivos pueden crecer rápidamente:

- Cada archivo `pack-*.pack` puede ocupar **500-800 MB**
- Con muchos proyectos, pueden acumularse **decenas de GB**

## ¿Es seguro eliminarlos?

✅ **SÍ**, es seguro eliminarlos. Solo perderás:
- Historial local de cambios (no afecta Git)
- Algunas sugerencias de autocompletado basadas en historial antiguo

❌ **NO** perderás:
- Tu código
- Tus proyectos
- Tu historial de Git
- Configuraciones de Cursor

## Opciones de Limpieza

### Opción 1: Usar el Script Automático (Recomendado)

```bash
# Ejecutar el script de limpieza
./scripts/cleanup-cursor-snapshots.sh
```

El script te ofrece 4 opciones:
1. **Eliminar snapshots > 7 días**: Conserva el historial reciente
2. **Eliminar snapshots > 30 días**: Conserva más historial
3. **Eliminar TODOS**: Limpieza completa (más espacio liberado)
4. **Solo información**: Ver estadísticas sin eliminar nada

### Opción 2: Limpieza Manual

#### Eliminar snapshots antiguos (> 7 días):

```bash
# Cerrar Cursor primero
# Luego ejecutar:
find ~/.config/Cursor/snapshots/roots/*/objects/pack/ -name "*.pack" -mtime +7 -delete
find ~/.config/Cursor/snapshots/roots/*/objects/pack/ -name "*.idx" -mtime +7 -delete
```

#### Eliminar TODOS los snapshots:

```bash
# Cerrar Cursor primero
# Luego ejecutar:
rm -rf ~/.config/Cursor/snapshots
```

### Opción 3: Configurar Cursor para Limitar Snapshots

Actualmente Cursor no tiene una opción en la UI para limitar snapshots, pero puedes:

1. Ejecutar el script periódicamente (cada semana/mes)
2. Crear un cron job para limpieza automática:

```bash
# Agregar a crontab (limpieza mensual)
0 2 1 * * /ruta/al/script/cleanup-cursor-snapshots.sh
```

## Verificación

Después de la limpieza, verifica el espacio liberado:

```bash
# Ver tamaño actual
du -sh ~/.config/Cursor/snapshots

# Ver archivos restantes
ls -lh ~/.config/Cursor/snapshots/roots/*/objects/pack/ | wc -l
```

## Recomendaciones

1. **Cerrar Cursor antes de limpiar**: Evita corrupción de archivos
2. **Limpiar periódicamente**: Cada 1-2 meses es suficiente
3. **Conservar snapshots recientes**: Los últimos 7-30 días son útiles
4. **No preocuparse**: Cursor regenerará snapshots automáticamente

## Espacio Típico Liberado

- **Limpieza conservadora** (> 30 días): ~10-20 GB
- **Limpieza moderada** (> 7 días): ~30-40 GB
- **Limpieza completa**: ~58 GB (todo)

## Troubleshooting

### "Permission denied"
```bash
# Ejecutar con sudo si es necesario
sudo ./scripts/cleanup-cursor-snapshots.sh
```

### Cursor no inicia después de limpiar
```bash
# Eliminar también la caché de Cursor
rm -rf ~/.config/Cursor/Cache
rm -rf ~/.config/Cursor/CachedData
```

### Los snapshots vuelven a crecer rápido
- Normal: Cursor regenera snapshots automáticamente
- Considera limpiar más frecuentemente
- Verifica que no hay proyectos muy grandes abiertos

---

**Última actualización**: Marzo 2026
