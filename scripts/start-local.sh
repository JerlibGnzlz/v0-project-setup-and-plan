#!/bin/bash

# Script para levantar Frontend + Backend en desarrollo local
# Uso: ./scripts/start-local.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_PID=""

cleanup() {
  echo ""
  echo "🛑 Deteniendo servicios..."
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
    echo "   Backend detenido (PID: $BACKEND_PID)"
  fi
  exit 0
}

trap cleanup SIGINT SIGTERM

cd "$PROJECT_ROOT"

# Verificar que existan los .env
if [ ! -f ".env.local" ]; then
  echo "⚠️  No existe .env.local en la raíz."
  echo "   Copia env.example.txt a .env.local y configura las variables."
  echo "   Ver: docs/DESARROLLO_LOCAL.md"
  exit 1
fi

if [ ! -f "backend/.env" ]; then
  echo "⚠️  No existe backend/.env"
  echo "   Copia backend/.env.bak a backend/.env y configura las variables."
  echo "   Ver: docs/DESARROLLO_LOCAL.md"
  exit 1
fi

echo "🚀 Iniciando desarrollo local..."
echo ""

# 1. Iniciar Backend en background
echo "📦 Iniciando Backend (puerto 4000)..."
cd "$PROJECT_ROOT/backend"
npm run start:dev &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Esperar a que el backend esté listo
echo "   Esperando a que el backend inicie..."
sleep 5

# 2. Iniciar Frontend en foreground
echo ""
echo "🌐 Iniciando Frontend (puerto 3000)..."
echo "   Presiona Ctrl+C para detener todo"
echo ""
npm run dev
