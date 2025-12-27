# 🔧 Solución: Expo Start se Queda en Loading

## 🚨 Problema

Cuando ejecutas `npx expo start --clear`, el comando se queda en loading y no avanza.

## ✅ Soluciones

### Solución 1: Detener Procesos y Reiniciar

```bash
# 1. Detener todos los procesos de Node/Expo
pkill -f node
pkill -f expo

# 2. Limpiar caché de npm/yarn
cd amva-mobile
rm -rf node_modules/.cache
rm -rf .expo

# 3. Reiniciar Expo
npx expo start --clear
```

### Solución 2: Usar Puerto Específico

```bash
cd amva-mobile
npx expo start --clear --port 8081
```

### Solución 3: Verificar Red/Firewall

```bash
# Verificar que el puerto 8081 esté disponible
lsof -i :8081

# Si hay algo usando el puerto, matarlo
kill -9 <PID>
```

### Solución 4: Usar Tunnel en Lugar de LAN

```bash
cd amva-mobile
npx expo start --clear --tunnel
```

### Solución 5: Reinstalar Dependencias

```bash
cd amva-mobile
rm -rf node_modules
npm install
# O
yarn install

npx expo start --clear
```

## 🎯 Solución Rápida Recomendada

```bash
# 1. Detener procesos
pkill -f expo

# 2. Limpiar caché
cd amva-mobile
rm -rf .expo
rm -rf node_modules/.cache

# 3. Reiniciar
npx expo start --clear
```

## 📝 Nota

Si el problema persiste, puedes simplemente usar:
```bash
npm start
# O
npm run android
```

Esto debería funcionar igual de bien.

