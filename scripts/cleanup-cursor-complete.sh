#!/bin/bash

# Script completo de limpieza de Cursor IDE
# Elimina caché, snapshots y archivos temporales sin afectar tu código

CURSOR_DIR="$HOME/.config/Cursor"
TOTAL_BEFORE=0
TOTAL_AFTER=0

echo "🧹 Limpieza Completa de Cursor IDE"
echo "===================================="
echo ""

# Función para calcular tamaño
get_size() {
  if [ -d "$1" ]; then
    du -sh "$1" 2>/dev/null | cut -f1
  else
    echo "0"
  fi
}

# Función para mostrar tamaño antes/después
show_stats() {
  local dir="$1"
  local name="$2"
  if [ -d "$dir" ]; then
    local size=$(get_size "$dir")
    echo "  📊 $name: $size"
  fi
}

echo "📊 Estado actual del disco:"
echo "============================"
show_stats "$CURSOR_DIR/snapshots" "Snapshots (historial local)"
show_stats "$CURSOR_DIR/Cache" "Cache general"
show_stats "$CURSOR_DIR/CachedData" "Datos cacheados"
show_stats "$CURSOR_DIR/Code Cache" "Cache de código"
show_stats "$CURSOR_DIR/GPUCache" "Cache de GPU"
show_stats "$CURSOR_DIR/logs" "Logs"
show_stats "$CURSOR_DIR/Partitions" "Particiones"
show_stats "$CURSOR_DIR/WebStorage" "Almacenamiento web"
show_stats "$CURSOR_DIR/Crashpad" "Reportes de crash"
show_stats "$CURSOR_DIR/blob_storage" "Blob storage"
show_stats "$CURSOR_DIR/Backups" "Backups automáticos"

echo ""
TOTAL_BEFORE=$(du -sh "$CURSOR_DIR" 2>/dev/null | cut -f1)
echo "💾 Tamaño total de Cursor: $TOTAL_BEFORE"
echo ""

echo "Opciones de limpieza:"
echo "======================"
echo "1) Limpieza SEGURA (recomendado)"
echo "   - Elimina snapshots antiguos (> 7 días)"
echo "   - Elimina caché y temporales"
echo "   - Conserva configuraciones"
echo ""
echo "2) Limpieza AGRESIVA"
echo "   - Elimina TODOS los snapshots"
echo "   - Elimina todo el caché"
echo "   - Conserva configuraciones"
echo ""
echo "3) Limpieza COMPLETA (⚠️  más espacio)"
echo "   - Elimina snapshots, caché, logs, backups"
echo "   - Cursor se reiniciará como nuevo"
echo "   - Conserva solo configuraciones básicas"
echo ""
echo "4) Solo ver información (no eliminar)"
echo ""
read -p "Selecciona una opción (1-4): " OPTION

case $OPTION in
  1)
    echo ""
    echo "🧹 Iniciando limpieza SEGURA..."
    echo ""
    
    # Snapshots antiguos (> 7 días)
    echo "🗑️  Eliminando snapshots antiguos (> 7 días)..."
    find "$CURSOR_DIR/snapshots/roots"/*/objects/pack/ -name "*.pack" -mtime +7 -type f -delete 2>/dev/null
    find "$CURSOR_DIR/snapshots/roots"/*/objects/pack/ -name "*.idx" -mtime +7 -type f -delete 2>/dev/null
    
    # Cache
    echo "🗑️  Eliminando caché..."
    rm -rf "$CURSOR_DIR/Cache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/CachedData"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/Code Cache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/GPUCache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/DawnGraphiteCache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/DawnWebGPUCache"/* 2>/dev/null
    
    # Logs antiguos
    echo "🗑️  Eliminando logs antiguos..."
    find "$CURSOR_DIR/logs" -name "*.log" -mtime +7 -type f -delete 2>/dev/null
    
    # WebStorage (temporal)
    echo "🗑️  Limpiando almacenamiento web temporal..."
    rm -rf "$CURSOR_DIR/WebStorage"/* 2>/dev/null
    
    # Crashpad (reportes de crash)
    echo "🗑️  Eliminando reportes de crash..."
    rm -rf "$CURSOR_DIR/Crashpad"/* 2>/dev/null
    
    echo ""
    echo "✅ Limpieza SEGURA completada"
    ;;
    
  2)
    echo ""
    echo "🧹 Iniciando limpieza AGRESIVA..."
    echo ""
    
    # TODOS los snapshots
    echo "🗑️  Eliminando TODOS los snapshots..."
    rm -rf "$CURSOR_DIR/snapshots"/* 2>/dev/null
    
    # Todo el caché
    echo "🗑️  Eliminando todo el caché..."
    rm -rf "$CURSOR_DIR/Cache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/CachedData"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/Code Cache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/GPUCache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/DawnGraphiteCache"/* 2>/dev/null
    rm -rf "$CURSOR_DIR/DawnWebGPUCache"/* 2>/dev/null
    
    # Logs
    echo "🗑️  Eliminando logs..."
    rm -rf "$CURSOR_DIR/logs"/* 2>/dev/null
    
    # WebStorage
    rm -rf "$CURSOR_DIR/WebStorage"/* 2>/dev/null
    
    # Crashpad
    rm -rf "$CURSOR_DIR/Crashpad"/* 2>/dev/null
    
    echo ""
    echo "✅ Limpieza AGRESIVA completada"
    ;;
    
  3)
    echo ""
    echo "⚠️  ADVERTENCIA: Esto eliminará casi todo excepto configuraciones básicas"
    echo "   - Se perderá historial local, caché, logs, backups"
    echo "   - Cursor se reiniciará como nuevo"
    echo "   - Tus proyectos y código NO se verán afectados"
    echo ""
    read -p "¿Estás seguro? (escribe 'SI' para confirmar): " CONFIRM
    
    if [ "$CONFIRM" = "SI" ]; then
      echo ""
      echo "🧹 Iniciando limpieza COMPLETA..."
      echo ""
      
      # Snapshots
      echo "🗑️  Eliminando snapshots..."
      rm -rf "$CURSOR_DIR/snapshots" 2>/dev/null
      
      # Cache completo
      echo "🗑️  Eliminando caché..."
      rm -rf "$CURSOR_DIR/Cache" 2>/dev/null
      rm -rf "$CURSOR_DIR/CachedData" 2>/dev/null
      rm -rf "$CURSOR_DIR/Code Cache" 2>/dev/null
      rm -rf "$CURSOR_DIR/GPUCache" 2>/dev/null
      rm -rf "$CURSOR_DIR/DawnGraphiteCache" 2>/dev/null
      rm -rf "$CURSOR_DIR/DawnWebGPUCache" 2>/dev/null
      
      # Logs
      echo "🗑️  Eliminando logs..."
      rm -rf "$CURSOR_DIR/logs" 2>/dev/null
      
      # WebStorage
      echo "🗑️  Eliminando almacenamiento web..."
      rm -rf "$CURSOR_DIR/WebStorage" 2>/dev/null
      
      # Crashpad
      echo "🗑️  Eliminando reportes de crash..."
      rm -rf "$CURSOR_DIR/Crashpad" 2>/dev/null
      
      # Backups automáticos
      echo "🗑️  Eliminando backups automáticos..."
      rm -rf "$CURSOR_DIR/Backups"/* 2>/dev/null
      
      # Blob storage
      echo "🗑️  Eliminando blob storage..."
      rm -rf "$CURSOR_DIR/blob_storage"/* 2>/dev/null
      
      # Partitions
      echo "🗑️  Eliminando particiones..."
      rm -rf "$CURSOR_DIR/Partitions"/* 2>/dev/null
      
      # CachedProfilesData
      echo "🗑️  Eliminando perfiles cacheados..."
      rm -rf "$CURSOR_DIR/CachedProfilesData"/* 2>/dev/null
      
      echo ""
      echo "✅ Limpieza COMPLETA finalizada"
    else
      echo "❌ Operación cancelada"
      exit 0
    fi
    ;;
    
  4)
    echo ""
    echo "📋 Información detallada:"
    echo "========================"
    echo ""
    
    # Contar archivos pack
    PACK_COUNT=$(find "$CURSOR_DIR/snapshots/roots"/*/objects/pack/ -name "*.pack" 2>/dev/null | wc -l)
    echo "📦 Archivos pack encontrados: $PACK_COUNT"
    
    # Archivos más antiguos
    echo ""
    echo "📅 Archivos pack más antiguos (top 5):"
    find "$CURSOR_DIR/snapshots/roots"/*/objects/pack/ -name "*.pack" -type f -printf "%T@ %Tc %s %p\n" 2>/dev/null | sort -n | head -5 | while read line; do
      date=$(echo "$line" | awk '{print $2" "$3" "$4}')
      size=$(echo "$line" | awk '{printf "%.2f MB", $5/1024/1024}')
      file=$(echo "$line" | awk '{print $NF}' | xargs basename)
      echo "   - $file: $size (modificado: $date)"
    done
    
    # Archivos más grandes
    echo ""
    echo "📊 Archivos pack más grandes (top 5):"
    find "$CURSOR_DIR/snapshots/roots"/*/objects/pack/ -name "*.pack" -type f -exec ls -lh {} \; 2>/dev/null | sort -k5 -hr | head -5 | awk '{printf "   - %s: %s\n", $9, $5}'
    
    exit 0
    ;;
    
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

# Mostrar resultados
echo ""
echo "📊 Estado después de la limpieza:"
echo "=================================="
show_stats "$CURSOR_DIR/snapshots" "Snapshots"
show_stats "$CURSOR_DIR/Cache" "Cache"
show_stats "$CURSOR_DIR/CachedData" "CachedData"
show_stats "$CURSOR_DIR/logs" "Logs"

TOTAL_AFTER=$(du -sh "$CURSOR_DIR" 2>/dev/null | cut -f1)
echo ""
echo "💾 Tamaño total después: $TOTAL_AFTER"
echo "💾 Tamaño total antes: $TOTAL_BEFORE"
echo ""
echo "✅ Proceso completado"
echo ""
echo "💡 Nota: Cierra y vuelve a abrir Cursor para que los cambios surtan efecto"
