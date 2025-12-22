# 🔑 Configurar Keystore en EAS - Guía Rápida

## 📋 Cuando EAS Pide Nombre para Build Credentials

Cuando ejecutas `eas credentials` y seleccionas "Set up a new keystore", EAS te pedirá:

```
? Assign a name to your build credentials: › Build Credentials Z1yAtGGy9c
```

### ✅ Qué Hacer

**Acepta el nombre sugerido** (presiona Enter)

El nombre es solo un identificador único para tus credenciales. No afecta la funcionalidad de la app ni el SHA-1.

### 💡 Opciones

- **Opción 1 (Recomendada)**: Acepta el nombre sugerido
  - Presiona Enter
  - EAS generará el keystore automáticamente

- **Opción 2**: Usa un nombre personalizado
  - Escribe un nombre descriptivo (ej: "AMVA Mobile Production")
  - Presiona Enter

**Ambas opciones funcionan igual**, el nombre es solo para identificación.

---

## 🔍 Después de Configurar el Keystore

Una vez que aceptes el nombre, EAS:

1. Generará un nuevo keystore automáticamente
2. Te mostrará el **SHA-1** del keystore
3. Guardará las credenciales en sus servidores

**IMPORTANTE**: Copia el SHA-1 que aparezca después de crear el keystore.

---

## 📋 Pasos Completos

1. `eas credentials`
2. Selecciona: **Android**
3. Selecciona: **Keystore: Manage everything needed to build your project**
4. Selecciona: **Set up a new keystore**
5. Acepta el nombre sugerido (presiona Enter)
6. EAS generará el keystore
7. **Copia el SHA-1** que aparezca
8. Agrégalo en Google Cloud Console

---

## ⚠️ Nota Importante

Si ya tenías un keystore configurado y estás creando uno nuevo:
- El SHA-1 cambiará
- Necesitarás agregar el nuevo SHA-1 en Google Cloud Console
- El SHA-1 anterior dejará de funcionar

---

## 🎯 Resumen

**Solo presiona Enter** para aceptar el nombre sugerido y continuar.

