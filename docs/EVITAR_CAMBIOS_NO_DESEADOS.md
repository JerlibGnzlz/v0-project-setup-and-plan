# 🔧 Cómo Evitar Cambios No Deseados en Git

## Problema Común

Cada vez que abres Cursor después de haber subido todos los cambios, aparecen archivos modificados que no deberían estar ahí.

## Soluciones

### 1. Verificar qué archivos están cambiando

```bash
# Ver todos los cambios
git status

# Ver cambios detallados
git diff

# Ver archivos no rastreados
git ls-files --others --exclude-standard
```

### 2. Agregar archivos al .gitignore

Si ves archivos que se generan automáticamente, agrégalos al `.gitignore`:

```bash
# Ejemplo: si ves cambios en .env
echo ".env" >> .gitignore

# Luego commitear el .gitignore
git add .gitignore
git commit -m "chore: Agregar .env al .gitignore"
git push
```

### 3. Limpiar el cache de Git

Si hay archivos que ya estaban rastreados pero ahora deberían ignorarse:

```bash
# Remover archivos del cache (sin eliminarlos del disco)
git rm -r --cached .

# Agregar todo de nuevo (respetando .gitignore)
git add .

# Commitear
git commit -m "chore: Limpiar cache de Git"
git push
```

### 4. Verificar archivos que se modifican automáticamente

Algunos archivos se modifican automáticamente:

- **Prettier/ESLint**: Formatean código automáticamente
- **TypeScript**: Genera archivos `.tsbuildinfo`
- **Next.js**: Genera archivos en `.next/`
- **IDE**: Guarda configuraciones en `.vscode/`, `.cursor/`

**Solución**: Asegúrate de que estos archivos estén en `.gitignore`.

### 5. Configurar Git para ignorar cambios en archivos rastreados

Si un archivo ya está rastreado pero quieres que Git ignore cambios futuros:

```bash
# Ejemplo: ignorar cambios en un archivo de configuración
git update-index --assume-unchanged archivo.txt

# Para volver a rastrear cambios
git update-index --no-assume-unchanged archivo.txt
```

### 6. Verificar configuración de Cursor/VS Code

Asegúrate de que Cursor no esté guardando cambios automáticamente:

1. Abre configuración: `Ctrl+,` (o `Cmd+,` en Mac)
2. Busca: `files.autoSave`
3. Configura como: `"off"` o `"afterDelay"` con delay largo

### 7. Verificar hooks de Git

Si tienes hooks de Git (pre-commit, etc.) que modifican archivos:

```bash
# Ver hooks activos
ls -la .git/hooks/

# Si hay hooks que modifican archivos, revisarlos
cat .git/hooks/pre-commit
```

## Archivos Comunes que Causan Problemas

### ✅ Deben estar en .gitignore:

- `.env`, `.env.local`, `.env.*.local`
- `node_modules/`
- `.next/`, `dist/`, `build/`
- `.vscode/`, `.cursor/`, `.idea/`
- `*.log`
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)
- `.cache/`, `*.tsbuildinfo`

### ❌ NO deben estar en .gitignore:

- Archivos de código fuente (`.ts`, `.tsx`, `.js`, `.jsx`)
- Archivos de configuración importantes (`package.json`, `tsconfig.json`)
- Archivos de documentación (`.md`)

## Checklist para Evitar Cambios No Deseados

- [ ] `.gitignore` está actualizado con todos los archivos que se generan automáticamente
- [ ] No hay archivos `.env` rastreados (deben estar en `.gitignore`)
- [ ] `node_modules/` no está rastreado
- [ ] Archivos de build (`.next/`, `dist/`) no están rastreados
- [ ] Configuración de IDE (`.vscode/`, `.cursor/`) no está rastreada
- [ ] Archivos de log no están rastreados
- [ ] Cache de Git está limpio (`git rm -r --cached .` si es necesario)

## Comandos Útiles

```bash
# Ver qué archivos están siendo ignorados
git status --ignored

# Ver archivos no rastreados
git ls-files --others --exclude-standard

# Limpiar archivos no rastreados (CUIDADO: elimina archivos)
git clean -fd

# Ver qué archivos están en el cache pero deberían ignorarse
git ls-files | grep -E "(\.env|node_modules|\.next|dist)"

# Verificar si un archivo está siendo ignorado
git check-ignore -v archivo.txt
```

## Si el Problema Persiste

1. **Verifica qué archivos específicos están cambiando**:
   ```bash
   git status --short
   ```

2. **Revisa el historial de commits** para ver si esos archivos se modifican automáticamente:
   ```bash
   git log --oneline --all -- archivo-problematico.txt
   ```

3. **Verifica si hay scripts de pre-commit o post-commit** que modifican archivos:
   ```bash
   cat .git/hooks/pre-commit
   ```

4. **Considera usar `git update-index --assume-unchanged`** para archivos que se modifican pero no quieres commitear.

