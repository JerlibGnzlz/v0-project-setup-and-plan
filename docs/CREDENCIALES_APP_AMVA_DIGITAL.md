# Flujo de credenciales: App móvil y AMVA Digital

## Flujo principal: solicitud desde la app móvil

El flujo estándar es el que **siempre ha estado**:

1. La persona inicia sesión en la app (Google o correo).
2. En la pestaña **Credenciales** puede **solicitar** una credencial (ministerial o capellanía) desde la app.
3. En AMVA Digital el admin ve la solicitud, la aprueba y **crea la credencial** vinculada a ese invitado (`invitadoId`).
4. La persona vuelve a la app, abre **Credenciales**, y ve su credencial (el backend la busca por `invitadoId`).

Este flujo no depende de email ni DNI: la credencial queda asociada al usuario por `invitadoId` desde el momento en que el admin la crea desde la solicitud.

---

## Flujo complementario: credencial creada en AMVA Digital

Si la credencial se **creó directamente en AMVA Digital** (sin solicitud desde la app), el backend intenta vincularla cuando la persona abre Credenciales en la app:

- **Por email:** La credencial tiene el campo "Email para app móvil" con el mismo correo con el que la persona inicia sesión en la app → se muestra y se vincula.
- **Por DNI:** La persona tiene inscripciones (p. ej. convención) con ese DNI → se busca la credencial por documento y se vincula.

Orden de búsqueda en el backend:

1. Por **invitadoId** (solicitud desde la app → credencial ya vinculada).
2. Por **email** (creada en admin con ese correo).
3. Por **DNI** (desde inscripciones del invitado).

---

## Resumen

| Flujo | Origen | Cómo se ve en la app |
|-------|--------|----------------------|
| **Principal** | Solicitud desde la app → admin crea credencial | Se muestra al abrir Credenciales (vinculada por `invitadoId`). |
| Complementario | Creada en AMVA Digital con email/DNI | Se busca por email o DNI y se vincula al abrir Credenciales. |

El flujo de **solicitud por la app** se mantiene como estaba y es la vía principal para que un usuario obtenga y vea su credencial.
