# 🧹 Guía Completa de Limpieza de Cursor IDE

## 📊 Resumen de Espacio Ocupado

Según el análisis de tu sistema:
- **Snapshots**: ~58 GB (historial local)
- **User**: ~18 GB (configuraciones y datos de usuario)
- **CachedData**: ~393 MB (datos cacheados)
- **Cache**: ~12 MB (caché general)
- **Logs**: ~13 MB (archivos de log)
- **Otros**: ~50 MB (varios)

**Total**: ~76 GB

## ✅ Qué PUEDES Eliminar (Seguro)

### 🗑️ Seguro Eliminar (No afecta tu código)

| Carpeta | Tamaño | Qué es | Seguro Eliminar |
|---------|--------|--------|-----------------|
| `snapshots/` | 58 GB | Historial local de cambios | ✅ SÍ |
| `Cache/` | 12 MB | Caché general | ✅ SÍ |
| `CachedData/` | 393 MB | Datos cacheados | ✅ SÍ |
| `Code Cache/` | 36 KB | Caché de código | ✅ SÍ |
| `GPUCache/` | 1.4 MB | Caché de GPU | ✅ SÍ |
| `logs/` | 13 MB | Archivos de log | ✅ SÍ |
| `WebStorage/` | 2 MB | Almacenamiento web temporal | ✅ SÍ |
| `Crashpad/` | Variable | Reportes de crash | ✅ SÍ |
| `Backups/` | Variable | Backups automáticos | ✅ SÍ |
| `blob_storage/` | Variable | Almacenamiento blob | ✅ SÍ |
| `Partitions/` | 42 MB | Particiones | ✅ SÍ |
| `DawnGraphiteCache/` | 300 KB | Caché gráfico | ✅ SÍ |
| `DawnWebGPUCache/` | 300 KB | Caché WebGPU | ✅ SÍ |
| `CachedProfilesData/` | 1.8 MB | Perfiles cacheados | ✅ SÍ |

### ⚠️ NO Eliminar (Contiene configuraciones)

| Carpeta | Qué contiene | Por qué NO eliminar |
|---------|--------------|---------------------|
| `User/` | Configuraciones, extensiones, snippets | Tiene tus preferencias |
| `User/workspaceStorage/` | Estado de proyectos | Estado de tus proyectos |
| `User/History/` | Historial de archivos | Historial de archivos abiertos |
| `User/settings.json` | Configuraciones | Tus ajustes personalizados |

## 🚀 Opciones de Limpieza

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar el script completo
./scripts/cleanup-cursor-complete.sh
```

El script ofrece 3 niveles:
1. **Limpieza SEGURA**: Elimina snapshots > 7 días + caché
2. **Limpieza AGRESIVA**: Elimina todos los snapshots + caché
3. **Limpieza COMPLETA**: Elimina casi todo (Cursor como nuevo)

### Opción 2: Limpieza Manual Rápida

#### Eliminar solo snapshots antiguos:
```bash
# Cerrar Cursor primero
find ~/.config/Cursor/snapshots/roots/*/objects/pack/ -name "*.pack" -mtime +7 -delete
find ~/.config/Cursor/snapshots/roots/*/objects/pack/ -name "*.idx" -mtime +7 -delete
```

#### Eliminar todo el caché:
```bash
# Cerrar Cursor primero
rm -rf ~/.config/Cursor/Cache/*
rm -rf ~/.config/Cursor/CachedData/*
rm -rf ~/.config/Cursor/Code\ Cache/*
rm -rf ~/.config/Cursor/GPUCache/*
rm -rf ~/.config/Cursor/logs/*
rm -rf ~/.config/Cursor/WebStorage/*
rm -rf ~/.config/Cursor/Crashpad/*
```

#### Eliminar TODOS los snapshots (más espacio):
```bash
# Cerrar Cursor primero
rm -rf ~/.config/Cursor/snapshots
```

### Opción 3: Comando Todo-en-Uno

```bash
# Cerrar Cursor completamente primero
# Luego ejecutar:

echo "🧹 Limpiando Cursor..."

# Snapshots antiguos (> 7 días)
find ~/.config/Cursor/snapshots/roots/*/objects/pack/ -name "*.pack" -mtime +7 -delete 2>/dev/null
find ~/.config/Cursor/snapshots/roots/*/objects/pack/ -name "*.idx" -mtime +7 -delete 2>/dev/null

# Cache
rm -rf ~/.config/Cursor/Cache/* 2>/dev/null
rm -rf ~/.config/Cursor/CachedData/* 2>/dev/null
rm -rf ~/.config/Cursor/Code\ Cache/* 2>/dev/null
rm -rf ~/.config/Cursor/GPUCache/* 2>/dev/null
rm -rf ~/.config/Cursor/DawnGraphiteCache/* 2>/dev/null
rm -rf ~/.config/Cursor/DawnWebGPUCache/* 2>/dev/null

# Logs antiguos
find ~/.config/Cursor/logs -name "*.log" -mtime +7 -delete 2>/dev/null

# Temporales
rm -rf ~/.config/Cursor/WebStorage/* 2>/dev/null
rm -rf ~/.config/Cursor/Crashpad/* 2>/dev/null

# Ver espacio liberado
echo ""
echo "📊 Espacio actual:"
du -sh ~/.config/Cursor

echo ""
echo "✅ Limpieza completada"
```

## 📋 Checklist de Limpieza

### Antes de Limpiar:
- [ ] Cerrar Cursor completamente
- [ ] Guardar todos los archivos abiertos
- [ ] Hacer commit de cambios pendientes (si aplica)
- [ ] Verificar espacio disponible

### Después de Limpiar:
- [ ] Verificar espacio liberado: `du -sh ~/.config/Cursor`
- [ ] Abrir Cursor y verificar que funciona
- [ ] Verificar que tus proyectos siguen ahí
- [ ] Verificar que extensiones funcionan

## 💡 Recomendaciones

### Frecuencia de Limpieza:
- **Limpieza ligera**: Cada semana (solo caché)
- **Limpieza moderada**: Cada mes (snapshots > 7 días)
- **Limpieza completa**: Cada 3-6 meses (todo)

### Automatización (Opcional):

Crear un cron job para limpieza automática:

```bash
# Editar crontab
crontab -e

# Agregar línea (limpieza mensual a las 2 AM)
0 2 1 * * /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/scripts/cleanup-cursor-complete.sh
```

## 🔍 Verificar Espacio Liberado

```bash
# Ver tamaño antes
du -sh ~/.config/Cursor

# Ejecutar limpieza
./scripts/cleanup-cursor-complete.sh

# Ver tamaño después
du -sh ~/.config/Cursor
```

## ⚠️ Advertencias

1. **SIEMPRE cerrar Cursor antes de limpiar**: Evita corrupción de archivos
2. **NO eliminar `User/`**: Contiene configuraciones importantes
3. **Los snapshots se regeneran**: Cursor creará nuevos automáticamente
4. **Primera vez más lenta**: Después de limpiar, Cursor puede tardar más en iniciar

## 🎯 Espacio Típico Liberado

- **Limpieza ligera** (solo caché): ~400 MB
- **Limpieza moderada** (snapshots > 7 días): ~30-40 GB
- **Limpieza agresiva** (todos los snapshots): ~58 GB
- **Limpieza completa** (todo): ~76 GB

## 🆘 Troubleshooting

### "Permission denied"
```bash
sudo ./scripts/cleanup-cursor-complete.sh
```

### Cursor no inicia después de limpiar
```bash
# Eliminar también lock files
rm -f ~/.config/Cursor/code.lock
rm -f ~/.config/Cursor/DIPS-wal
```

### Los snapshots vuelven a crecer rápido
- Normal: Cursor regenera snapshots automáticamente
- Considera limpiar más frecuentemente
- Verifica proyectos muy grandes abiertos

---

**Última actualización**: Marzo 2026
