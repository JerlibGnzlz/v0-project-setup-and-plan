#!/bin/bash

# Script para limpiar snapshots antiguos de Cursor IDE
# Estos archivos pueden ocupar mucho espacio (varios GB)

CURSOR_SNAPSHOTS_DIR="$HOME/.config/Cursor/snapshots"
PACK_DIR="$CURSOR_SNAPSHOTS_DIR/roots/*/objects/pack"

echo "🧹 Limpieza de Snapshots de Cursor IDE"
echo "======================================"
echo ""

# Verificar si existe el directorio
if [ ! -d "$CURSOR_SNAPSHOTS_DIR" ]; then
  echo "❌ No se encontró el directorio de snapshots: $CURSOR_SNAPSHOTS_DIR"
  exit 1
fi

# Mostrar tamaño actual
CURRENT_SIZE=$(du -sh "$CURSOR_SNAPSHOTS_DIR" 2>/dev/null | cut -f1)
echo "📊 Tamaño actual de snapshots: $CURRENT_SIZE"
echo ""

# Contar archivos pack
PACK_COUNT=$(find $PACK_DIR -name "*.pack" 2>/dev/null | wc -l)
echo "📦 Archivos pack encontrados: $PACK_COUNT"
echo ""

# Opciones de limpieza
echo "Opciones de limpieza:"
echo "1) Eliminar archivos pack más antiguos (más de 7 días)"
echo "2) Eliminar archivos pack más antiguos (más de 30 días)"
echo "3) Eliminar TODOS los snapshots (⚠️  Se perderá el historial local de Cursor)"
echo "4) Solo mostrar información (no eliminar nada)"
echo ""
read -p "Selecciona una opción (1-4): " OPTION

case $OPTION in
  1)
    echo ""
    echo "🗑️  Eliminando archivos pack más antiguos de 7 días..."
    find $PACK_DIR -name "*.pack" -mtime +7 -type f -delete 2>/dev/null
    find $PACK_DIR -name "*.idx" -mtime +7 -type f -delete 2>/dev/null
    echo "✅ Limpieza completada"
    ;;
  2)
    echo ""
    echo "🗑️  Eliminando archivos pack más antiguos de 30 días..."
    find $PACK_DIR -name "*.pack" -mtime +30 -type f -delete 2>/dev/null
    find $PACK_DIR -name "*.idx" -mtime +30 -type f -delete 2>/dev/null
    echo "✅ Limpieza completada"
    ;;
  3)
    echo ""
    echo "⚠️  ADVERTENCIA: Esto eliminará TODOS los snapshots de Cursor."
    echo "   - Se perderá el historial local de cambios"
    echo "   - Cursor puede tardar más en iniciar la primera vez después"
    echo "   - Los proyectos NO se verán afectados"
    echo ""
    read -p "¿Estás seguro? (escribe 'SI' para confirmar): " CONFIRM
    if [ "$CONFIRM" = "SI" ]; then
      echo ""
      echo "🗑️  Eliminando todos los snapshots..."
      rm -rf "$CURSOR_SNAPSHOTS_DIR"
      echo "✅ Todos los snapshots han sido eliminados"
    else
      echo "❌ Operación cancelada"
      exit 0
    fi
    ;;
  4)
    echo ""
    echo "📋 Información de archivos pack:"
    echo ""
    echo "Archivos más antiguos:"
    find $PACK_DIR -name "*.pack" -type f -printf "%T@ %Tc %s %p\n" 2>/dev/null | sort -n | head -10
    echo ""
    echo "Archivos más recientes:"
    find $PACK_DIR -name "*.pack" -type f -printf "%T@ %Tc %s %p\n" 2>/dev/null | sort -rn | head -10
    echo ""
    echo "Tamaño por fecha:"
    find $PACK_DIR -name "*.pack" -type f -printf "%TY-%Tm-%Td %s\n" 2>/dev/null | awk '{date=$1; size=$2; total[date]+=size} END {for (d in total) printf "%s: %.2f GB\n", d, total[d]/1024/1024/1024}' | sort
    exit 0
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

# Mostrar tamaño después de la limpieza
if [ -d "$CURSOR_SNAPSHOTS_DIR" ]; then
  NEW_SIZE=$(du -sh "$CURSOR_SNAPSHOTS_DIR" 2>/dev/null | cut -f1)
  echo ""
  echo "📊 Tamaño después de la limpieza: $NEW_SIZE"
  
  # Calcular espacio liberado (aproximado)
  echo ""
  echo "💾 Espacio liberado: ~$CURRENT_SIZE → $NEW_SIZE"
fi

echo ""
echo "✅ Proceso completado"
echo ""
echo "💡 Nota: Cierra y vuelve a abrir Cursor para que los cambios surtan efecto"
